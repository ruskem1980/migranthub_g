import { PatentParser } from './patent.parser';

describe('PatentParser', () => {
  let parser: PatentParser;

  beforeEach(() => {
    parser = new PatentParser();
  });

  describe('detect', () => {
    it('should detect patent by keyword and context', () => {
      const text = 'ПАТЕНТ НА РАБОТУ ГУ МВД РОССИИ';
      expect(parser.detect(text)).toBe(true);
    });

    it('should detect by multiple keywords', () => {
      const text = 'ТРУДОВАЯ ДЕЯТЕЛЬНОСТЬ ИНОСТРАННОГО ГРАЖДАНИНА ДЕЙСТВИТЕЛЕН';
      expect(parser.detect(text)).toBe(true);
    });

    it('should not detect without keywords', () => {
      const text = 'Просто какой-то текст';
      expect(parser.detect(text)).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse work patent', () => {
      const text = `
        ПАТЕНТ
        СЕРИЯ 77 № 123456789
        УЗБЕКИСТАН
        ВЫДАН 01.06.2024
        ДЕЙСТВИТЕЛЕН ДО 01.06.2025
        МОСКВА
        ПРОФЕССИЯ ПОДСОБНЫЙ РАБОЧИЙ
        ГУ МВД РОССИИ ПО Г. МОСКВЕ
      `;

      const result = parser.parse(text);

      expect(result.data.series).toBe('77');
      expect(result.data.number).toBe('123456789');
      expect(result.data.citizenship).toBe('УЗБЕКИСТАН');
      expect(result.data.issueDate).toBe('01.06.2024');
      expect(result.data.validUntil).toBe('01.06.2025');
      expect(result.data.region).toBe('МОСКВА');
      expect(result.data.profession).toBe('ПОДСОБНЫЙ РАБОЧИЙ');
    });

    it('should detect citizenship from CIS countries', () => {
      const countries = [
        { text: 'ТАДЖИКИСТАН', expected: 'ТАДЖИКИСТАН' },
        { text: 'КЫРГЫЗСТАН', expected: 'КЫРГЫЗСТАН' },
        { text: 'КАЗАХСТАН', expected: 'КАЗАХСТАН' },
      ];

      for (const { text, expected } of countries) {
        const result = parser.parse(`ПАТЕНТ МВД РАБОТА ${text}`);
        expect(result.data.citizenship).toBe(expected);
      }
    });

    it('should detect Russian regions', () => {
      const regions = [
        { text: 'МОСКВА', expected: 'МОСКВА' },
        { text: 'САНКТ-ПЕТЕРБУРГ', expected: 'САНКТ-ПЕТЕРБУРГ' },
        { text: 'КРАСНОДАРСКИЙ КРАЙ', expected: 'КРАСНОДАРСКИЙ КРАЙ' },
      ];

      for (const { text, expected } of regions) {
        const result = parser.parse(`ПАТЕНТ МВД РАБОТА ${text}`);
        expect(result.data.region).toBe(expected);
      }
    });

    it('should detect common professions', () => {
      const professions = ['ПОДСОБНЫЙ РАБОЧИЙ', 'СТРОИТЕЛЬ', 'ВОДИТЕЛЬ', 'ПРОДАВЕЦ'];

      for (const profession of professions) {
        const result = parser.parse(`ПАТЕНТ МВД РАБОТА ${profession}`);
        expect(result.data.profession).toBe(profession);
      }
    });
  });
});
