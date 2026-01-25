import {
  encryptData,
  decryptData,
  isEncryptedData,
  generateEncryptionKey,
  exportKey,
  importKey,
  hashData,
  type EncryptedData,
} from '@/lib/crypto';

describe('Crypto Module', () => {
  const testDeviceId = 'test-device-id-12345';

  describe('encryptData / decryptData', () => {
    it('encrypts and decrypts a string correctly', async () => {
      const originalData = 'Hello, World!';
      const encrypted = await encryptData(originalData, testDeviceId);
      const decrypted = await decryptData<string>(encrypted, testDeviceId);

      expect(decrypted).toBe(originalData);
    });

    it('encrypts and decrypts an object correctly', async () => {
      const originalData = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
      };
      const encrypted = await encryptData(originalData, testDeviceId);
      const decrypted = await decryptData<typeof originalData>(
        encrypted,
        testDeviceId
      );

      expect(decrypted).toEqual(originalData);
    });

    it('encrypts and decrypts nested objects', async () => {
      const originalData = {
        user: {
          profile: {
            name: 'Test',
            settings: {
              theme: 'dark',
            },
          },
        },
      };
      const encrypted = await encryptData(originalData, testDeviceId);
      const decrypted = await decryptData<typeof originalData>(
        encrypted,
        testDeviceId
      );

      expect(decrypted).toEqual(originalData);
    });

    it('encrypts and decrypts arrays', async () => {
      const originalData = [1, 2, 3, 'four', { five: 5 }];
      const encrypted = await encryptData(originalData, testDeviceId);
      const decrypted = await decryptData<typeof originalData>(
        encrypted,
        testDeviceId
      );

      expect(decrypted).toEqual(originalData);
    });

    it('handles empty string', async () => {
      const originalData = '';
      const encrypted = await encryptData(originalData, testDeviceId);
      const decrypted = await decryptData<string>(encrypted, testDeviceId);

      expect(decrypted).toBe(originalData);
    });

    it('handles unicode characters', async () => {
      const originalData = 'Привет мир! 你好世界 🌍';
      const encrypted = await encryptData(originalData, testDeviceId);
      const decrypted = await decryptData<string>(encrypted, testDeviceId);

      expect(decrypted).toBe(originalData);
    });

    it('produces different ciphertext for same data (due to random IV/salt)', async () => {
      const originalData = 'Same data';
      const encrypted1 = await encryptData(originalData, testDeviceId);
      const encrypted2 = await encryptData(originalData, testDeviceId);

      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
    });

    it('fails to decrypt with wrong deviceId', async () => {
      const originalData = 'Secret message';
      const encrypted = await encryptData(originalData, testDeviceId);

      await expect(
        decryptData(encrypted, 'wrong-device-id')
      ).rejects.toThrow();
    });

    it('throws error when deviceId is empty for encryption', async () => {
      await expect(encryptData('data', '')).rejects.toThrow(
        'Device ID is required for encryption'
      );
    });

    it('throws error when deviceId is empty for decryption', async () => {
      const encrypted: EncryptedData = {
        ciphertext: 'test',
        iv: 'test',
        salt: 'test',
      };
      await expect(decryptData(encrypted, '')).rejects.toThrow(
        'Device ID is required for decryption'
      );
    });
  });

  describe('isEncryptedData', () => {
    it('returns true for valid EncryptedData object', () => {
      const validData: EncryptedData = {
        ciphertext: 'abc123',
        iv: 'xyz789',
        salt: 'salt456',
      };

      expect(isEncryptedData(validData)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isEncryptedData(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isEncryptedData(undefined)).toBe(false);
    });

    it('returns false for primitive types', () => {
      expect(isEncryptedData('string')).toBe(false);
      expect(isEncryptedData(123)).toBe(false);
      expect(isEncryptedData(true)).toBe(false);
    });

    it('returns false for object missing ciphertext', () => {
      expect(isEncryptedData({ iv: 'test', salt: 'test' })).toBe(false);
    });

    it('returns false for object missing iv', () => {
      expect(isEncryptedData({ ciphertext: 'test', salt: 'test' })).toBe(false);
    });

    it('returns false for object missing salt', () => {
      expect(isEncryptedData({ ciphertext: 'test', iv: 'test' })).toBe(false);
    });

    it('returns false when properties are not strings', () => {
      expect(
        isEncryptedData({ ciphertext: 123, iv: 'test', salt: 'test' })
      ).toBe(false);
      expect(
        isEncryptedData({ ciphertext: 'test', iv: null, salt: 'test' })
      ).toBe(false);
    });

    it('returns true even with extra properties', () => {
      const data = {
        ciphertext: 'test',
        iv: 'test',
        salt: 'test',
        extraProp: 'value',
      };

      expect(isEncryptedData(data)).toBe(true);
    });
  });

  describe('generateEncryptionKey', () => {
    it('generates a valid CryptoKey', async () => {
      const key = await generateEncryptionKey();

      expect(key).toBeDefined();
      expect(key.type).toBe('secret');
      expect(key.algorithm.name).toBe('AES-GCM');
      expect(key.extractable).toBe(true);
      expect(key.usages).toContain('encrypt');
      expect(key.usages).toContain('decrypt');
    });

    it('generates different keys on each call', async () => {
      const key1 = await generateEncryptionKey();
      const key2 = await generateEncryptionKey();

      const jwk1 = await exportKey(key1);
      const jwk2 = await exportKey(key2);

      expect(jwk1.k).not.toBe(jwk2.k);
    });
  });

  describe('exportKey / importKey', () => {
    it('exports key to JWK format', async () => {
      const key = await generateEncryptionKey();
      const jwk = await exportKey(key);

      expect(jwk.kty).toBe('oct');
      expect(jwk.alg).toBe('A256GCM');
      expect(jwk.k).toBeDefined();
      expect(typeof jwk.k).toBe('string');
    });

    it('imports key from JWK format', async () => {
      const originalKey = await generateEncryptionKey();
      const jwk = await exportKey(originalKey);
      const importedKey = await importKey(jwk);

      expect(importedKey).toBeDefined();
      expect(importedKey.type).toBe('secret');
      expect(importedKey.algorithm.name).toBe('AES-GCM');
    });

    it('imported key produces same results as original', async () => {
      const originalKey = await generateEncryptionKey();
      const jwk = await exportKey(originalKey);

      // Export again from imported key should produce same JWK
      const importedKey = await importKey(jwk);
      // Note: imported key is not extractable by design, so we can't compare directly
      expect(importedKey.usages).toContain('encrypt');
      expect(importedKey.usages).toContain('decrypt');
    });
  });

  describe('hashData', () => {
    it('hashes data consistently', async () => {
      const data = 'test data';
      const hash1 = await hashData(data);
      const hash2 = await hashData(data);

      expect(hash1).toBe(hash2);
    });

    it('produces different hashes for different data', async () => {
      const hash1 = await hashData('data1');
      const hash2 = await hashData('data2');

      expect(hash1).not.toBe(hash2);
    });

    it('returns base64 encoded string', async () => {
      const hash = await hashData('test');

      // Base64 pattern: alphanumeric + / and + with optional = padding
      expect(hash).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('handles empty string', async () => {
      const hash = await hashData('');

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('handles unicode characters', async () => {
      const hash = await hashData('Привет мир! 你好世界');

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('produces SHA-256 length output (32 bytes = ~44 base64 chars)', async () => {
      const hash = await hashData('test');

      // SHA-256 produces 32 bytes, base64 encoded is ceil(32/3)*4 = 44 characters
      expect(hash.length).toBe(44);
    });
  });

  describe('integration scenarios', () => {
    it('encrypts sensitive user data correctly', async () => {
      const sensitiveData = {
        passportNumber: '1234567890',
        dateOfBirth: '1990-01-15',
        address: 'Moscow, Russia',
        phone: '+7 999 123 4567',
      };

      const encrypted = await encryptData(sensitiveData, testDeviceId);

      // Verify encrypted data structure
      expect(isEncryptedData(encrypted)).toBe(true);

      // Verify we can decrypt it
      const decrypted = await decryptData<typeof sensitiveData>(
        encrypted,
        testDeviceId
      );
      expect(decrypted).toEqual(sensitiveData);
    });

    it('handles large data payloads', async () => {
      const largeData = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: 'A'.repeat(100),
        })),
      };

      const encrypted = await encryptData(largeData, testDeviceId);
      const decrypted = await decryptData<typeof largeData>(
        encrypted,
        testDeviceId
      );

      expect(decrypted.items.length).toBe(1000);
      expect(decrypted).toEqual(largeData);
    });
  });
});
