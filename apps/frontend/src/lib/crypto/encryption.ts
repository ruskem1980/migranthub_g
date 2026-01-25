'use client';

/**
 * Модуль шифрования данных с использованием Web Crypto API
 * Алгоритм: AES-GCM (256-bit)
 */

// Константы
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits для GCM
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

// Интерфейс для зашифрованных данных
export interface EncryptedData {
  ciphertext: string; // Base64
  iv: string; // Base64
  salt: string; // Base64
}

/**
 * Преобразует ArrayBuffer в Base64 строку
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Преобразует Base64 строку в ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer.slice(0) as ArrayBuffer;
}

/**
 * Генерирует криптографический ключ из deviceId с использованием PBKDF2
 */
async function deriveKeyFromDeviceId(
  deviceId: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(deviceId),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer.slice(0) as ArrayBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Генерирует случайный вектор инициализации (IV)
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Генерирует случайную соль
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Шифрует данные с использованием AES-GCM
 *
 * @param data - Данные для шифрования (объект или строка)
 * @param deviceId - ID устройства для генерации ключа
 * @returns Зашифрованные данные в формате EncryptedData
 */
export async function encryptData(
  data: unknown,
  deviceId: string
): Promise<EncryptedData> {
  if (!deviceId) {
    throw new Error('Device ID is required for encryption');
  }

  const encoder = new TextEncoder();
  const jsonString = JSON.stringify(data);
  const dataBuffer = encoder.encode(jsonString);

  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKeyFromDeviceId(deviceId, salt);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv.buffer.slice(0) as ArrayBuffer,
    },
    key,
    dataBuffer
  );

  return {
    ciphertext: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer.slice(0) as ArrayBuffer),
    salt: arrayBufferToBase64(salt.buffer.slice(0) as ArrayBuffer),
  };
}

/**
 * Расшифровывает данные
 *
 * @param encrypted - Зашифрованные данные
 * @param deviceId - ID устройства для генерации ключа
 * @returns Расшифрованные данные
 */
export async function decryptData<T = unknown>(
  encrypted: EncryptedData,
  deviceId: string
): Promise<T> {
  if (!deviceId) {
    throw new Error('Device ID is required for decryption');
  }

  const salt = new Uint8Array(base64ToArrayBuffer(encrypted.salt));
  const iv = new Uint8Array(base64ToArrayBuffer(encrypted.iv));
  const ciphertext = base64ToArrayBuffer(encrypted.ciphertext);

  const key = await deriveKeyFromDeviceId(deviceId, salt);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: iv.buffer.slice(0) as ArrayBuffer,
    },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  const jsonString = decoder.decode(decryptedBuffer);

  return JSON.parse(jsonString) as T;
}

/**
 * Проверяет, являются ли данные зашифрованными
 */
export function isEncryptedData(data: unknown): data is EncryptedData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return (
    typeof obj.ciphertext === 'string' &&
    typeof obj.iv === 'string' &&
    typeof obj.salt === 'string'
  );
}

/**
 * Генерирует случайный ключ шифрования (для будущего использования с Cloud Safe)
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable для экспорта
    ['encrypt', 'decrypt']
  );
}

/**
 * Экспортирует ключ в формате JWK (для Cloud Safe)
 */
export async function exportKey(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey('jwk', key);
}

/**
 * Импортирует ключ из формата JWK
 */
export async function importKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Хеширует данные с SHA-256 (для проверки целостности)
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return arrayBufferToBase64(hashBuffer);
}
