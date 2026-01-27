import request from 'supertest';
import { getTestApp } from './setup';

describe('AuthController (e2e)', () => {
  const generateDeviceId = () =>
    `test-device-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  const authPayload = (
    deviceId: string,
    platform: 'ios' | 'android' | 'web' = 'ios',
  ) => ({
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
      expect(response.body).toHaveProperty('recoveryCode');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(typeof response.body.accessToken).toBe('string');
      expect(typeof response.body.refreshToken).toBe('string');
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

      expect(first.body.user.id).toBe(second.body.user.id);
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
      // New tokens should be different
      expect(response.body.accessToken).not.toBe(register.body.accessToken);
    });

    it('should reject invalid refresh token', async () => {
      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token-12345' })
        .expect(401);
    });

    it('should reject missing refresh token', async () => {
      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/recovery/verify', () => {
    it('should verify valid recovery code', async () => {
      const deviceId = generateDeviceId();

      const register = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send(authPayload(deviceId, 'ios'))
        .expect(200);

      const newDeviceId = generateDeviceId();

      const response = await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/recovery/verify')
        .send({
          oldDeviceId: deviceId,
          newDeviceId,
          recoveryCode: register.body.recoveryCode,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('newRecoveryCode');
      // New recovery code should be different
      expect(response.body.newRecoveryCode).not.toBe(register.body.recoveryCode);
    });

    it('should reject invalid recovery code', async () => {
      const deviceId = generateDeviceId();

      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/device')
        .send(authPayload(deviceId, 'ios'))
        .expect(200);

      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/recovery/verify')
        .send({
          oldDeviceId: deviceId,
          newDeviceId: generateDeviceId(),
          recoveryCode: 'WRONG-CODE-12345',
        })
        .expect(401);
    });

    it('should reject recovery for non-existent device', async () => {
      await request(getTestApp().getHttpServer())
        .post('/api/v1/auth/recovery/verify')
        .send({
          oldDeviceId: 'non-existent-device',
          newDeviceId: generateDeviceId(),
          recoveryCode: 'SOME-CODE-12345',
        })
        .expect(401);
    });
  });
});
