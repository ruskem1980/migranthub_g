import request from 'supertest';
import { getTestApp } from './setup';

describe('HealthController (e2e)', () => {
  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');

      // Verify timestamp is valid ISO date
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
    });

    it('should return valid version', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should be accessible without authentication', async () => {
      // No auth header, should still work
      await request(getTestApp().getHttpServer()).get('/api/v1/health').expect(200);
    });
  });
});
