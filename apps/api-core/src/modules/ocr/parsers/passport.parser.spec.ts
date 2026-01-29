import { PassportParser } from './passport.parser';

describe('PassportParser', () => {
  let parser: PassportParser;

  beforeEach(() => {
    parser = new PassportParser();
  });

  describe('detect', () => {
    it('should detect passport by ПАСПОРТ keyword', () => {
      const text = 'ПАСПОРТ СЕРИЯ 4511 НОМЕР 123456';
      expect(parser.detect(text)).toBe(true);
    });

    it('should detect passport by multiple keywords', () => {
      const text = 'СЕРИЯ 4511 ДАТА РОЖДЕНИЯ 01.01.1990 ГРАЖДАНСТВО УЗБЕКИСТАН';
      expect(parser.detect(text)).toBe(true);
    });

    it('should not detect passport with insufficient keywords', () => {
      const text = 'Просто какой-то текст без ключевых слов';
      expect(parser.detect(text)).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse Russian passport format', () => {
      const text = `
        ПАСПОРТ
        СЕРИЯ 45 11 НОМЕР 123456
        ФАМИЛИЯ ИВАНОВ
        ИМЯ ИВАН ИВАНОВИЧ
        ДАТА РОЖДЕНИЯ 01.01.1990
        МЕСТО РОЖДЕНИЯ Г. МОСКВА
        ПОЛ МУЖ
        ГРАЖДАНСТВО РОССИЯ
        ВЫДАН 15.03.2020
        ДЕЙСТВИТЕЛЕН ДО 15.03.2030
      `;

      const result = parser.parse(text);

      expect(result.data.series).toBe('4511');
      expect(result.data.number).toBe('123456');
      expect(result.data.birthDate).toBe('01.01.1990');
      // Sex detection is flexible
      expect(result.confidence).toBeGreaterThan(50);
    });

    it('should parse CIS country passport with letter series', () => {
      const text = `
        ПАСПОРТ
        AA 1234567
        ФАМИЛИЯ АЛИМОВ
        ДАТА РОЖДЕНИЯ 15.05.1985
        ГРАЖДАНСТВО УЗБЕКИСТАН
      `;

      const result = parser.parse(text);

      expect(result.data.number).toBeDefined();
      expect(result.data.birthDate).toBe('15.05.1985');
      expect(result.data.nationality).toBe('УЗБЕКИСТАН');
    });

    it('should detect nationality from text', () => {
      const text = 'ПАСПОРТ СЕРИЯ 4511 НОМЕР 123456 РЕСПУБЛИКА ТАДЖИКИСТАН';
      const result = parser.parse(text);

      expect(result.data.nationality).toBe('ТАДЖИКИСТАН');
    });

    it('should add warning for low confidence', () => {
      const text = 'ПАСПОРТ СЕРИЯ 45 11';
      const result = parser.parse(text);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThan(50);
    });

    it('should detect sex indicators', () => {
      const textMale = 'ПАСПОРТ СЕРИЯ 4511 ПОЛ МУЖ ДАТА РОЖДЕНИЯ 01.01.1990';
      const textFemale = 'ПАСПОРТ СЕРИЯ 4511 ПОЛ ЖЕН ДАТА РОЖДЕНИЯ 01.01.1990';

      const resultMale = parser.parse(textMale);
      const resultFemale = parser.parse(textFemale);

      expect(resultMale.data.sex).toBe('M');
      expect(resultFemale.data.sex).toBe('F');
    });
  });
});
