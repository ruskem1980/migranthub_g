import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('check', () => {
    it('should return health status', () => {
      const result = controller.check();

      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.version).toBe('1.0.0');
    });

    it('should return valid timestamp', () => {
      const beforeCheck = new Date().toISOString();
      const result = controller.check();
      const afterCheck = new Date().toISOString();

      expect(result.timestamp).toBeDefined();
      // Timestamp should be between before and after check
      expect(result.timestamp >= beforeCheck).toBe(true);
      expect(result.timestamp <= afterCheck).toBe(true);
    });

    it('should return correct response shape', () => {
      const result = controller.check();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('version');
      expect(typeof result.status).toBe('string');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.version).toBe('string');
    });

    it('should return ISO 8601 timestamp format', () => {
      const result = controller.check();

      // ISO 8601 format check
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      expect(result.timestamp).toMatch(isoRegex);
    });
  });
});
