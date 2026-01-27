import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService, AuditLogData } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let auditLogRepository: jest.Mocked<Repository<AuditLog>>;

  const mockAuditLog: Partial<AuditLog> = {
    id: 'audit-uuid-123',
    userId: 'user-uuid-123',
    action: 'GET',
    resource: '/api/users/profile',
    requestBody: null,
    responseStatus: 200,
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    durationMs: 50,
    createdAt: new Date(),
  };

  const mockAuditData: AuditLogData = {
    userId: 'user-uuid-123',
    action: 'GET',
    resource: '/api/users/profile',
    requestBody: null,
    responseStatus: 200,
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    durationMs: 50,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    auditLogRepository = module.get(getRepositoryToken(AuditLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should create audit log entry', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.log(mockAuditData);

      expect(auditLogRepository.create).toHaveBeenCalledWith({
        userId: mockAuditData.userId,
        action: mockAuditData.action,
        resource: mockAuditData.resource,
        requestBody: null,
        responseStatus: mockAuditData.responseStatus,
        ipAddress: mockAuditData.ipAddress,
        userAgent: mockAuditData.userAgent,
        durationMs: mockAuditData.durationMs,
      });
      expect(auditLogRepository.save).toHaveBeenCalled();
    });

    it('should capture user_id from request', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.log({
        ...mockAuditData,
        userId: 'specific-user-id',
      });

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'specific-user-id',
        }),
      );
    });

    it('should handle null user_id', async () => {
      auditLogRepository.create.mockReturnValue({
        ...mockAuditLog,
        userId: null,
      } as AuditLog);
      auditLogRepository.save.mockResolvedValue({
        ...mockAuditLog,
        userId: null,
      } as AuditLog);

      await service.log({
        ...mockAuditData,
        userId: null,
      });

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: null,
        }),
      );
    });

    it('should capture request details', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      const requestBody = { name: 'John', email: 'john@example.com' };
      await service.log({
        ...mockAuditData,
        action: 'POST',
        requestBody,
      });

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'POST',
          requestBody,
        }),
      );
    });

    it('should use default values for missing fields', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.log({
        userId: undefined,
        action: 'GET',
        resource: '/api/test',
        responseStatus: 200,
        ipAddress: '',
        userAgent: '',
        durationMs: 100,
      });

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: null,
          ipAddress: 'unknown',
          userAgent: 'unknown',
        }),
      );
    });

    it('should not throw on save error', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockRejectedValue(new Error('Database error'));

      // Should not throw - audit logging should be silent
      await expect(service.log(mockAuditData)).resolves.not.toThrow();
    });

    it('should log error on save failure', async () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'error');
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockRejectedValue(new Error('Database error'));

      await service.log(mockAuditData);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to save audit log',
        expect.any(Error),
      );
    });

    it('should handle request body with null', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.log({
        ...mockAuditData,
        requestBody: null,
      });

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: null,
        }),
      );
    });

    it('should handle request body with undefined', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.log({
        ...mockAuditData,
        requestBody: undefined,
      });

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: null,
        }),
      );
    });

    it('should store duration in milliseconds', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.log({
        ...mockAuditData,
        durationMs: 1234,
      });

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          durationMs: 1234,
        }),
      );
    });

    it('should store HTTP method correctly', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']) {
        await service.log({
          ...mockAuditData,
          action: method,
        });

        expect(auditLogRepository.create).toHaveBeenLastCalledWith(
          expect.objectContaining({
            action: method,
          }),
        );
      }
    });

    it('should store various response statuses', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      for (const status of [200, 201, 400, 401, 403, 404, 500]) {
        await service.log({
          ...mockAuditData,
          responseStatus: status,
        });

        expect(auditLogRepository.create).toHaveBeenLastCalledWith(
          expect.objectContaining({
            responseStatus: status,
          }),
        );
      }
    });
  });
});
