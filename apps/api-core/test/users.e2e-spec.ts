import request from 'supertest';
import { getTestApp } from './setup';

describe('UsersController (e2e)', () => {
  // Generate UUID-like deviceId (36+ characters required)
  const generateDeviceId = () =>
    `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;

  const authPayload = (deviceId: string, platform: 'ios' | 'android' | 'web' = 'ios') => ({
    deviceId,
    platform,
    appVersion: '1.0.0',
  });

  let accessToken: string;

  beforeAll(async () => {
    const deviceId = generateDeviceId();

    const auth = await request(getTestApp().getHttpServer())
      .post('/api/v1/auth/device')
      .send(authPayload(deviceId, 'ios'));

    accessToken = auth.body.accessToken;
  });

  describe('GET /api/v1/users/me', () => {
    it('should return user profile with valid auth', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('settings');
      expect(response.body.settings).toHaveProperty('locale');
      expect(response.body).toHaveProperty('subscriptionType');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should reject request without auth', async () => {
      await request(getTestApp().getHttpServer()).get('/api/v1/users/me').expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(getTestApp().getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('should update user settings', async () => {
      const response = await request(getTestApp().getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          settings: {
            locale: 'uz',
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('settings');
      expect(response.body.settings).toHaveProperty('locale', 'uz');
    });

    it('should update user citizenship', async () => {
      const response = await request(getTestApp().getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          citizenshipCode: 'UZB',
        })
        .expect(200);

      expect(response.body).toHaveProperty('citizenshipCode', 'UZB');
    });

    it('should update entry date', async () => {
      const response = await request(getTestApp().getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          entryDate: '2024-01-15',
        })
        .expect(200);

      expect(response.body).toHaveProperty('entryDate');
    });

    it('should reject invalid citizenship code length', async () => {
      await request(getTestApp().getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          citizenshipCode: 'US', // Should be 3 characters
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
        .expect(201); // POST returns 201 by default in NestJS

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
        .expect(201);

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
        .send(authPayload(newDeviceId, 'android'));

      const response = await request(getTestApp().getHttpServer())
        .post('/api/v1/users/onboarding/complete')
        .set('Authorization', `Bearer ${auth.body.accessToken}`)
        .send({
          citizenshipCode: 'TJK', // 3-letter ISO code
          entryDate: '2024-01-15',
          purpose: 'work',
        })
        .expect(201); // POST returns 201 by default in NestJS

      expect(response.body).toHaveProperty('onboardingCompletedAt');
      expect(response.body.onboardingCompletedAt).not.toBeNull();
      expect(response.body).toHaveProperty('citizenshipCode', 'TJK');
      expect(response.body).toHaveProperty('visitPurpose', 'work');
    });

    it('should reject incomplete onboarding data', async () => {
      const newDeviceId = generateDeviceId();
      const auth = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send(authPayload(newDeviceId, 'ios'));

      await request(getTestApp().getHttpServer())
        .post('/api/v1/users/onboarding/complete')
        .set('Authorization', `Bearer ${auth.body.accessToken}`)
        .send({
          citizenshipCode: 'UZB',
          // missing entryDate and purpose
        })
        .expect(400);
    });

    it('should reject invalid citizenship code', async () => {
      const newDeviceId = generateDeviceId();
      const auth = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send(authPayload(newDeviceId, 'ios'));

      await request(getTestApp().getHttpServer())
        .post('/api/v1/users/onboarding/complete')
        .set('Authorization', `Bearer ${auth.body.accessToken}`)
        .send({
          citizenshipCode: 'US', // Should be 3 characters
          entryDate: '2024-01-15',
          purpose: 'work',
        })
        .expect(400);
    });

    it('should reject invalid purpose', async () => {
      const newDeviceId = generateDeviceId();
      const auth = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send(authPayload(newDeviceId, 'ios'));

      await request(getTestApp().getHttpServer())
        .post('/api/v1/users/onboarding/complete')
        .set('Authorization', `Bearer ${auth.body.accessToken}`)
        .send({
          citizenshipCode: 'UZB',
          entryDate: '2024-01-15',
          purpose: 'invalid_purpose', // Invalid enum value
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
        .send(authPayload(newDeviceId, 'ios'));

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
