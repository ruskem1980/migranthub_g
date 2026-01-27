import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Request } from 'express';
import { SigningService } from './signing.service';
import { User } from '../users/entities/user.entity';

describe('SigningService', () => {
  let service: SigningService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockSigningKey = 'c'.repeat(64);
  const mockUser: Partial<User> = {
    id: 'user-uuid-123',
    signingKey: mockSigningKey,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SigningService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SigningService>(SigningService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSigningKey', () => {
    it('should generate 32-byte key (64 hex chars)', () => {
      const key = service.generateSigningKey();

      expect(key).toHaveLength(64);
      expect(key).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate unique keys each time', () => {
      const keys = new Set<string>();

      for (let i = 0; i < 100; i++) {
        keys.add(service.generateSigningKey());
      }

      expect(keys.size).toBe(100);
    });
  });

  describe('computeSignature', () => {
    it('should compute HMAC-SHA256 signature', () => {
      const timestamp = '1704067200000';
      const method = 'POST';
      const path = '/api/users/profile';
      const body = '{"name":"test"}';

      const signature = service.computeSignature(
        timestamp,
        method,
        path,
        body,
        mockSigningKey,
      );

      // Verify it's a valid base64 string
      expect(() => Buffer.from(signature, 'base64')).not.toThrow();

      // Verify it produces consistent results
      const signature2 = service.computeSignature(
        timestamp,
        method,
        path,
        body,
        mockSigningKey,
      );
      expect(signature).toBe(signature2);
    });

    it('should normalize method to uppercase', () => {
      const timestamp = '1704067200000';
      const path = '/api/test';
      const body = '';

      const sig1 = service.computeSignature(timestamp, 'get', path, body, mockSigningKey);
      const sig2 = service.computeSignature(timestamp, 'GET', path, body, mockSigningKey);

      expect(sig1).toBe(sig2);
    });

    it('should produce different signatures for different inputs', () => {
      const timestamp = '1704067200000';
      const method = 'GET';
      const path = '/api/test';
      const body = '';

      const sig1 = service.computeSignature(timestamp, method, path, body, mockSigningKey);
      const sig2 = service.computeSignature(timestamp, method, path + '?q=1', body, mockSigningKey);
      const sig3 = service.computeSignature('1704067200001', method, path, body, mockSigningKey);

      expect(sig1).not.toBe(sig2);
      expect(sig1).not.toBe(sig3);
    });
  });

  describe('verifySignature', () => {
    const createMockRequest = (overrides: Partial<Request> = {}): Request => {
      const timestamp = Date.now().toString();
      const method = 'POST';
      const path = '/api/users/profile';
      const body = { name: 'test' };

      // Compute valid signature
      const message = timestamp + method + path + JSON.stringify(body);
      const hmac = crypto.createHmac('sha256', mockSigningKey);
      hmac.update(message);
      const signature = hmac.digest('base64');

      return {
        headers: {
          'x-signature': signature,
          'x-timestamp': timestamp,
        },
        method,
        originalUrl: path,
        url: path,
        body,
        ...overrides,
      } as unknown as Request;
    };

    it('should verify valid signature', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      const request = createMockRequest();

      const result = await service.verifySignature(request, mockUser.id!);

      expect(result).toBe(true);
    });

    it('should reject missing signature header', async () => {
      const request = createMockRequest({
        headers: { 'x-timestamp': Date.now().toString() },
      } as Partial<Request>);

      await expect(service.verifySignature(request, mockUser.id!)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject missing timestamp header', async () => {
      const request = createMockRequest({
        headers: { 'x-signature': 'some-signature' },
      } as Partial<Request>);

      await expect(service.verifySignature(request, mockUser.id!)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject invalid timestamp format', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      const request = createMockRequest();
      (request.headers as Record<string, string>)['x-timestamp'] = 'not-a-number';

      await expect(service.verifySignature(request, mockUser.id!)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject expired timestamp (>5 min)', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      const oldTimestamp = (Date.now() - 6 * 60 * 1000).toString(); // 6 minutes ago

      const request = createMockRequest();
      (request.headers as Record<string, string>)['x-timestamp'] = oldTimestamp;

      await expect(service.verifySignature(request, mockUser.id!)).rejects.toThrow(
        'Request timestamp expired',
      );
    });

    it('should reject timestamp from far future', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      const futureTimestamp = (Date.now() + 2 * 60 * 1000).toString(); // 2 minutes in future

      const request = createMockRequest();
      (request.headers as Record<string, string>)['x-timestamp'] = futureTimestamp;

      await expect(service.verifySignature(request, mockUser.id!)).rejects.toThrow(
        'Invalid timestamp',
      );
    });

    it('should allow small clock skew (< 1 minute)', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      const slightlyFuture = Date.now() + 30000; // 30 seconds in future

      // Create request with slightly future timestamp
      const method = 'GET';
      const path = '/api/test';
      const body = {};
      const timestamp = slightlyFuture.toString();

      const message = timestamp + method + path + '';
      const hmac = crypto.createHmac('sha256', mockSigningKey);
      hmac.update(message);
      const signature = hmac.digest('base64');

      const request = {
        headers: {
          'x-signature': signature,
          'x-timestamp': timestamp,
        },
        method,
        originalUrl: path,
        body,
      } as unknown as Request;

      const result = await service.verifySignature(request, mockUser.id!);
      expect(result).toBe(true);
    });

    it('should reject invalid signature', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      const request = createMockRequest();
      (request.headers as Record<string, string>)['x-signature'] = Buffer.from('invalid').toString('base64');

      await expect(service.verifySignature(request, mockUser.id!)).rejects.toThrow(
        'Invalid signature',
      );
    });

    it('should reject if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const request = createMockRequest();

      await expect(service.verifySignature(request, 'unknown-user')).rejects.toThrow(
        'Signing key not found',
      );
    });

    it('should reject if user has no signing key', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUser, signingKey: null } as User);
      const request = createMockRequest();

      await expect(service.verifySignature(request, mockUser.id!)).rejects.toThrow(
        'Signing key not found',
      );
    });

    it('should handle empty body correctly', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      const timestamp = Date.now().toString();
      const method = 'GET';
      const path = '/api/test';
      const body = {};

      const message = timestamp + method + path + '';
      const hmac = crypto.createHmac('sha256', mockSigningKey);
      hmac.update(message);
      const signature = hmac.digest('base64');

      const request = {
        headers: {
          'x-signature': signature,
          'x-timestamp': timestamp,
        },
        method,
        originalUrl: path,
        body,
      } as unknown as Request;

      const result = await service.verifySignature(request, mockUser.id!);
      expect(result).toBe(true);
    });

    it('should use timing-safe comparison', async () => {
      // This test verifies that the service uses crypto.timingSafeEqual
      // We can't directly test timing-safe comparison, but we can verify
      // that signatures of wrong length are rejected
      userRepository.findOne.mockResolvedValue(mockUser as User);
      const request = createMockRequest();

      // Use a signature of different length
      (request.headers as Record<string, string>)['x-signature'] = 'short';

      await expect(service.verifySignature(request, mockUser.id!)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
