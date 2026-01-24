# Блок 5: Безопасность и Compliance

> Спецификация безопасности MigrantHub и соответствие 152-ФЗ

---

## Содержание

1. [Обзор безопасности](#1-обзор-безопасности)
2. [Шифрование данных](#2-шифрование-данных)
3. [Защита API](#3-защита-api)
4. [AI Security](#4-ai-security)
5. [Аудит и логирование](#5-аудит-и-логирование)
6. [Защита от реверс-инжиниринга](#6-защита-от-реверс-инжиниринга)
7. [Incident Response](#7-incident-response)
8. [Compliance 152-ФЗ](#8-compliance-152-фз)

---

## 1. Обзор безопасности

### 1.1 Security Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ПРИНЦИП 1: LOCAL-FIRST (НИКАКОГО PII НА СЕРВЕРЕ)                           │
│  ════════════════════════════════════════════════                           │
│                                                                              │
│  Устройство пользователя          Сервер                                    │
│  ┌─────────────────────┐         ┌─────────────────────┐                   │
│  │ ✓ ФИО               │         │ ✗ ФИО               │                   │
│  │ ✓ Паспортные данные │  ───►   │ ✓ citizenship_code  │                   │
│  │ ✓ Сканы документов  │ Анон.   │ ✓ region_code       │                   │
│  │ ✓ Адрес, телефон    │ данные  │ ✓ entry_date        │                   │
│  │                     │         │ ✓ telegram_id_hash  │                   │
│  │ AES-256-GCM         │         │                     │                   │
│  └─────────────────────┘         └─────────────────────┘                   │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  ПРИНЦИП 2: DEFENSE IN DEPTH                                                 │
│  ═══════════════════════════                                                │
│                                                                              │
│  Layer 1: Cloudflare WAF/DDoS                                               │
│  Layer 2: Rate Limiting                                                      │
│  Layer 3: Request Signing                                                    │
│  Layer 4: Input Validation                                                   │
│  Layer 5: Business Logic Checks                                             │
│  Layer 6: Database Constraints                                              │
│  Layer 7: Audit Logging                                                      │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  ПРИНЦИП 3: ZERO TRUST AI                                                    │
│  ═════════════════════════                                                   │
│                                                                              │
│  User ──► Client Filter ──► Gateway Filter ──► Proxy Filter ──► OpenAI     │
│              │                  │                  │                        │
│              ▼                  ▼                  ▼                        │
│           Block PII         Log attempt       Kill Switch                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Security Controls Summary

| Control | Implementation | Status |
|---------|----------------|--------|
| Encryption at Rest | AES-256-GCM | ✅ |
| Encryption in Transit | TLS 1.3 | ✅ |
| Authentication | Device ID + HMAC | ✅ |
| Authorization | Role-based | ✅ |
| Input Validation | Zod schemas | ✅ |
| Rate Limiting | Tiered by endpoint | ✅ |
| PII Protection | 3-level filter | ✅ |
| Audit Logging | All actions | ✅ |
| Incident Response | Automated + Manual | ✅ |

---

## 2. Шифрование данных

### 2.1 Field-Level Encryption

```typescript
// lib/crypto/field-encryption.ts

type SensitivityLevel = 'public' | 'private' | 'secret';

const fieldSensitivity: Record<string, SensitivityLevel> = {
  // Public - can be sent to server
  'citizenship': 'public',
  'entry_date': 'public',
  'region': 'public',

  // Private - encrypted locally
  'full_name': 'private',
  'birth_date': 'private',
  'address': 'private',
  'phone': 'private',

  // Secret - double encryption
  'passport_number': 'secret',
  'passport_series': 'secret',
  'passport_scan': 'secret'
};

export async function encryptField(
  field: string,
  value: any
): Promise<EncryptedField> {
  const level = fieldSensitivity[field] || 'private';

  if (level === 'public') {
    return { value, encrypted: false };
  }

  const primaryKey = await getPrimaryKey();

  if (level === 'secret') {
    // Double encryption for passport data
    const secondaryKey = await getSecondaryKey();
    const innerEncrypted = await encrypt(value, primaryKey);
    const outerEncrypted = await encrypt(innerEncrypted, secondaryKey);
    return { value: outerEncrypted, encrypted: true, level: 'secret' };
  }

  // Private - standard encryption
  return {
    value: await encrypt(value, primaryKey),
    encrypted: true,
    level: 'private'
  };
}

export async function decryptField(
  encrypted: EncryptedField
): Promise<any> {
  if (!encrypted.encrypted) {
    return encrypted.value;
  }

  const primaryKey = await getPrimaryKey();

  if (encrypted.level === 'secret') {
    const secondaryKey = await getSecondaryKey();
    const innerEncrypted = await decrypt(encrypted.value, secondaryKey);
    return decrypt(innerEncrypted, primaryKey);
  }

  return decrypt(encrypted.value, primaryKey);
}
```

### 2.2 Key Management

```typescript
// lib/crypto/key-management.ts

import { Keychain } from '@capawesome/capacitor-keychain';

const KEY_CONFIG = {
  PRIMARY_KEY: 'migranthub_primary_key',
  SECONDARY_KEY: 'migranthub_secondary_key',
  API_SECRET: 'migranthub_api_secret'
};

export async function initializeKeys(): Promise<void> {
  // Check if keys exist
  const primaryExists = await Keychain.get({ key: KEY_CONFIG.PRIMARY_KEY });

  if (!primaryExists.value) {
    // Generate new keys
    const primaryKey = await generateKey();
    const secondaryKey = await generateKey();
    const apiSecret = await generateKey();

    // Store in Keychain (iOS) / Keystore (Android)
    await Keychain.set({
      key: KEY_CONFIG.PRIMARY_KEY,
      value: primaryKey,
      accessibility: 'afterFirstUnlock'
    });

    await Keychain.set({
      key: KEY_CONFIG.SECONDARY_KEY,
      value: secondaryKey,
      accessibility: 'afterFirstUnlock'
    });

    await Keychain.set({
      key: KEY_CONFIG.API_SECRET,
      value: apiSecret,
      accessibility: 'afterFirstUnlock'
    });
  }
}

export async function getPrimaryKey(): Promise<CryptoKey> {
  const { value } = await Keychain.get({ key: KEY_CONFIG.PRIMARY_KEY });
  return importKey(value);
}

async function generateKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}
```

### 2.3 Secure Delete

```typescript
// lib/crypto/secure-delete.ts

export async function secureDelete(key: string): Promise<void> {
  const db = await getDB();

  // 1. Overwrite with random data
  const randomData = crypto.getRandomValues(new Uint8Array(1024));
  await db.put('temp', key, randomData);

  // 2. Delete
  await db.delete('temp', key);

  // 3. For files - multiple overwrites (DoD 5220.22-M)
  if (key.startsWith('file:')) {
    const filePath = key.replace('file:', '');
    await secureFileDelete(filePath);
  }
}

async function secureFileDelete(path: string): Promise<void> {
  const file = await Filesystem.stat({ path });
  const size = file.size;

  // 3 passes of random data
  for (let pass = 0; pass < 3; pass++) {
    const randomData = crypto.getRandomValues(new Uint8Array(size));
    await Filesystem.writeFile({
      path,
      data: arrayBufferToBase64(randomData)
    });
  }

  // Final delete
  await Filesystem.deleteFile({ path });
}
```

### 2.4 Biometric Protection

```typescript
// lib/security/biometrics.ts

import { NativeBiometric } from 'capacitor-native-biometric';

export async function unlockWithBiometrics(): Promise<boolean> {
  const { isAvailable, biometryType } = await NativeBiometric.isAvailable();

  if (!isAvailable) {
    // Fallback to PIN
    return unlockWithPIN();
  }

  try {
    await NativeBiometric.verifyIdentity({
      reason: 'Разблокировать приложение',
      title: 'Подтвердите личность',
      subtitle: biometryType === 'FACE_ID'
        ? 'Используйте Face ID'
        : 'Используйте отпечаток пальца',
      maxAttempts: 3
    });

    return true;
  } catch (error) {
    return false;
  }
}

export async function setupBiometricProtection(): Promise<void> {
  // Store credentials protected by biometrics
  await NativeBiometric.setCredentials({
    username: 'migranthub',
    password: await getPrimaryKeyString(),
    server: 'migranthub.local'
  });
}
```

---

## 3. Защита API

### 3.1 Request Signing

```typescript
// lib/api/signing.ts

export async function signRequest(
  method: string,
  path: string,
  body?: any
): Promise<RequestHeaders> {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomUUID();

  // Build signature base
  const signatureBase = [
    method.toUpperCase(),
    path,
    timestamp,
    nonce,
    body ? JSON.stringify(body) : ''
  ].join('\n');

  // Sign with API secret
  const apiSecret = await getApiSecret();
  const signature = await crypto.subtle.sign(
    { name: 'HMAC', hash: 'SHA-256' },
    apiSecret,
    new TextEncoder().encode(signatureBase)
  );

  return {
    'X-Device-ID': await getDeviceId(),
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
    'X-Signature': btoa(String.fromCharCode(...new Uint8Array(signature)))
  };
}
```

### 3.2 Server-Side Validation

```typescript
// middleware/request-validator.ts

export async function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const timestamp = parseInt(req.headers['x-timestamp'] as string);
  const nonce = req.headers['x-nonce'] as string;
  const signature = req.headers['x-signature'] as string;
  const deviceId = req.headers['x-device-id'] as string;

  // 1. Validate timestamp (±5 minutes)
  const now = Date.now();
  if (Math.abs(now - timestamp) > 300000) {
    return res.status(401).json({
      success: false,
      error: { code: 'REQUEST_EXPIRED', message: 'Запрос устарел' }
    });
  }

  // 2. Check replay (nonce already used?)
  const nonceKey = `nonce:${nonce}`;
  const nonceExists = await redis.exists(nonceKey);
  if (nonceExists) {
    return res.status(401).json({
      success: false,
      error: { code: 'REPLAY_DETECTED', message: 'Повторный запрос' }
    });
  }

  // Store nonce for 10 minutes
  await redis.setex(nonceKey, 600, '1');

  // 3. Validate signature
  const device = await getDevice(deviceId);
  if (!device) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNKNOWN_DEVICE', message: 'Неизвестное устройство' }
    });
  }

  const signatureBase = [
    req.method,
    req.path,
    timestamp.toString(),
    nonce,
    req.body ? JSON.stringify(req.body) : ''
  ].join('\n');

  const expectedSignature = createHmac('sha256', device.apiSecret)
    .update(signatureBase)
    .digest('base64');

  if (signature !== expectedSignature) {
    await incrementFailedAttempts(deviceId);
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_SIGNATURE', message: 'Неверная подпись' }
    });
  }

  next();
}
```

### 3.3 Rate Limiting

```typescript
// middleware/rate-limit.ts

const rateLimits: Record<string, RateLimitConfig> = {
  '/api/v1/auth': { windowMs: 60000, max: 5 },
  '/api/v1/ai/chat': { windowMs: 60000, max: 20 },
  '/api/v1/backup/upload': { windowMs: 3600000, max: 10 },
  '/api/v1/legal': { windowMs: 60000, max: 100 },
  'default': { windowMs: 60000, max: 60 }
};

export function getRateLimiter(path: string) {
  const config = rateLimits[path] || rateLimits['default'];

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    keyGenerator: (req) => req.headers['x-device-id'] as string,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Слишком много запросов',
          retryAfter: Math.ceil(config.windowMs / 1000)
        }
      });
    }
  });
}
```

### 3.4 Anomaly Detection

```typescript
// services/anomaly-detector.ts

export class AnomalyDetector {
  async analyzeRequest(pattern: RequestPattern): Promise<ThreatLevel> {
    const deviceKey = `patterns:${pattern.deviceId}`;
    const history = await redis.lrange(deviceKey, 0, 100);

    const anomalies = {
      highErrorRate: this.checkErrorRate(history),
      unusualTiming: this.checkTiming(history),
      endpointScanning: this.checkEndpointPattern(history),
      botBehavior: this.checkBotBehavior(history),
      impossibleTravel: await this.checkImpossibleTravel(pattern)
    };

    const threatScore = Object.values(anomalies).filter(Boolean).length;

    if (threatScore >= 3) return 'HIGH';
    if (threatScore >= 2) return 'MEDIUM';
    if (threatScore >= 1) return 'LOW';
    return 'NONE';
  }

  private async checkImpossibleTravel(pattern: RequestPattern): Promise<boolean> {
    const lastLocation = await this.getLastLocation(pattern.deviceId);
    if (!lastLocation) return false;

    const currentLocation = await this.geolocate(pattern.ip);
    const distance = this.calculateDistance(lastLocation, currentLocation);
    const hoursElapsed = (Date.now() - lastLocation.timestamp) / 3600000;

    // > 500 km/h is impossible
    return distance / hoursElapsed > 500;
  }

  async handleThreat(deviceId: string, level: ThreatLevel) {
    switch (level) {
      case 'HIGH':
        await this.banDevice(deviceId, 86400); // 24 hours
        await this.alertSecurityTeam({ deviceId, level });
        break;
      case 'MEDIUM':
        await this.setStrictRateLimit(deviceId, 3600);
        break;
      case 'LOW':
        await this.requireCaptcha(deviceId);
        break;
    }
  }
}
```

---

## 4. AI Security

### 4.1 3-Level PII Filter

```typescript
// services/ai-pii-filter.ts

const PII_PATTERNS: Record<string, RegExp[]> = {
  PASSPORT_RU: [
    /\b\d{2}\s?\d{2}\s?\d{6}\b/,
    /серия?\s*\d{4}\s*№?\s*\d{6}/i
  ],
  PASSPORT_FOREIGN: [
    /[A-Z]{1,2}\d{7,9}/,
    /\b[A-Z]{2}\d{7}\b/
  ],
  PHONE_RU: [
    /\+?7[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/,
    /8[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/
  ],
  INN: [/\b\d{10}\b/, /\b\d{12}\b/],
  SNILS: [/\b\d{3}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{2}\b/],
  FULL_NAME: [/[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+(?:ич|овна|евна)/]
};

export class AIPIIFilter {
  // Level 1: Client (before sending)
  static clientFilter(message: string): FilterResult {
    const detected = this.detectPII(message);

    if (detected.length > 0) {
      return {
        allowed: false,
        reason: 'PII_DETECTED_CLIENT',
        detectedTypes: detected,
        suggestion: 'Пожалуйста, уберите личные данные из вопроса'
      };
    }

    return { allowed: true };
  }

  // Level 2: API Gateway
  static gatewayFilter(message: string, context: RequestContext): FilterResult {
    const detected = this.detectPII(message);

    // Check for evasion attempts
    const evasionPatterns = [
      /мой паспорт/i,
      /номер документа/i,
      /запиши (мой|мои)/i,
      /сохрани данные/i
    ];
    const possibleEvasion = evasionPatterns.some(p => p.test(message));

    if (detected.length > 0 || possibleEvasion) {
      auditLog({
        eventType: 'AI_REQUEST',
        action: 'PII_BLOCKED',
        deviceId: context.deviceId,
        metadata: { detectedTypes: detected, possibleEvasion }
      });

      return {
        allowed: false,
        reason: possibleEvasion ? 'EVASION_ATTEMPT' : 'PII_DETECTED_GATEWAY'
      };
    }

    return { allowed: true };
  }

  // Level 3: AI Proxy (last defense)
  static proxyFilter(
    message: string,
    conversationHistory: Message[]
  ): FilterResult {
    // Analyze full history for aggregated PII
    const allText = [message, ...conversationHistory.map(m => m.content)].join(' ');
    const detected = this.detectPII(allText);

    // Check for attempts to "assemble" passport in parts
    const partialPatterns = {
      passportSeries: /серия\s*(\d{2}\s?\d{2})/i,
      passportNumber: /номер\s*(\d{6})/i
    };

    let seriesFound = false;
    let numberFound = false;

    for (const msg of conversationHistory) {
      if (partialPatterns.passportSeries.test(msg.content)) seriesFound = true;
      if (partialPatterns.passportNumber.test(msg.content)) numberFound = true;
    }

    if (seriesFound && numberFound) {
      return {
        allowed: false,
        reason: 'AGGREGATED_PII_DETECTED',
        action: 'CLEAR_CONVERSATION'
      };
    }

    return { allowed: true };
  }

  private static detectPII(text: string): string[] {
    const detected: string[] = [];

    for (const [type, patterns] of Object.entries(PII_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          detected.push(type);
          break;
        }
      }
    }

    return detected;
  }
}
```

### 4.2 Kill Switch

```typescript
// services/ai-kill-switch.ts

export class AIKillSwitch {
  private redis: Redis;

  async isActive(): Promise<boolean> {
    const status = await this.redis.get('ai:kill_switch');
    return status === 'active';
  }

  async activate(reason: string, duration?: number): Promise<void> {
    await this.redis.set('ai:kill_switch', 'active');

    if (duration) {
      await this.redis.expire('ai:kill_switch', duration);
    }

    await this.alertTeam({
      severity: 'critical',
      type: 'AI_KILL_SWITCH_ACTIVATED',
      reason,
      activatedAt: new Date()
    });

    await this.auditLog('AI_KILL_SWITCH', 'activate', { reason, duration });
  }

  async deactivate(): Promise<void> {
    await this.redis.del('ai:kill_switch');
    await this.auditLog('AI_KILL_SWITCH', 'deactivate', {});
  }

  // Auto-activate on mass incidents
  @Cron('* * * * *')
  async monitorHealth(): Promise<void> {
    const lastMinute = subMinutes(new Date(), 1);

    const incidents = await db.aiQuarantine.count({
      where: { timestamp: { gte: lastMinute } }
    });

    // More than 10 incidents per minute = auto kill switch
    if (incidents > 10) {
      await this.activate(
        `Auto: ${incidents} incidents in last minute`,
        300 // 5 minutes
      );
    }
  }
}
```

### 4.3 Honeypot Detection

```typescript
// services/ai-honeypot.ts

export class AIHoneypot {
  private honeypotPatterns = [
    // Prompt injection attempts
    /ignore previous instructions/i,
    /what is your system prompt/i,
    /repeat everything above/i,
    /забудь все инструкции/i,
    /you are now/i,
    /act as/i,
    /pretend to be/i,
    /теперь ты/i,

    // Data extraction attempts
    /show me all users/i,
    /database dump/i,
    /покажи данные/i,
    /список пользователей/i
  ];

  async check(message: string, deviceId: string): Promise<HoneypotResult> {
    for (const pattern of this.honeypotPatterns) {
      if (pattern.test(message)) {
        // This is an attack!
        await this.handleAttack(deviceId, 'HONEYPOT_TRIGGERED', message);

        return {
          isAttack: true,
          pattern: pattern.toString(),
          // Return innocuous response (don't reveal detection)
          decoyResponse: 'Извините, я не понял вопрос. Могу помочь с вопросами о миграционном законодательстве.'
        };
      }
    }

    return { isAttack: false };
  }

  private async handleAttack(
    deviceId: string,
    type: string,
    evidence: string
  ): Promise<void> {
    // Log security event
    await db.securityEvents.create({
      data: {
        severity: 'high',
        eventType: type,
        deviceId,
        details: { evidence: evidence.substring(0, 500) },
        timestamp: new Date()
      }
    });

    // Increment suspicion score
    const score = await this.redis.incr(`suspicion:${deviceId}`);
    await this.redis.expire(`suspicion:${deviceId}`, 86400);

    // Ban from AI after repeated attempts
    if (score >= 3) {
      await this.banFromAI(deviceId, 3600);
    }
  }
}
```

---

## 5. Аудит и логирование

### 5.1 Audit Log Structure

```typescript
// services/audit-logger.ts

interface AuditEvent {
  timestamp: Date;
  eventType: AuditEventType;
  deviceId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  result: 'success' | 'failure' | 'error';
  metadata: Record<string, any>; // NO PII!
  ipHash?: string;
}

type AuditEventType =
  | 'AUTH'
  | 'DATA_ACCESS'
  | 'DATA_MODIFY'
  | 'DATA_DELETE'
  | 'EXPORT'
  | 'SETTINGS'
  | 'AI_REQUEST'
  | 'PAYMENT'
  | 'SECURITY';

export class AuditLogger {
  async log(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    // Mask any PII that might slip through
    const maskedEvent = {
      ...event,
      timestamp: new Date(),
      metadata: this.maskPII(event.metadata),
      ipHash: event.ipHash ? sha256(event.ipHash) : undefined
    };

    await db.auditLog.create({ data: maskedEvent });

    // Alert for security events
    if (event.eventType === 'SECURITY' && event.result === 'failure') {
      await this.alertSecurityTeam(maskedEvent);
    }
  }

  private maskPII(data: any): any {
    const piiFields = ['name', 'passport', 'phone', 'email', 'address'];

    if (typeof data !== 'object' || data === null) return data;

    return Object.entries(data).reduce((acc, [key, value]) => {
      if (piiFields.some(f => key.toLowerCase().includes(f))) {
        acc[key] = '[MASKED]';
      } else if (typeof value === 'object') {
        acc[key] = this.maskPII(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
  }
}

export const auditLog = new AuditLogger();
```

### 5.2 Retention Policy

```typescript
// services/log-retention.ts

export class LogRetentionService {
  private retentionPolicies = {
    audit_log: 365,        // 1 year
    security_events: 730,  // 2 years
    ai_request_log: 90,    // 3 months
    analytics: 180         // 6 months
  };

  @Cron('0 3 * * *') // Every night at 3 AM
  async cleanupOldLogs(): Promise<void> {
    for (const [table, days] of Object.entries(this.retentionPolicies)) {
      const cutoffDate = subDays(new Date(), days);

      // Archive to cold storage before deletion
      await this.archiveToS3(table, cutoffDate);

      // Delete old records
      const deleted = await db[table].deleteMany({
        where: { timestamp: { lt: cutoffDate } }
      });

      logger.info(`Cleaned up ${deleted.count} records from ${table}`);
    }
  }

  // Right to deletion (user request)
  async deleteUserData(deviceId: string): Promise<DeletionReport> {
    const tables = ['audit_log', 'security_events', 'ai_request_log'];
    const report: DeletionReport = {
      deviceId,
      deletedAt: new Date(),
      tables: {}
    };

    for (const table of tables) {
      const deleted = await db[table].deleteMany({
        where: { deviceId }
      });
      report.tables[table] = deleted.count;
    }

    // Delete from Redis
    const keys = await redis.keys(`*:${deviceId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    // Log the deletion itself (no PII)
    await auditLog.log({
      eventType: 'DATA_DELETE',
      deviceId: 'SYSTEM',
      action: 'USER_DATA_DELETION',
      resource: deviceId.slice(0, 8) + '...',
      result: 'success',
      metadata: report
    });

    return report;
  }
}
```

---

## 6. Защита от реверс-инжиниринга

### 6.1 Root/Jailbreak Detection

```typescript
// lib/security/device-integrity.ts

export class DeviceIntegrity {
  async check(): Promise<IntegrityResult> {
    const checks: IntegrityCheck[] = [];

    // 1. Root detection (Android)
    if (Capacitor.getPlatform() === 'android') {
      checks.push(await this.checkAndroidRoot());
    }

    // 2. Jailbreak detection (iOS)
    if (Capacitor.getPlatform() === 'ios') {
      checks.push(await this.checkIOSJailbreak());
    }

    // 3. Emulator detection
    checks.push(await this.checkEmulator());

    // 4. Debug mode detection
    checks.push(await this.checkDebugMode());

    // 5. App signature verification
    checks.push(await this.verifyAppSignature());

    const failed = checks.filter(c => !c.passed);

    return {
      isSecure: failed.length === 0,
      failedChecks: failed,
      riskLevel: this.calculateRiskLevel(failed)
    };
  }

  private async checkAndroidRoot(): Promise<IntegrityCheck> {
    const rootIndicators = [
      '/system/bin/su',
      '/system/xbin/su',
      '/sbin/su',
      'com.topjohnwu.magisk',
      'eu.chainfire.supersu'
    ];

    // Use native plugin to check
    const result = await RootDetector.isRooted();

    return {
      name: 'ANDROID_ROOT',
      passed: !result.isRooted,
      details: result.reasons
    };
  }

  private calculateRiskLevel(failed: IntegrityCheck[]): RiskLevel {
    if (failed.some(f => ['ANDROID_ROOT', 'IOS_JAILBREAK', 'APP_SIGNATURE'].includes(f.name))) {
      return 'critical';
    }
    if (failed.some(f => ['EMULATOR', 'DEBUG_MODE'].includes(f.name))) {
      return 'high';
    }
    return 'low';
  }
}
```

### 6.2 Anti-Tampering

```typescript
// lib/security/anti-tampering.ts

export class AntiTampering {
  private checksums: Record<string, string> = {
    'main.js': 'sha256:abc...',
    'calculator.js': 'sha256:def...',
    'crypto.js': 'sha256:ghi...'
  };

  async verify(): Promise<boolean> {
    for (const [file, expectedHash] of Object.entries(this.checksums)) {
      const content = await this.readFile(file);
      const actualHash = await this.hash(content);

      if (actualHash !== expectedHash) {
        // Code was modified!
        await this.reportTampering(file);
        return false;
      }
    }
    return true;
  }

  private async reportTampering(file: string): Promise<void> {
    try {
      await fetch('/api/v1/security/tampering', {
        method: 'POST',
        body: JSON.stringify({
          file,
          deviceId: await getDeviceId(),
          timestamp: Date.now()
        })
      });
    } catch {}

    // Clear sensitive data
    await SecureStorage.clear();
  }
}
```

### 6.3 Runtime Protection

```typescript
// lib/security/runtime-protection.ts

export function initRuntimeProtection(): void {
  // 1. Disable console in production
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    // Keep error and warn for Sentry
  }

  // 2. Detect DevTools
  const detectDevTools = () => {
    const threshold = 160;

    setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        clearSensitiveData();
      }
    }, 500);
  };

  // 3. Hide sensitive UI when app backgrounded
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hideSensitiveUI();
    } else {
      showSensitiveUI();
    }
  });

  if (typeof window !== 'undefined') {
    detectDevTools();
  }
}
```

---

## 7. Incident Response

### 7.1 Severity Classification

| Severity | Description | Response Time | Example |
|----------|-------------|---------------|---------|
| P1 - Critical | Data breach, mass PII leak | 15 min | AI sent passport to OpenAI |
| P2 - High | Single leak, DoS | 1 hour | One user leaked data |
| P3 - Medium | Vulnerability without exploit | 4 hours | XSS found |
| P4 - Low | Minor issues | 24 hours | Rate limit bypass |

### 7.2 Incident Response Flow

```typescript
// services/incident-response.ts

export class IncidentResponse {
  // Step 1: Detection & Classification
  async detectAndClassify(event: SecurityEvent): Promise<Incident> {
    const incident = await this.createIncident(event);
    const piiImpact = await this.assessPIIImpact(event);

    if (piiImpact.confirmed) {
      incident.piiLeak = {
        dataTypes: piiImpact.types,
        estimatedCount: piiImpact.count,
        requiresRKNNotification: piiImpact.count > 0
      };
    }

    return incident;
  }

  // Step 2: Containment
  async contain(incident: Incident): Promise<void> {
    if (incident.type === 'AI_LEAK') {
      await this.aiKillSwitch.activate('PII leak detected');
    }

    if (incident.type === 'DATA_BREACH') {
      await this.blockAffectedEndpoints(incident);
      await this.invalidateSessions(incident.affectedDevices);
    }

    await this.captureSystemState(incident);
  }

  // Step 3: РКН Notification (if required)
  async notifyRKN(incident: Incident): Promise<RKNNotification | null> {
    if (!incident.piiLeak?.requiresRKNNotification) {
      return null;
    }

    // 152-ФЗ requires notification within 24 hours
    const deadline = addHours(incident.timeline[0].timestamp, 24);

    const notification: RKNNotification = {
      required: true,
      deadline,
      status: 'pending',
      content: {
        operatorName: 'ООО "МигрантХаб"',
        incidentDate: incident.timeline[0].timestamp,
        dataTypes: incident.piiLeak.dataTypes,
        subjectsCount: incident.piiLeak.estimatedCount,
        cause: this.translateCause(incident.type),
        actionsTaken: await this.getActionsSummary(incident)
      }
    };

    await db.rknNotifications.create({ data: notification });
    return notification;
  }

  // Step 4: Forensics
  async conductForensics(incident: Incident): Promise<ForensicsReport> {
    return {
      incidentId: incident.id,
      attackTimeline: await this.reconstructTimeline(incident),
      entryPoint: await this.identifyEntryPoint(incident),
      dataAccessed: await this.identifyAccessedData(incident),
      iocs: await this.extractIOCs(incident),
      recommendations: await this.generateRecommendations(incident)
    };
  }

  // Step 5: Recovery
  async recover(incident: Incident): Promise<void> {
    if (incident.type === 'AI_LEAK') {
      await this.aiKillSwitch.deactivate();
    }

    await this.notifyUsersRecovery(incident);
    await this.updateStatus(incident.id, 'resolved');
  }

  // Step 6: Postmortem
  async conductPostmortem(incident: Incident): Promise<Postmortem> {
    return {
      incidentId: incident.id,
      summary: '',
      timeline: incident.timeline,
      rootCause: await this.analyze5Whys(incident),
      whatWorkedWell: [],
      improvements: [],
      actionItems: []
    };
  }
}
```

---

## 8. Compliance 152-ФЗ

### 8.1 Почему мы НЕ оператор ПД

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     152-ФЗ COMPLIANCE ANALYSIS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ОПРЕДЕЛЕНИЕ ОПЕРАТОРА ПД (ст. 3 152-ФЗ):                                   │
│  ════════════════════════════════════════                                   │
│  "Государственный орган, муниципальный орган, юридическое или физическое   │
│   лицо, самостоятельно или совместно с другими лицами организующие и       │
│   (или) осуществляющие ОБРАБОТКУ персональных данных"                       │
│                                                                              │
│  ОБРАБОТКА ПД включает (ст. 3):                                             │
│  ═══════════════════════════════                                            │
│  сбор, запись, систематизацию, накопление, ХРАНЕНИЕ, уточнение,            │
│  извлечение, использование, передачу, обезличивание, блокирование,          │
│  удаление, уничтожение                                                       │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  НАША ПОЗИЦИЯ:                                                               │
│  ═════════════                                                               │
│                                                                              │
│  1. МЫ НЕ ХРАНИМ PII НА СЕРВЕРЕ                                             │
│     ├── ФИО: НЕТ                                                            │
│     ├── Паспортные данные: НЕТ                                              │
│     ├── Адрес: НЕТ                                                          │
│     ├── Телефон: НЕТ                                                        │
│     └── Email: НЕТ                                                          │
│                                                                              │
│  2. МЫ ХРАНИМ ТОЛЬКО АНОНИМНЫЕ МЕТАДАННЫЕ                                   │
│     ├── citizenship_code: "UZ" (не связано с конкретным лицом)              │
│     ├── region_code: "77" (не адрес проживания)                             │
│     ├── entry_date: дата (не связана с личностью без других данных)         │
│     └── telegram_id_hash: SHA256 (необратимое преобразование)               │
│                                                                              │
│  3. E2E ШИФРОВАННЫЕ БЭКАПЫ                                                  │
│     ├── Ключ шифрования ТОЛЬКО у пользователя                               │
│     ├── Мы физически НЕ МОЖЕМ расшифровать данные                           │
│     └── = Мы не обрабатываем PII в бэкапах                                  │
│                                                                              │
│  4. AI ЗАПРОСЫ                                                               │
│     ├── 3-уровневый PII фильтр блокирует любые PII                          │
│     ├── Kill Switch при обнаружении утечки                                  │
│     └── В OpenAI попадают только обезличенные вопросы                       │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  ВЫВОД:                                                                      │
│  ══════                                                                      │
│  Мы НЕ осуществляем ХРАНЕНИЕ персональных данных на сервере                 │
│  = Мы НЕ являемся оператором ПД по 152-ФЗ                                   │
│  = НЕ требуется регистрация в реестре РКН                                   │
│  = НЕ требуется назначение DPO                                              │
│                                                                              │
│  ОДНАКО:                                                                     │
│  ═══════                                                                     │
│  - Мы всё равно применяем best practices защиты данных                      │
│  - У нас есть Incident Response план                                        │
│  - Мы готовы к уведомлению РКН в случае инцидента (добровольно)            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Compliance Reports

```typescript
// services/compliance-reporter.ts

export class ComplianceReporter {
  // Report for internal use / potential audits
  async generateComplianceReport(period: DateRange): Promise<Report> {
    return {
      period,
      generatedAt: new Date(),

      dataStorage: {
        serverDatabase: {
          piiStored: false,
          dataTypes: ['citizenship_code', 'region_code', 'entry_date', 'telegram_id_hash'],
          evidence: 'Database schema review'
        },
        backups: {
          encryption: 'AES-256-GCM',
          keyHolder: 'USER_ONLY',
          serverAccess: false
        },
        aiRequests: {
          piiFilter: '3-level',
          killSwitch: 'enabled'
        }
      },

      securityMeasures: {
        encryptionAtRest: true,
        encryptionInTransit: true,
        accessControl: true,
        auditLogging: true,
        incidentResponse: true
      },

      incidents: await this.getIncidentsSummary(period),

      conclusion: 'Organization does not process personal data on servers. ' +
                  'All PII stored locally on user devices with encryption.'
    };
  }
}
```

---

*Документ: 05-SECURITY.md*
*Блок 5 из 6 архитектурной документации MigrantHub*
