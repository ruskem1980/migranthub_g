import { BaseDocumentParser, ParseResult } from './base.parser';
import { PatentDataDto } from '../dto';

/**
 * Parser for Russian work patent documents
 */
export class PatentParser extends BaseDocumentParser<PatentDataDto> {
  private readonly DETECTION_KEYWORDS = [
    'ПАТЕНТ',
    'PATENT',
    'РАБОТА',
    'WORK',
    'ТРУДОВАЯ ДЕЯТЕЛЬНОСТЬ',
    'ИНОСТРАННОГО ГРАЖДАНИНА',
    'FOREIGN CITIZEN',
    'ГУ МВД',
    'УМВД',
    'УФМС',
    'ДЕЙСТВИТЕЛЕН',
    'ПРОФЕССИЯ',
  ];

  private readonly REQUIRED_FIELDS = ['series', 'number', 'fullName', 'validUntil', 'region'];

  detect(text: string): boolean {
    const normalizedText = this.normalizeText(text);
    let matchCount = 0;

    for (const keyword of this.DETECTION_KEYWORDS) {
      if (normalizedText.includes(keyword.toUpperCase())) {
        matchCount++;
      }
    }

    // Need at least 2 keywords or explicit mention of ПАТЕНТ + work context
    return (
      matchCount >= 2 ||
      (normalizedText.includes('ПАТЕНТ') &&
        (normalizedText.includes('РАБОТ') || normalizedText.includes('МВД')))
    );
  }

  parse(text: string): ParseResult<PatentDataDto> {
    this.resetWarnings();
    const data: PatentDataDto = {};
    const normalizedText = this.normalizeText(text);

    // Extract series and number
    this.extractSeriesNumber(normalizedText, data);

    // Extract full name
    this.extractName(normalizedText, data);

    // Extract citizenship
    this.extractCitizenship(normalizedText, data);

    // Extract dates
    this.extractDates(normalizedText, data);

    // Extract region
    this.extractRegion(normalizedText, data);

    // Extract profession
    this.extractProfession(normalizedText, data);

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

  private extractSeriesNumber(text: string, data: PatentDataDto): void {
    // Patent format: usually region code (2 digits) + number (9 digits)
    const patterns = [
      /(?:СЕРИЯ\s*)?(\d{2})\s*(?:№|N|НОМЕР)\s*(\d{9})/i,
      /(\d{2})\s+(\d{9})/,
      /(?:№|N)\s*(\d{2})(\d{9})/,
      /(\d{11})/, // Combined series + number
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        if (match.length === 2 && match[1].length === 11) {
          // Combined format
          data.series = match[1].substring(0, 2);
          data.number = match[1].substring(2);
        } else {
          data.series = match[1];
          data.number = match[2];
        }
        return;
      }
    }

    this.addWarning('Could not extract patent series/number');
  }

  private extractName(text: string, data: PatentDataDto): void {
    const nameKeywords = ['ФАМИЛИЯ', 'SURNAME', 'ФИО', 'NAME', 'ВЫДАН'];
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

  private extractCitizenship(text: string, data: PatentDataDto): void {
    // Common CIS countries detection - check first for exact country names
    const countries = [
      { keywords: ['УЗБЕКИСТАН', 'UZBEKISTAN'], value: 'УЗБЕКИСТАН' },
      { keywords: ['ТАДЖИКИСТАН', 'TAJIKISTAN'], value: 'ТАДЖИКИСТАН' },
      { keywords: ['КЫРГЫЗСТАН', 'КИРГИЗИЯ', 'KYRGYZSTAN'], value: 'КЫРГЫЗСТАН' },
      { keywords: ['КАЗАХСТАН', 'KAZAKHSTAN'], value: 'КАЗАХСТАН' },
      { keywords: ['АРМЕНИЯ', 'ARMENIA'], value: 'АРМЕНИЯ' },
      { keywords: ['АЗЕРБАЙДЖАН', 'AZERBAIJAN'], value: 'АЗЕРБАЙДЖАН' },
      { keywords: ['МОЛДОВА', 'МОЛДАВИЯ', 'MOLDOVA'], value: 'МОЛДОВА' },
      { keywords: ['УКРАИНА', 'UKRAINE'], value: 'УКРАИНА' },
    ];

    // First detect by country name anywhere in text
    for (const country of countries) {
      if (country.keywords.some((kw) => text.includes(kw))) {
        data.citizenship = country.value;
        return;
      }
    }

    // Fallback: try to find after keyword
    const citizenshipKeywords = ['ГРАЖДАНСТВО', 'CITIZENSHIP', 'ГРАЖДАНИН'];
    const citizenship = this.findValueAfterKeyword(text, citizenshipKeywords);

    if (citizenship) {
      data.citizenship = citizenship;
    }
  }

  private extractDates(text: string, data: PatentDataDto): void {
    const datePattern = /(\d{2})[.\/-](\d{2})[.\/-](\d{4})/g;
    const dates: Array<{ date: string; index: number }> = [];
    let match;

    while ((match = datePattern.exec(text)) !== null) {
      const [, day, month, year] = match;
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 2000 && yearNum <= 2100) {
        dates.push({ date: `${day}.${month}.${year}`, index: match.index });
      }
    }

    const issueKeywords = ['ВЫДАН', 'ДАТА ВЫДАЧИ', 'ISSUED', 'DATE OF ISSUE'];
    const validKeywords = ['ДЕЙСТВИТЕЛЕН', 'VALID', 'ДО', 'UNTIL', 'СРОК'];

    for (const dateInfo of dates) {
      const startIdx = Math.max(0, dateInfo.index - 30);
      const endIdx = Math.min(text.length, dateInfo.index + 20);
      const context = text.substring(startIdx, endIdx).toUpperCase();

      if (issueKeywords.some((kw) => context.includes(kw)) && !context.includes('ДО')) {
        if (!data.issueDate) data.issueDate = dateInfo.date;
      } else if (validKeywords.some((kw) => context.includes(kw))) {
        if (!data.validUntil) data.validUntil = dateInfo.date;
      }
    }

    // If we have 2 dates but couldn't categorize, assume chronological order
    if (dates.length >= 2 && !data.issueDate && !data.validUntil) {
      const sortedDates = dates.sort((a, b) => {
        const [, dayA, monthA, yearA] = a.date.match(/(\d+)\.(\d+)\.(\d+)/) || [];
        const [, dayB, monthB, yearB] = b.date.match(/(\d+)\.(\d+)\.(\d+)/) || [];
        const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
        const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
        return dateA.getTime() - dateB.getTime();
      });

      data.issueDate = sortedDates[0].date;
      data.validUntil = sortedDates[sortedDates.length - 1].date;
      this.addWarning('Date assignment is estimated - verify manually');
    }

    if (!data.validUntil) {
      this.addWarning('Could not extract validity date');
    }
  }

  private extractRegion(text: string, data: PatentDataDto): void {
    // Russian regions where patents are valid
    const regions = [
      { keywords: ['МОСКВА', 'MOSCOW', 'Г. МОСКВЕ'], value: 'МОСКВА' },
      { keywords: ['МОСКОВСКАЯ ОБЛ', 'МОСКОВСКОЙ ОБЛ', 'ПОДМОСКОВЬЕ'], value: 'МОСКОВСКАЯ ОБЛАСТЬ' },
      { keywords: ['САНКТ-ПЕТЕРБУРГ', 'СПБ', 'ST. PETERSBURG'], value: 'САНКТ-ПЕТЕРБУРГ' },
      { keywords: ['ЛЕНИНГРАДСКАЯ ОБЛ'], value: 'ЛЕНИНГРАДСКАЯ ОБЛАСТЬ' },
      { keywords: ['КРАСНОДАРСК', 'КРАСНОДАР'], value: 'КРАСНОДАРСКИЙ КРАЙ' },
      { keywords: ['СВЕРДЛОВСК', 'ЕКАТЕРИНБУРГ'], value: 'СВЕРДЛОВСКАЯ ОБЛАСТЬ' },
      { keywords: ['НОВОСИБИРСК'], value: 'НОВОСИБИРСКАЯ ОБЛАСТЬ' },
      { keywords: ['ТАТАРСТАН', 'КАЗАНЬ'], value: 'РЕСПУБЛИКА ТАТАРСТАН' },
      { keywords: ['РОСТОВ'], value: 'РОСТОВСКАЯ ОБЛАСТЬ' },
      { keywords: ['САМАРА', 'САМАРСК'], value: 'САМАРСКАЯ ОБЛАСТЬ' },
      { keywords: ['НИЖЕГОРОД', 'НИЖНИЙ НОВГОРОД'], value: 'НИЖЕГОРОДСКАЯ ОБЛАСТЬ' },
      { keywords: ['БАШКОРТОСТАН', 'УФА'], value: 'РЕСПУБЛИКА БАШКОРТОСТАН' },
    ];

    const regionKeywords = ['ТЕРРИТОРИЯ', 'РЕГИОН', 'СУБЪЕКТ', 'REGION'];
    const region = this.findAfterKeyword(text, regionKeywords, 50);

    if (region) {
      data.region = region;
      return;
    }

    // Detect by known regions
    for (const r of regions) {
      if (r.keywords.some((kw) => text.includes(kw))) {
        data.region = r.value;
        return;
      }
    }

    // Try to extract region from issuing authority
    if (text.includes('ГУ МВД') || text.includes('УМВД')) {
      const authorityPattern = /(?:ГУ\s*МВД|УМВД)[^А-Я]*ПО\s+([А-Я\s]+?)(?:\s+|$)/;
      const authorityMatch = text.match(authorityPattern);
      if (authorityMatch) {
        data.region = authorityMatch[1].trim();
      }
    }
  }

  private extractProfession(text: string, data: PatentDataDto): void {
    // Common professions for work patents - check first (multi-word professions first)
    const professions = [
      'ПОДСОБНЫЙ РАБОЧИЙ', 'РАЗНОРАБОЧИЙ', 'СТРОИТЕЛЬ', 'МАЛЯР', 'ШТУКАТУР',
      'ВОДИТЕЛЬ', 'ПРОДАВЕЦ', 'УБОРЩИК', 'ГРУЗЧИК', 'ОХРАННИК',
      'ПОВАР', 'ОФИЦИАНТ', 'КУРЬЕР', 'ЭЛЕКТРИК', 'САНТЕХНИК',
    ];

    // First check for known professions anywhere in text
    for (const prof of professions) {
      if (text.includes(prof)) {
        data.profession = prof;
        return;
      }
    }

    // Fallback: try to extract after keyword
    const professionKeywords = ['ПРОФЕССИЯ', 'PROFESSION', 'СПЕЦИАЛЬНОСТЬ', 'ДОЛЖНОСТЬ'];
    const profession = this.findValueAfterKeyword(text, professionKeywords);

    if (profession) {
      data.profession = profession;
    }
  }

  private extractIssuingAuthority(text: string, data: PatentDataDto): void {
    const authorityKeywords = ['ОРГАН ВЫДАЧИ', 'ВЫДАН', 'AUTHORITY', 'ISSUED BY'];

    // Common issuing authorities
    const authorityPattern = /(ГУ\s*МВД|УМВД|УФМС)[^А-Я]*(?:ПО|РОССИИ)[^.]+/i;
    const match = text.match(authorityPattern);

    if (match) {
      data.issuingAuthority = match[0].trim();
      return;
    }

    const authority = this.findAfterKeyword(text, authorityKeywords, 100);
    if (authority) {
      data.issuingAuthority = authority.replace(/^[:\s]+/, '');
    }
  }
}
