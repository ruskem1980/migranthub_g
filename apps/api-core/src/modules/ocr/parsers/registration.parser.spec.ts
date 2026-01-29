import { RegistrationParser } from './registration.parser';

describe('RegistrationParser', () => {
  let parser: RegistrationParser;

  beforeEach(() => {
    parser = new RegistrationParser();
  });

  describe('detect', () => {
    it('should detect registration by explicit keyword', () => {
      const text = 'МИГРАЦИОННЫЙ УЧЁТ МЕСТО ПРЕБЫВАНИЯ';
      expect(parser.detect(text)).toBe(true);
    });

    it('should detect by registration + address', () => {
      const text = 'РЕГИСТРАЦИЯ АДРЕС Г. МОСКВА УЛ. ПУШКИНА';
      expect(parser.detect(text)).toBe(true);
    });

    it('should detect by multiple keywords', () => {
      const text = 'УВЕДОМЛЕНИЕ ПРИНИМАЮЩАЯ СТОРОНА СРОК ПРЕБЫВАНИЯ';
      expect(parser.detect(text)).toBe(true);
    });

    it('should not detect without keywords', () => {
      const text = 'Просто какой-то текст';
      expect(parser.detect(text)).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse registration document', () => {
      const text = `
        МИГРАЦИОННЫЙ УЧЁТ
        № 77-23-123456
        ФАМИЛИЯ АЛИМОВ
        АДРЕС Г. МОСКВА
        С 01.06.2024 ПО 01.09.2024
        ПРИНИМАЮЩАЯ СТОРОНА ПЕТРОВ
      `;

      const result = parser.parse(text);

      expect(result.data.registrationNumber).toBe('77-23-123456');
      expect(result.data.registrationDate).toBe('01.06.2024');
      expect(result.data.validUntil).toBe('01.09.2024');
    });

    it('should parse date range format', () => {
      const text = `
        МИГРАЦИОННЫЙ УЧЁТ
        АДРЕС Г. МОСКВА
        С 15.07.2024 ДО 15.10.2024
      `;

      const result = parser.parse(text);

      expect(result.data.registrationDate).toBe('15.07.2024');
      expect(result.data.validUntil).toBe('15.10.2024');
    });

    it('should extract host name', () => {
      const text = `
        МИГРАЦИОННЫЙ УЧЁТ
        ПРИНИМАЮЩАЯ СТОРОНА ИВАНОВ ИВАН ИВАНОВИЧ
      `;

      const result = parser.parse(text);
      expect(result.data.hostName).toBeDefined();
    });

    it('should add warnings for missing fields', () => {
      const text = 'МИГРАЦИОННЫЙ УЧЁТ';
      const result = parser.parse(text);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThan(50);
    });
  });
});
