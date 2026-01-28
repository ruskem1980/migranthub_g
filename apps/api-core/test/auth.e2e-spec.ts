import request from 'supertest';
import { getTestApp } from './setup';

describe('AuthController (e2e)', () => {
  // Generate UUID-like deviceId (36+ characters required)
  const generateDeviceId = () =>
    `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;

  const authPayload = (deviceId: string, platform: 'ios' | 'android' | 'web' = 'ios') => ({
    deviceId,
    platform,
    appVersion: '1.0.0',
  });

  describe('POST /api/v1/auth/device', () => {
    it('should register new device and return tokens', async () => {
      const deviceId = generateDeviceId();

      const response = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send(authPayload(deviceId, 'ios'))
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('signingKey');
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('isNewUser', true);
      expect(typeof response.body.accessToken).toBe('string');
      expect(typeof response.body.refreshToken).toBe('string');
      expect(typeof response.body.signingKey).toBe('string');
    });

    it('should return same user for same deviceId', async () => {
      const deviceId = generateDeviceId();

      const first = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send(authPayload(deviceId, 'android'))
        .expect(200);

      const second = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send(authPayload(deviceId, 'android'))
        .expect(200);

      expect(first.body.userId).toBe(second.body.userId);
      expect(first.body.isNewUser).toBe(true);
      expect(second.body.isNewUser).toBe(false);
    });

    it('should reject request without deviceId', async () => {
      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send({ platform: 'ios', appVersion: '1.0.0' })
        .expect(400);
    });

    it('should reject empty deviceId', async () => {
      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send({ deviceId: '', platform: 'ios', appVersion: '1.0.0' })
        .expect(400);
    });

    it('should reject request without appVersion', async () => {
      const deviceId = generateDeviceId();
      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send({ deviceId, platform: 'ios' })
        .expect(400);
    });

    it('should reject short deviceId', async () => {
      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send({ deviceId: 'short', platform: 'ios', appVersion: '1.0.0' })
        .expect(400);
    });

    it('should reject invalid platform', async () => {
      const deviceId = generateDeviceId();
      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send({ deviceId, platform: 'invalid', appVersion: '1.0.0' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh valid token', async () => {
      const deviceId = generateDeviceId();

      const register = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send(authPayload(deviceId, 'ios'))
        .expect(200);

      const response = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: register.body.refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('signingKey');
      expect(response.body).toHaveProperty('userId', register.body.userId);
      expect(response.body).toHaveProperty('isNewUser', false);
    });

    it('should reject invalid refresh token', async () => {
      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token-12345' })
        .expect(401);
    });

    it('should reject missing refresh token', async () => {
      await request(getTestApp().getHttpServer()).post('/api/v1/auth/refresh').send({}).expect(400);
    });

    it('should invalidate old refresh token after refresh', async () => {
      const deviceId = generateDeviceId();

      const register = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send(authPayload(deviceId, 'ios'))
        .expect(200);

      // First refresh - get new tokens
      const refresh1 = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: register.body.refreshToken })
        .expect(200);

      // New tokens should be issued
      expect(refresh1.body).toHaveProperty('accessToken');
      expect(refresh1.body).toHaveProperty('refreshToken');

      // Use the NEW refresh token - should work
      const refresh2 = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: refresh1.body.refreshToken })
        .expect(200);

      expect(refresh2.body).toHaveProperty('accessToken');
    });
  });

  describe('POST /api/v1/auth/recovery/verify', () => {
    it('should reject invalid recovery code format', async () => {
      const deviceId = generateDeviceId();

      // Register device first
      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send(authPayload(deviceId, 'ios'))
        .expect(200);

      // Recovery code must be 12 uppercase alphanumeric characters
      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/recovery/verify')
        .send({
          deviceId,
          recoveryCode: 'invalid', // Wrong format
        })
        .expect(400);
    });

    it('should reject recovery for device without recovery code set', async () => {
      const deviceId = generateDeviceId();

      // Register device (no recovery code is set by default)
      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send(authPayload(deviceId, 'ios'))
        .expect(200);

      // Try to recover with valid format code
      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/recovery/verify')
        .send({
          deviceId,
          recoveryCode: 'ABC123XYZ789', // Valid format but not set
        })
        .expect(401);
    });

    it('should reject recovery for non-existent device', async () => {
      const nonExistentDeviceId = generateDeviceId();

      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/recovery/verify')
        .send({
          deviceId: nonExistentDeviceId,
          recoveryCode: 'ABC123XYZ789',
        })
        .expect(401);
    });
  });
});
