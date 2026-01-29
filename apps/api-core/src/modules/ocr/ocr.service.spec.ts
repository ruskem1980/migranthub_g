import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { DocumentType } from './dto';

describe('OcrService', () => {
  let service: OcrService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OcrService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<OcrService>(OcrService);
  });

  afterEach(async () => {
    // Cleanup worker
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateFile', () => {
    it('should throw error when no file provided', () => {
      expect(() => service.validateFile(undefined as unknown as Express.Multer.File)).toThrow(
        BadRequestException,
      );
    });

    it('should throw error for unsupported file type', () => {
      const file = {
        mimetype: 'application/pdf',
        size: 1000,
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      expect(() => service.validateFile(file)).toThrow(BadRequestException);
    });

    it('should throw error for file too large', () => {
      const file = {
        mimetype: 'image/jpeg',
        size: 15 * 1024 * 1024, // 15MB
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      expect(() => service.validateFile(file)).toThrow(BadRequestException);
    });

    it('should accept valid JPEG file', () => {
      const file = {
        mimetype: 'image/jpeg',
        size: 1000,
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      expect(() => service.validateFile(file)).not.toThrow();
    });

    it('should accept valid PNG file', () => {
      const file = {
        mimetype: 'image/png',
        size: 1000,
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      expect(() => service.validateFile(file)).not.toThrow();
    });
  });

  describe('detectDocumentType', () => {
    it('should detect passport', () => {
      const text = 'ПАСПОРТ СЕРИЯ 4511 НОМЕР 123456 ДАТА РОЖДЕНИЯ 01.01.1990';
      expect(service.detectDocumentType(text)).toBe(DocumentType.PASSPORT);
    });

    it('should detect migration card', () => {
      const text = 'МИГРАЦИОННАЯ КАРТА СЕРИЯ 5019 ВЪЕЗД 01.06.2024 ЦЕЛЬ ВИЗИТА РАБОТА';
      expect(service.detectDocumentType(text)).toBe(DocumentType.MIGRATION_CARD);
    });

    it('should detect patent', () => {
      const text = 'ПАТЕНТ НА РАБОТУ ГУ МВД ТРУДОВАЯ ДЕЯТЕЛЬНОСТЬ ДЕЙСТВИТЕЛЕН ДО 01.06.2025';
      expect(service.detectDocumentType(text)).toBe(DocumentType.PATENT);
    });

    it('should detect registration', () => {
      const text = 'МИГРАЦИОННЫЙ УЧЁТ МЕСТО ПРЕБЫВАНИЯ АДРЕС Г. МОСКВА СРОК ПРЕБЫВАНИЯ';
      expect(service.detectDocumentType(text)).toBe(DocumentType.REGISTRATION);
    });

    it('should default to passport for unknown text', () => {
      const text = 'Some random text without keywords';
      expect(service.detectDocumentType(text)).toBe(DocumentType.PASSPORT);
    });
  });
});
