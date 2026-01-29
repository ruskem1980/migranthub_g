import { BaseDocumentParser, ParseResult } from './base.parser';
import { MigrationCardDataDto } from '../dto';

/**
 * Parser for Russian migration card documents
 */
export class MigrationCardParser extends BaseDocumentParser<MigrationCardDataDto> {
  private readonly DETECTION_KEYWORDS = [
    'МИГРАЦИОННАЯ КАРТА',
    'MIGRATION CARD',
    'ВЪЕЗД',
    'ENTRY',
    'ВЫЕЗД',
    'EXIT',
    'ЦЕЛЬ ВИЗИТА',
    'PURPOSE OF VISIT',
    'СРОК ПРЕБЫВАНИЯ',
    'ПРИНИМАЮЩАЯ СТОРОНА',
  ];

  private readonly REQUIRED_FIELDS = ['series', 'number', 'fullName', 'entryDate'];

  detect(text: string): boolean {
    const normalizedText = this.normalizeText(text);
    let matchCount = 0;

    for (const keyword of this.DETECTION_KEYWORDS) {
      if (normalizedText.includes(keyword.toUpperCase())) {
        matchCount++;
      }
    }

    // Need at least 2 keywords or explicit mention
    return matchCount >= 2 || normalizedText.includes('МИГРАЦИОННАЯ КАРТА');
  }

  parse(text: string): ParseResult<MigrationCardDataDto> {
    this.resetWarnings();
    const data: MigrationCardDataDto = {};
    const normalizedText = this.normalizeText(text);

    // Extract series and number
    this.extractSeriesNumber(normalizedText, data);

    // Extract full name
    this.extractName(normalizedText, data);

    // Extract entry date
    this.extractEntryDate(normalizedText, data);

    // Extract visit purpose
    this.extractVisitPurpose(normalizedText, data);

    // Extract stay duration
    this.extractStayDuration(normalizedText, data);

    // Extract entry checkpoint
    this.extractEntryCheckpoint(normalizedText, data);

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

  private extractSeriesNumber(text: string, data: MigrationCardDataDto): void {
    // Migration card format: СЕРИЯ ХХХХ № ХХХХХХХХ or similar
    const patterns = [
      /(?:СЕРИЯ\s*)?(\d{4})\s*(?:№|N|НОМЕР)\s*(\d{7,8})/i,
      /(\d{4})\s+(\d{7,8})/,
      /([А-Я]{2})\s*(\d{6,8})/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        data.series = match[1];
        data.number = match[2];
        return;
      }
    }

    this.addWarning('Could not extract migration card series/number');
  }

  private extractName(text: string, data: MigrationCardDataDto): void {
    const nameKeywords = ['ФАМИЛИЯ', 'ИМЯ', 'SURNAME', 'NAME', 'ФИО'];
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

  private extractEntryDate(text: string, data: MigrationCardDataDto): void {
    const entryKeywords = ['ВЪЕЗД', 'ENTRY', 'ДАТА ВЪЕЗДА', 'DATE OF ENTRY'];

    // Find date near entry keywords
    for (const keyword of entryKeywords) {
      const index = text.indexOf(keyword.toUpperCase());
      if (index !== -1) {
        const context = text.substring(index, index + 50);
        const dateMatch = context.match(/(\d{2})[.\/-](\d{2})[.\/-](\d{4})/);
        if (dateMatch) {
          data.entryDate = `${dateMatch[1]}.${dateMatch[2]}.${dateMatch[3]}`;
          return;
        }
      }
    }

    // Fallback: extract any date
    const date = this.extractDate(text);
    if (date) {
      data.entryDate = date;
      this.addWarning('Entry date estimated - verify manually');
    } else {
      this.addWarning('Could not extract entry date');
    }
  }

  private extractVisitPurpose(text: string, data: MigrationCardDataDto): void {
    // Common visit purposes to detect
    const purposes = [
      { keywords: ['РАБОТА', 'WORK', 'EMPLOYMENT'], value: 'РАБОТА' },
      { keywords: ['УЧЕБА', 'STUDY', 'EDUCATION'], value: 'УЧЕБА' },
      { keywords: ['ТУРИЗМ', 'TOURISM', 'TOURIST'], value: 'ТУРИЗМ' },
      { keywords: ['ЧАСТНАЯ', 'PRIVATE'], value: 'ЧАСТНАЯ' },
      { keywords: ['ДЕЛОВАЯ', 'BUSINESS'], value: 'ДЕЛОВАЯ' },
      { keywords: ['ЛЕЧЕНИЕ', 'MEDICAL', 'TREATMENT'], value: 'ЛЕЧЕНИЕ' },
      { keywords: ['ТРАНЗИТ', 'TRANSIT'], value: 'ТРАНЗИТ' },
      { keywords: ['СЛУЖЕБНАЯ', 'OFFICIAL'], value: 'СЛУЖЕБНАЯ' },
    ];

    // First try to find purpose using the value extraction method
    const purposeKeywords = ['ЦЕЛЬ ВИЗИТА', 'PURPOSE', 'ЦЕЛЬ ВЪЕЗДА'];
    const purpose = this.findValueAfterKeyword(text, purposeKeywords, [
      'СРОК',
      'ПУНКТ',
      'ДАТА',
      'ФАМИЛИЯ',
      'ДОМОДЕДОВО',
      'ШЕРЕМЕТЬЕВО',
    ]);

    if (purpose) {
      // Check if it matches a known purpose
      for (const p of purposes) {
        if (p.keywords.some((kw) => purpose.toUpperCase().includes(kw))) {
          data.visitPurpose = p.value;
          return;
        }
      }
      // If no match, use the extracted value (first word only)
      const firstWord = purpose.split(/\s+/)[0];
      data.visitPurpose = firstWord;
      return;
    }

    // Fallback: Detect purpose by common keywords anywhere in text
    for (const p of purposes) {
      if (p.keywords.some((kw) => text.includes(kw))) {
        data.visitPurpose = p.value;
        return;
      }
    }
  }

  private extractStayDuration(text: string, data: MigrationCardDataDto): void {
    const durationKeywords = ['СРОК ПРЕБЫВАНИЯ', 'STAY DURATION', 'ДНЕ', 'DAYS'];

    // Look for number followed by days
    const durationPattern = /(\d{1,3})\s*(?:ДН|DAYS|ДНЕЙ|СУТ)/i;
    const match = text.match(durationPattern);

    if (match) {
      data.stayDuration = match[1];
      return;
    }

    // Try after keywords
    const duration = this.findAfterKeyword(text, durationKeywords, 20);
    if (duration) {
      const numMatch = duration.match(/\d+/);
      if (numMatch) {
        data.stayDuration = numMatch[0];
      }
    }
  }

  private extractEntryCheckpoint(text: string, data: MigrationCardDataDto): void {
    const checkpointKeywords = ['ПУНКТ ПРОПУСКА', 'CHECKPOINT', 'КПП', 'ВЪЕЗД ЧЕРЕЗ'];

    // Common entry checkpoints
    const checkpoints = [
      'ДОМОДЕДОВО',
      'ШЕРЕМЕТЬЕВО',
      'ВНУКОВО',
      'ПУЛКОВО',
      'КОЛЬЦОВО',
      'ТОЛМАЧЕВО',
      'КАЗАНЬ',
      'САМАРА',
      'СОЧИ',
      'КРАСНОДАР',
      'РОСТОВ',
      'ВЛАДИВОСТОК',
      'DOMODEDOVO',
      'SHEREMETYEVO',
      'VNUKOVO',
      'PULKOVO',
    ];

    // Try to find after keyword
    const checkpoint = this.findAfterKeyword(text, checkpointKeywords, 40);
    if (checkpoint) {
      data.entryCheckpoint = checkpoint;
      return;
    }

    // Detect by known checkpoints
    for (const cp of checkpoints) {
      if (text.includes(cp)) {
        data.entryCheckpoint = cp;
        return;
      }
    }
  }
}
