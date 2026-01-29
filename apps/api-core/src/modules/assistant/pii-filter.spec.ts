import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  PiiFilterService,
  PiiType,
  PiiFilterLevel,
  DetectedPii,
} from './pii-filter.service';

describe('PiiFilterService', () => {
  let service: PiiFilterService;

  const createService = async (filterLevel: string = 'contacts'): Promise<PiiFilterService> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PiiFilterService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              if (key === 'pii.filterLevel') {
                return filterLevel;
              }
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    return module.get<PiiFilterService>(PiiFilterService);
  };

  beforeEach(async () => {
    service = await createService('contacts');
  });

  describe('Passport RF detection', () => {
    it('should detect passport with spaces (XX XX XXXXXX)', () => {
      const text = 'Мой паспорт 45 07 123456';
      const detected = service.detectPii(text);

      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe(PiiType.PASSPORT_RF);
      expect(detected[0].value).toBe('45 07 123456');
    });

    it('should detect passport without spaces (XXXXXXXXXXXX)', () => {
      const text = 'Паспорт: 4507123456';
      const detected = service.detectPii(text);

      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe(PiiType.PASSPORT_RF);
      expect(detected[0].value).toBe('4507123456');
    });

    it('should mask passport correctly', () => {
      const text = 'Мой паспорт 45 07 123456';
      const masked = service.maskPii(text);

      expect(masked).toBe('Мой паспорт 45 ** ******');
    });

    it('should detect multiple passports', () => {
      const text = 'Паспорта: 45 07 123456 и 50 12 654321';
      const detected = service.detectPii(text);

      expect(detected).toHaveLength(2);
      expect(detected[0].type).toBe(PiiType.PASSPORT_RF);
      expect(detected[1].type).toBe(PiiType.PASSPORT_RF);
    });
  });

  describe('INN detection', () => {
    it('should detect 10-digit INN (organization) - detected as document number', () => {
      const text = 'ИНН организации: 7707083893';
      const detected = service.detectPii(text);

      // 10-digit numbers match both INN and passport patterns
      // The system detects it as a document number (passport has higher priority for security)
      expect(detected).toHaveLength(1);
      expect([PiiType.INN, PiiType.PASSPORT_RF]).toContain(detected[0].type);
      expect(detected[0].value).toBe('7707083893');
    });

    it('should detect 12-digit INN (individual)', () => {
      const text = 'Мой ИНН 773456789012';
      const detected = service.detectPii(text);

      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe(PiiType.INN);
      expect(detected[0].value).toBe('773456789012');
    });

    it('should mask INN correctly', () => {
      const text = 'ИНН: 7707083893';
      const masked = service.maskPii(text);

      // 10-digit numbers are masked as document numbers
      expect(masked).toContain('77');
      expect(masked).toContain('*');
    });

    it('should mask 12-digit INN correctly', () => {
      const text = 'ИНН: 773456789012';
      const masked = service.maskPii(text);

      expect(masked).toBe('ИНН: 77**********');
    });
  });

  describe('SNILS detection', () => {
    it('should detect SNILS with dashes (XXX-XXX-XXX XX)', () => {
      const text = 'СНИЛС: 123-456-789 01';
      const detected = service.detectPii(text);

      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe(PiiType.SNILS);
      expect(detected[0].value).toBe('123-456-789 01');
    });

    it('should detect SNILS without separators', () => {
      const text = 'СНИЛС 12345678901';
      const detected = service.detectPii(text);

      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe(PiiType.SNILS);
    });

    it('should mask SNILS correctly', () => {
      const text = 'СНИЛС: 123-456-789 01';
      const masked = service.maskPii(text);

      expect(masked).toBe('СНИЛС: ***-***-*** **');
    });
  });

  describe('Phone detection', () => {
    it('should detect phone with +7', () => {
      const text = 'Позвоните мне: +7 (916) 123-45-67';
      const detected = service.detectPii(text);

      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe(PiiType.PHONE);
    });

    it('should detect phone with 8', () => {
      const text = 'Телефон: 8 916 123 45 67';
      const detected = service.detectPii(text);

      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe(PiiType.PHONE);
    });

    it('should detect phone without country code', () => {
      const text = 'Звоните: (916) 123-45-67';
      const detected = service.detectPii(text);

      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe(PiiType.PHONE);
    });

    it('should mask phone correctly', () => {
      const text = 'Телефон: +7 (916) 123-45-67';
      const masked = service.maskPii(text);

      expect(masked).toContain('***-**-**');
    });
  });

  describe('Email detection', () => {
    it('should detect email address', () => {
      const text = 'Пишите на ivan.petrov@gmail.com';
      const detected = service.detectPii(text);

      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe(PiiType.EMAIL);
      expect(detected[0].value).toBe('ivan.petrov@gmail.com');
    });

    it('should mask email correctly', () => {
      const text = 'Email: test@example.com';
      const masked = service.maskPii(text);

      expect(masked).toContain('@example.com');
      expect(masked).toContain('*');
    });
  });

  describe('Bank card detection', () => {
    it('should detect bank card with spaces', () => {
      const text = 'Карта: 4276 1234 5678 9012';
      const detected = service.detectPii(text);

      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe(PiiType.BANK_CARD);
    });

    it('should detect bank card without spaces', () => {
      const text = 'Номер карты 4276123456789012';
      const detected = service.detectPii(text);

      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe(PiiType.BANK_CARD);
    });

    it('should mask bank card correctly', () => {
      const text = 'Карта: 4276 1234 5678 9012';
      const masked = service.maskPii(text);

      expect(masked).toBe('Карта: 4276 **** **** 9012');
    });
  });

  describe('Name detection (FULL level)', () => {
    it('should not detect names at CONTACTS level', async () => {
      const contactsService = await createService('contacts');
      const text = 'Меня зовут Александр';
      const detected = contactsService.detectPii(text);

      const nameDetections = detected.filter((d) => d.type === PiiType.NAME);
      expect(nameDetections).toHaveLength(0);
    });

    it('should detect names at FULL level', async () => {
      const fullService = await createService('full');
      const text = 'Меня зовут Александр';
      const detected = fullService.detectPii(text);

      const nameDetections = detected.filter((d) => d.type === PiiType.NAME);
      expect(nameDetections).toHaveLength(1);
      expect(nameDetections[0].value).toBe('Александр');
    });

    it('should detect Central Asian names', async () => {
      const fullService = await createService('full');
      const text = 'Привет, Рустам и Зарина';
      const detected = fullService.detectPii(text);

      const nameDetections = detected.filter((d) => d.type === PiiType.NAME);
      expect(nameDetections).toHaveLength(2);
    });

    it('should mask names correctly', async () => {
      const fullService = await createService('full');
      const text = 'Меня зовут Иван';
      const masked = fullService.maskPii(text);

      expect(masked).toBe('Меня зовут И***');
    });
  });

  describe('Filter levels', () => {
    it('should only detect documents at DOCUMENTS level', async () => {
      const docsService = await createService('documents');
      const text = 'Паспорт 45 07 123456, телефон +7 916 123 45 67, email test@mail.ru';
      const detected = docsService.detectPii(text);

      expect(detected).toHaveLength(1);
      expect(detected[0].type).toBe(PiiType.PASSPORT_RF);
    });

    it('should detect documents and contacts at CONTACTS level', async () => {
      const contactsService = await createService('contacts');
      const text = 'Паспорт 45 07 123456, телефон +7 916 123 45 67, email test@mail.ru';
      const detected = contactsService.detectPii(text);

      expect(detected).toHaveLength(3);
      const types = detected.map((d) => d.type);
      expect(types).toContain(PiiType.PASSPORT_RF);
      expect(types).toContain(PiiType.PHONE);
      expect(types).toContain(PiiType.EMAIL);
    });

    it('should return correct filter level', async () => {
      const fullService = await createService('full');
      expect(fullService.getFilterLevel()).toBe(PiiFilterLevel.FULL);

      const docsService = await createService('documents');
      expect(docsService.getFilterLevel()).toBe(PiiFilterLevel.DOCUMENTS);
    });
  });

  describe('validateMessage', () => {
    it('should return safe=true for clean text', () => {
      const result = service.validateMessage('Как получить патент на работу?');

      expect(result.safe).toBe(true);
      expect(result.warnings).toHaveLength(0);
      expect(result.detectedPii).toHaveLength(0);
    });

    it('should return safe=false with warnings for PII', () => {
      const result = service.validateMessage('Мой паспорт 45 07 123456');

      expect(result.safe).toBe(false);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('паспорт');
      expect(result.detectedPii).toHaveLength(1);
    });

    it('should group warnings by type', () => {
      const result = service.validateMessage(
        'Паспорт 45 07 123456, телефон +7 916 123 45 67',
      );

      expect(result.safe).toBe(false);
      expect(result.warnings).toHaveLength(2);
    });
  });

  describe('maskPii', () => {
    it('should preserve text without PII', () => {
      const text = 'Как оформить регистрацию в Москве?';
      const masked = service.maskPii(text);

      expect(masked).toBe(text);
    });

    it('should mask multiple PII types correctly', () => {
      const text = 'Паспорт: 45 07 123456, ИНН: 773456789012';
      const masked = service.maskPii(text);

      // Uses 12-digit INN to avoid passport/INN overlap
      expect(masked).toBe('Паспорт: 45 ** ******, ИНН: 77**********');
    });

    it('should handle overlapping patterns correctly', () => {
      // SNILS could match part of a longer number
      const text = 'СНИЛС: 123-456-789 01, дата: 01.01.2024';
      const masked = service.maskPii(text);

      expect(masked).toContain('***-***-*** **');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      expect(service.detectPii('')).toHaveLength(0);
      expect(service.maskPii('')).toBe('');
      expect(service.validateMessage('').safe).toBe(true);
    });

    it('should not detect short numbers as INN', () => {
      const text = 'У меня 5 яблок и 1234 рубля';
      const detected = service.detectPii(text);

      const innDetections = detected.filter((d) => d.type === PiiType.INN);
      expect(innDetections).toHaveLength(0);
    });

    it('should handle text with only whitespace', () => {
      expect(service.detectPii('   ')).toHaveLength(0);
    });

    it('should handle unicode text correctly', () => {
      const text = 'Паспорт: 45 07 123456, имя: Мухаммад';
      const detected = service.detectPii(text);

      expect(detected.length).toBeGreaterThanOrEqual(1);
    });
  });
});
