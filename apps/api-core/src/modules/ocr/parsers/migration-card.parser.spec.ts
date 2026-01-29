import { MigrationCardParser } from './migration-card.parser';

describe('MigrationCardParser', () => {
  let parser: MigrationCardParser;

  beforeEach(() => {
    parser = new MigrationCardParser();
  });

  describe('detect', () => {
    it('should detect migration card by explicit keyword', () => {
      const text = 'МИГРАЦИОННАЯ КАРТА СЕРИЯ 5019 НОМЕР 12345678';
      expect(parser.detect(text)).toBe(true);
    });

    it('should detect migration card by multiple keywords', () => {
      const text = 'ВЪЕЗД 01.06.2024 ЦЕЛЬ ВИЗИТА РАБОТА СРОК ПРЕБЫВАНИЯ 90 ДНЕЙ';
      expect(parser.detect(text)).toBe(true);
    });

    it('should not detect without keywords', () => {
      const text = 'Просто какой-то текст';
      expect(parser.detect(text)).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse migration card', () => {
      const text = `
        МИГРАЦИОННАЯ КАРТА
        СЕРИЯ 5019 № 12345678
        ФАМИЛИЯ АЛИМОВ
        ВЪЕЗД 01.06.2024
        ЦЕЛЬ ВИЗИТА РАБОТА
        СРОК ПРЕБЫВАНИЯ 90 ДНЕЙ
        ДОМОДЕДОВО
      `;

      const result = parser.parse(text);

      expect(result.data.series).toBe('5019');
      expect(result.data.number).toBe('12345678');
      expect(result.data.entryDate).toBe('01.06.2024');
      expect(result.data.visitPurpose).toBe('РАБОТА');
      expect(result.data.stayDuration).toBe('90');
      expect(result.data.entryCheckpoint).toBe('ДОМОДЕДОВО');
    });

    it('should detect common airports', () => {
      const airports = [
        { text: 'ШЕРЕМЕТЬЕВО', expected: 'ШЕРЕМЕТЬЕВО' },
        { text: 'ПУЛКОВО', expected: 'ПУЛКОВО' },
        { text: 'ВНУКОВО', expected: 'ВНУКОВО' },
      ];

      for (const { text, expected } of airports) {
        const result = parser.parse(`МИГРАЦИОННАЯ КАРТА ВЪЕЗД ${text}`);
        expect(result.data.entryCheckpoint).toBe(expected);
      }
    });

    it('should detect visit purposes', () => {
      const purposes = [
        { text: 'УЧЕБА', expected: 'УЧЕБА' },
        { text: 'ТУРИЗМ', expected: 'ТУРИЗМ' },
        { text: 'ДЕЛОВАЯ', expected: 'ДЕЛОВАЯ' },
      ];

      for (const { text, expected } of purposes) {
        const result = parser.parse(`МИГРАЦИОННАЯ КАРТА ВЪЕЗД ${text}`);
        expect(result.data.visitPurpose).toBe(expected);
      }
    });
  });
});
