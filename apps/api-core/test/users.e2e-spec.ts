import request from 'supertest';
import { getTestApp } from './setup';

describe('UsersController (e2e)', () => {
  const generateDeviceId = () => `test-device-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  let accessToken: string;
  let deviceId: string;

  beforeAll(async () => {
    deviceId = generateDeviceId();

    const auth = await request(getTestApp().getHttpServer())
      .post('/api/v1/auth/device')
      .send({ deviceId, platform: 'ios' });

    accessToken = auth.body.accessToken;
  });

  describe('GET /api/v1/users/me', () => {
    it('should return user profile with valid auth', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('deviceId');
      expect(response.body.deviceId).toBe(deviceId);
    });

    it('should reject request without auth', async () => {
      await request(getTestApp().getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(getTestApp().getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('should update user profile', async () => {
      const response = await request(getTestApp().getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          preferredLanguage: 'ru',
        })
        .expect(200);

      expect(response.body).toHaveProperty('preferredLanguage', 'ru');
    });

    it('should reject invalid data', async () => {
      await request(getTestApp().getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          preferredLanguage: 'invalid-language',
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/users/calculate', () => {
    it('should calculate deadlines for entry date', async () => {
      const response = await request(getTestApp().getHttpServer())
        .post('/api/v1/users/calculate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ entryDate: '2024-01-15' })
        .expect(200);

      expect(response.body).toHaveProperty('registration');
      expect(response.body).toHaveProperty('stay90Days');
      expect(response.body).toHaveProperty('stayLimit180');
      expect(response.body).toHaveProperty('calculatedAt');

      expect(response.body.registration).toHaveProperty('date');
      expect(response.body.registration).toHaveProperty('daysRemaining');
      expect(response.body.registration).toHaveProperty('status');
    });

    it('should calculate deadlines with patent date', async () => {
      const response = await request(getTestApp().getHttpServer())
        .post('/api/v1/users/calculate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          entryDate: '2024-01-15',
          patentDate: '2024-02-01',
          purpose: 'work',
        })
        .expect(200);

      expect(response.body).toHaveProperty('patentPayment');
      expect(response.body.patentPayment).toHaveProperty('date');
    });

    it('should reject invalid date format', async () => {
      await request(getTestApp().getHttpServer())
        .post('/api/v1/users/calculate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ entryDate: 'invalid-date' })
        .expect(400);
    });

    it('should reject missing entry date', async () => {
      await request(getTestApp().getHttpServer())
        .post('/api/v1/users/calculate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('POST /api/v1/users/onboarding/complete', () => {
    it('should complete onboarding with valid data', async () => {
      // Create fresh user for onboarding test
      const newDeviceId = generateDeviceId();
      const auth = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send({ deviceId: newDeviceId, platform: 'android' });

      const response = await request(getTestApp().getHttpServer())
        .post('/api/v1/users/onboarding/complete')
        .set('Authorization', `Bearer ${auth.body.accessToken}`)
        .send({
          citizenship: 'TJ',
          entryDate: '2024-01-15',
          purpose: 'work',
          preferredLanguage: 'tg',
        })
        .expect(200);

      expect(response.body).toHaveProperty('onboardingCompleted', true);
      expect(response.body).toHaveProperty('citizenship', 'TJ');
    });

    it('should reject incomplete onboarding data', async () => {
      const newDeviceId = generateDeviceId();
      const auth = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send({ deviceId: newDeviceId, platform: 'ios' });

      await request(getTestApp().getHttpServer())
        .post('/api/v1/users/onboarding/complete')
        .set('Authorization', `Bearer ${auth.body.accessToken}`)
        .send({
          citizenship: 'TJ',
          // missing required fields
        })
        .expect(400);
    });
  });

  describe('DELETE /api/v1/users/account', () => {
    it('should delete account (soft delete)', async () => {
      // Create fresh user for delete test
      const newDeviceId = generateDeviceId();
      const auth = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send({ deviceId: newDeviceId, platform: 'ios' });

      await request(getTestApp().getHttpServer())
        .delete('/api/v1/users/account')
        .set('Authorization', `Bearer ${auth.body.accessToken}`)
        .expect(204);

      // After deletion, token should be invalid
      await request(getTestApp().getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${auth.body.accessToken}`)
        .expect(401);
    });
  });
});
