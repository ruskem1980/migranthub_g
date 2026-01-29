import { BaseDocumentParser, ParseResult } from './base.parser';
import { RegistrationDataDto } from '../dto';

/**
 * Parser for Russian temporary registration documents (registration at place of stay)
 */
export class RegistrationParser extends BaseDocumentParser<RegistrationDataDto> {
  private readonly DETECTION_KEYWORDS = [
    'РЕГИСТРАЦИЯ',
    'REGISTRATION',
    'МЕСТО ПРЕБЫВАНИЯ',
    'PLACE OF STAY',
    'МИГРАЦИОННЫЙ УЧЁТ',
    'МИГРАЦИОННЫЙ УЧЕТ',
    'УВЕДОМЛЕНИЕ',
    'NOTIFICATION',
    'ПРИНИМАЮЩАЯ СТОРОНА',
    'HOST',
    'АДРЕС',
    'ADDRESS',
    'СРОК ПРЕБЫВАНИЯ',
  ];

  private readonly REQUIRED_FIELDS = ['fullName', 'address', 'registrationDate', 'validUntil'];

  detect(text: string): boolean {
    const normalizedText = this.normalizeText(text);
    let matchCount = 0;

    for (const keyword of this.DETECTION_KEYWORDS) {
      if (normalizedText.includes(keyword.toUpperCase())) {
        matchCount++;
      }
    }

    // Need at least 2 keywords or explicit mention
    return (
      matchCount >= 2 ||
      normalizedText.includes('МИГРАЦИОННЫЙ УЧЁТ') ||
      normalizedText.includes('МИГРАЦИОННЫЙ УЧЕТ') ||
      (normalizedText.includes('РЕГИСТРАЦИЯ') && normalizedText.includes('АДРЕС'))
    );
  }

  parse(text: string): ParseResult<RegistrationDataDto> {
    this.resetWarnings();
    const data: RegistrationDataDto = {};
    const normalizedText = this.normalizeText(text);

    // Extract registration number
    this.extractRegistrationNumber(normalizedText, data);

    // Extract full name
    this.extractName(normalizedText, data);

    // Extract address
    this.extractAddress(normalizedText, data);

    // Extract dates
    this.extractDates(normalizedText, data);

    // Extract host name
    this.extractHostName(normalizedText, data);

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

  private extractRegistrationNumber(text: string, data: RegistrationDataDto): void {
    // Registration number formats vary, common patterns:
    const patterns = [
      /(?:№|N|НОМЕР)\s*([0-9-]+)/i,
      /(?:РЕГИСТРАЦИЯ\s*)?(\d{2}[-/]\d{2}[-/]\d+)/,
      /(\d{2,4}[-/]\d{2,4}[-/]\d{4,8})/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        data.registrationNumber = match[1];
        return;
      }
    }
  }

  private extractName(text: string, data: RegistrationDataDto): void {
    const nameKeywords = [
      'ФАМИЛИЯ',
      'SURNAME',
      'ФИО',
      'NAME',
      'ИНОСТРАННЫЙ ГРАЖДАНИН',
      'FOREIGN CITIZEN',
      'ГРАЖДАНИН',
    ];
    let foundName = this.findAfterKeyword(text, nameKeywords, 80);

    if (!foundName) {
      foundName = this.extractCyrillicName(text);
    }

    if (foundName) {
      data.fullName = foundName;
    } else {
      this.addWarning('Could not extract name');
    }
  }

  private extractAddress(text: string, data: RegistrationDataDto): void {
    const addressKeywords = [
      'АДРЕС',
      'ADDRESS',
      'МЕСТО ПРЕБЫВАНИЯ',
      'МЕСТО ЖИТЕЛЬСТВА',
      'PLACE OF STAY',
      'ЗАРЕГИСТРИРОВАН ПО АДРЕСУ',
    ];

    // Use value extraction with stop keywords
    const address = this.findValueAfterKeyword(text, addressKeywords, [
      'СРОК',
      'ПРИНИМАЮЩАЯ',
      'С ',
      'ПО ',
      'ОТ ',
      'ДО ',
    ]);

    if (address) {
      // Clean up address
      const cleanAddress = address
        .replace(/^[:\s]+/, '')
        .replace(/СРОК.*$/, '')
        .replace(/ПРИНИМАЮЩАЯ.*$/, '')
        .trim();

      // Try to format address nicely
      data.address = cleanAddress;
      return;
    }

    // Try to find address pattern (Г./ГОР. + УЛ./УЛИЦА + Д./ДОМ + КВ.)
    const addressPattern =
      /(?:Г\.|ГОР\.|ГОРОД)\s*[А-Я-]+[^Г]*(?:УЛ\.|УЛИЦА|ПР\.|ПРОСПЕКТ|Б-Р|БУЛЬВАР)[^.]*(?:Д\.|ДОМ)\s*\d+[^.]*(?:КВ\.|КВАРТИРА)?\s*\d*/i;
    const addressMatch = text.match(addressPattern);

    if (addressMatch) {
      data.address = addressMatch[0].trim();
      return;
    }

    this.addWarning('Could not extract address');
  }

  private extractDates(text: string, data: RegistrationDataDto): void {
    const datePattern = /(\d{2})[.\/-](\d{2})[.\/-](\d{4})/g;
    const dates: Array<{ date: string; index: number }> = [];
    let match;

    while ((match = datePattern.exec(text)) !== null) {
      const [, day, month, year] = match;
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      if (
        dayNum >= 1 &&
        dayNum <= 31 &&
        monthNum >= 1 &&
        monthNum <= 12 &&
        yearNum >= 2000 &&
        yearNum <= 2100
      ) {
        dates.push({ date: `${day}.${month}.${year}`, index: match.index });
      }
    }

    const registrationKeywords = ['ДАТА РЕГИСТРАЦИИ', 'ЗАРЕГИСТРИРОВАН', 'ОТ', 'REGISTERED', 'С'];
    const validKeywords = ['СРОК ПРЕБЫВАНИЯ', 'ДО', 'ДЕЙСТВИТЕЛЕН', 'ПО', 'UNTIL', 'VALID'];

    for (const dateInfo of dates) {
      const startIdx = Math.max(0, dateInfo.index - 30);
      const endIdx = Math.min(text.length, dateInfo.index + 20);
      const context = text.substring(startIdx, endIdx).toUpperCase();

      // Check if this is "from-to" range
      if (context.includes(' С ') || context.includes(' ОТ ')) {
        if (!data.registrationDate) data.registrationDate = dateInfo.date;
      } else if (validKeywords.some((kw) => context.includes(kw))) {
        if (!data.validUntil) data.validUntil = dateInfo.date;
      } else if (registrationKeywords.some((kw) => context.includes(kw))) {
        if (!data.registrationDate) data.registrationDate = dateInfo.date;
      }
    }

    // Try to find date range pattern: С XX.XX.XXXX ПО XX.XX.XXXX
    const rangePattern =
      /С\s*(\d{2}[.\/-]\d{2}[.\/-]\d{4})\s*(?:ПО|ДО)\s*(\d{2}[.\/-]\d{2}[.\/-]\d{4})/i;
    const rangeMatch = text.match(rangePattern);

    if (rangeMatch) {
      data.registrationDate = rangeMatch[1].replace(/[/-]/g, '.');
      data.validUntil = rangeMatch[2].replace(/[/-]/g, '.');
      return;
    }

    // If we have dates but couldn't categorize, assume chronological order
    if (dates.length >= 2 && !data.registrationDate && !data.validUntil) {
      const sortedDates = dates.sort((a, b) => {
        const [, dayA, monthA, yearA] = a.date.match(/(\d+)\.(\d+)\.(\d+)/) || [];
        const [, dayB, monthB, yearB] = b.date.match(/(\d+)\.(\d+)\.(\d+)/) || [];
        const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
        const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
        return dateA.getTime() - dateB.getTime();
      });

      data.registrationDate = sortedDates[0].date;
      data.validUntil = sortedDates[sortedDates.length - 1].date;
      this.addWarning('Date assignment is estimated - verify manually');
    }

    if (!data.registrationDate || !data.validUntil) {
      this.addWarning('Could not extract all dates');
    }
  }

  private extractHostName(text: string, data: RegistrationDataDto): void {
    const hostKeywords = [
      'ПРИНИМАЮЩАЯ СТОРОНА',
      'HOST',
      'ПРИГЛАШАЮЩАЯ СТОРОНА',
      'МЕСТО ПРЕБЫВАНИЯ ПРЕДОСТАВЛЕНО',
      'ВЛАДЕЛЕЦ',
    ];

    const host = this.findAfterKeyword(text, hostKeywords, 100);

    if (host) {
      // Extract name from host info
      const namePart = this.extractCyrillicName(host);
      if (namePart) {
        data.hostName = namePart;
        return;
      }
      data.hostName = host.split(/\n|\r/)[0].trim();
    }
  }

  private extractIssuingAuthority(text: string, data: RegistrationDataDto): void {
    const authorityKeywords = ['ОРГАН', 'AUTHORITY', 'ОВМ', 'ОТДЕЛ'];

    // Common issuing authorities for registration
    const authorityPattern =
      /(ОВМ|ОТДЕЛ\s*ПО\s*ВОПРОСАМ\s*МИГРАЦИИ)[^.]*(?:УМВД|МВД|ПОЛИЦИИ)[^.]+/i;
    const match = text.match(authorityPattern);

    if (match) {
      data.issuingAuthority = match[0].trim();
      return;
    }

    const authority = this.findAfterKeyword(text, authorityKeywords, 120);
    if (authority) {
      data.issuingAuthority = authority.replace(/^[:\s]+/, '');
    }
  }
}
