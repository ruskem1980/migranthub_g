import { BaseDocumentParser, ParseResult } from './base.parser';
import { PassportDataDto } from '../dto';

/**
 * Parser for passport documents (Russian internal/foreign, CIS countries)
 */
export class PassportParser extends BaseDocumentParser<PassportDataDto> {
  private readonly DETECTION_KEYWORDS = [
    'ПАСПОРТ',
    'PASSPORT',
    'PASPORT',
    'СЕРИЯ',
    'SERIES',
    'ГРАЖДАНСТВО',
    'CITIZENSHIP',
    'NATIONALITY',
    'ДАТА РОЖДЕНИЯ',
    'DATE OF BIRTH',
    'МЕСТО РОЖДЕНИЯ',
    'PLACE OF BIRTH',
  ];

  private readonly REQUIRED_FIELDS = ['series', 'number', 'fullName', 'birthDate'];

  detect(text: string): boolean {
    const normalizedText = this.normalizeText(text);
    let matchCount = 0;

    for (const keyword of this.DETECTION_KEYWORDS) {
      if (normalizedText.includes(keyword.toUpperCase())) {
        matchCount++;
      }
    }

    // Need at least 2 keywords to identify as passport
    return matchCount >= 2;
  }

  parse(text: string): ParseResult<PassportDataDto> {
    this.resetWarnings();
    const data: PassportDataDto = {};
    const normalizedText = this.normalizeText(text);

    // Extract series and number
    this.extractSeriesNumber(normalizedText, data);

    // Extract full name
    this.extractName(normalizedText, data);

    // Extract dates
    this.extractDates(normalizedText, data);

    // Extract birth place
    this.extractBirthPlace(normalizedText, data);

    // Extract sex
    this.extractSex(normalizedText, data);

    // Extract nationality
    this.extractNationality(normalizedText, data);

    // Extract issuing authority
    this.extractIssuingAuthority(normalizedText, data);

    const confidence = this.calculateConfidence(data, this.REQUIRED_FIELDS);

    if (confidence < 50) {
      this.addWarning('Low recognition quality - some key fields missing');
    }

    return {
      data,
      confidence,
      warnings: this.warnings,
    };
  }

  private extractSeriesNumber(text: string, data: PassportDataDto): void {
    // Russian passport format: СЕРИЯ ХХХХ НОМЕР ХХХХХХ or XX XX XXXXXX
    const russianPattern = /(?:СЕРИЯ\s*)?(\d{2})\s*(\d{2})\s*(?:НОМЕР\s*)?(\d{6})/;
    const russianMatch = text.match(russianPattern);

    if (russianMatch) {
      data.series = `${russianMatch[1]}${russianMatch[2]}`;
      data.number = russianMatch[3];
      return;
    }

    // Foreign passport / international format: 2 letters + 7 digits or similar
    const foreignPattern = /(?:СЕРИЯ\s*|SERIES\s*)?([A-ZА-Я]{1,2})\s*(\d{7,9})/;
    const foreignMatch = text.match(foreignPattern);

    if (foreignMatch) {
      data.series = foreignMatch[1];
      data.number = foreignMatch[2];
      return;
    }

    // Generic: any sequence of 4 digits followed by 6 digits
    const genericPattern = /(\d{4})\s*(\d{6})/;
    const genericMatch = text.match(genericPattern);

    if (genericMatch) {
      data.series = genericMatch[1];
      data.number = genericMatch[2];
      return;
    }

    // CIS passports often have letter + numbers
    const cisPattern = /([A-ZА-Я]+)\s*(\d{6,8})/;
    const cisMatch = text.match(cisPattern);

    if (cisMatch && cisMatch[1].length <= 3) {
      data.series = cisMatch[1];
      data.number = cisMatch[2];
      return;
    }

    this.addWarning('Could not extract passport series/number');
  }

  private extractName(text: string, data: PassportDataDto): void {
    // Try to find name after keywords
    const nameKeywords = ['ФАМИЛИЯ', 'SURNAME', 'ФИО', 'NAME'];
    let foundName = this.findAfterKeyword(text, nameKeywords, 80);

    if (!foundName) {
      // Try to extract Cyrillic name pattern
      foundName = this.extractCyrillicName(text);
    }

    if (foundName) {
      data.fullName = foundName;

      // Try to split into surname and given names
      const nameParts = foundName.split(/\s+/);
      if (nameParts.length >= 2) {
        data.surname = nameParts[0];
        data.givenNames = nameParts.slice(1).join(' ');
      }
    } else {
      this.addWarning('Could not extract name');
    }
  }

  private extractDates(text: string, data: PassportDataDto): void {
    // Extract all dates
    const datePattern = /(\d{2})[.\/-](\d{2})[.\/-](\d{4})/g;
    const dates: Array<{ date: string; index: number }> = [];
    let match;

    while ((match = datePattern.exec(text)) !== null) {
      const [full, day, month, year] = match;
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      if (
        dayNum >= 1 &&
        dayNum <= 31 &&
        monthNum >= 1 &&
        monthNum <= 12 &&
        yearNum >= 1900 &&
        yearNum <= 2100
      ) {
        dates.push({ date: `${day}.${month}.${year}`, index: match.index });
      }
    }

    // Try to identify which date is which based on context
    const birthKeywords = ['РОЖДЕНИЯ', 'BIRTH', 'РОД.'];
    const issueKeywords = ['ВЫДАН', 'ДАТА ВЫДАЧИ', 'ISSUED', 'DATE OF ISSUE'];
    const expiryKeywords = ['ДЕЙСТВИТЕЛЕН', 'VALID', 'СРОК', 'EXPIR'];

    for (const dateInfo of dates) {
      // Get surrounding text
      const startIdx = Math.max(0, dateInfo.index - 30);
      const endIdx = Math.min(text.length, dateInfo.index + 20);
      const context = text.substring(startIdx, endIdx).toUpperCase();

      if (birthKeywords.some((kw) => context.includes(kw))) {
        if (!data.birthDate) data.birthDate = dateInfo.date;
      } else if (issueKeywords.some((kw) => context.includes(kw))) {
        if (!data.issueDate) data.issueDate = dateInfo.date;
      } else if (expiryKeywords.some((kw) => context.includes(kw))) {
        if (!data.expiryDate) data.expiryDate = dateInfo.date;
      }
    }

    // If we found dates but couldn't categorize them, make educated guesses
    if (dates.length > 0 && !data.birthDate && !data.issueDate && !data.expiryDate) {
      // Sort by year - oldest is likely birth date
      const sortedDates = dates.sort((a, b) => {
        const yearA = parseInt(a.date.slice(-4), 10);
        const yearB = parseInt(b.date.slice(-4), 10);
        return yearA - yearB;
      });

      if (sortedDates.length >= 1) {
        data.birthDate = sortedDates[0].date;
      }
      if (sortedDates.length >= 2) {
        data.issueDate = sortedDates[1].date;
      }
      if (sortedDates.length >= 3) {
        data.expiryDate = sortedDates[2].date;
      }

      this.addWarning('Date assignment is estimated - verify manually');
    }

    if (!data.birthDate) {
      this.addWarning('Could not extract birth date');
    }
  }

  private extractBirthPlace(text: string, data: PassportDataDto): void {
    const placeKeywords = ['МЕСТО РОЖДЕНИЯ', 'PLACE OF BIRTH', 'МР'];
    const place = this.findAfterKeyword(text, placeKeywords, 100);

    if (place) {
      data.birthPlace = place;
    }
  }

  private extractSex(text: string, data: PassportDataDto): void {
    // Look for sex indicators - broader patterns
    if (/\b(МУЖ|MALE|М\b|M\b|МУЖ\.|МУЖСКОЙ)/i.test(text)) {
      data.sex = 'M';
    } else if (/\b(ЖЕН|FEMALE|Ж\b|F\b|ЖЕН\.|ЖЕНСКИЙ)/i.test(text)) {
      data.sex = 'F';
    }

    // Also check after ПОЛ keyword
    const sexKeywords = ['ПОЛ', 'SEX', 'GENDER'];
    const sexValue = this.findAfterKeyword(text, sexKeywords, 20);
    if (sexValue) {
      if (/МУЖ|MALE|М\b|M\b/i.test(sexValue)) {
        data.sex = 'M';
      } else if (/ЖЕН|FEMALE|Ж\b|F\b/i.test(sexValue)) {
        data.sex = 'F';
      }
    }
  }

  private extractNationality(text: string, data: PassportDataDto): void {
    const nationalityKeywords = ['ГРАЖДАНСТВО', 'CITIZENSHIP', 'NATIONALITY'];
    const nationality = this.findAfterKeyword(text, nationalityKeywords, 50);

    if (nationality) {
      data.nationality = nationality;
    }

    // Common CIS countries detection
    const countries = [
      'УЗБЕКИСТАН',
      'ТАДЖИКИСТАН',
      'КЫРГЫЗСТАН',
      'КИРГИЗИЯ',
      'КАЗАХСТАН',
      'АРМЕНИЯ',
      'АЗЕРБАЙДЖАН',
      'МОЛДОВА',
      'МОЛДАВИЯ',
      'УКРАИНА',
      'БЕЛАРУСЬ',
      'БЕЛОРУССИЯ',
      'РОССИЯ',
      'РОССИЙСКАЯ ФЕДЕРАЦИЯ',
      'UZBEKISTAN',
      'TAJIKISTAN',
      'KYRGYZSTAN',
      'KAZAKHSTAN',
    ];

    for (const country of countries) {
      if (text.includes(country)) {
        data.nationality = country;
        break;
      }
    }
  }

  private extractIssuingAuthority(text: string, data: PassportDataDto): void {
    const authorityKeywords = ['ОРГАН ВЫДАЧИ', 'ВЫДАН', 'AUTHORITY', 'ISSUED BY', 'КЕМ ВЫДАН'];
    const authority = this.findAfterKeyword(text, authorityKeywords, 150);

    if (authority) {
      // Clean up common prefixes
      data.issuingAuthority = authority.replace(/^[:\s]+/, '');
    }
  }
}
