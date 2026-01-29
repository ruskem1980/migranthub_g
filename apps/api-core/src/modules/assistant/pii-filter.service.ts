import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * PII (Personally Identifiable Information) types detected by the filter
 */
export enum PiiType {
  PASSPORT_RF = 'PASSPORT_RF',
  INN = 'INN',
  SNILS = 'SNILS',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  BANK_CARD = 'BANK_CARD',
  NAME = 'NAME',
}

/**
 * Detected PII item with type and position
 */
export interface DetectedPii {
  type: PiiType;
  value: string;
  maskedValue: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Validation result for a message
 */
export interface ValidationResult {
  safe: boolean;
  warnings: string[];
  detectedPii: DetectedPii[];
}

/**
 * PII filter configuration levels
 */
export enum PiiFilterLevel {
  /** Only documents (passport, INN, SNILS) */
  DOCUMENTS = 'documents',
  /** Documents + phone/email */
  CONTACTS = 'contacts',
  /** Full filtering including names */
  FULL = 'full',
}

/**
 * Common Russian first names for optional name detection
 */
const COMMON_NAMES = new Set([
  // Male names
  'александр',
  'алексей',
  'анатолий',
  'андрей',
  'антон',
  'артём',
  'артем',
  'борис',
  'вадим',
  'валентин',
  'валерий',
  'василий',
  'виктор',
  'виталий',
  'владимир',
  'владислав',
  'вячеслав',
  'геннадий',
  'георгий',
  'григорий',
  'дмитрий',
  'евгений',
  'иван',
  'игорь',
  'илья',
  'кирилл',
  'константин',
  'леонид',
  'максим',
  'михаил',
  'никита',
  'николай',
  'олег',
  'павел',
  'пётр',
  'петр',
  'роман',
  'руслан',
  'сергей',
  'станислав',
  'степан',
  'тимур',
  'фёдор',
  'федор',
  'юрий',
  'ярослав',
  // Female names
  'александра',
  'алёна',
  'алена',
  'алина',
  'анастасия',
  'анна',
  'валентина',
  'валерия',
  'вера',
  'виктория',
  'галина',
  'дарья',
  'евгения',
  'екатерина',
  'елена',
  'ирина',
  'кристина',
  'ксения',
  'лариса',
  'людмила',
  'маргарита',
  'марина',
  'мария',
  'надежда',
  'наталья',
  'нина',
  'оксана',
  'ольга',
  'полина',
  'светлана',
  'софья',
  'софия',
  'татьяна',
  'юлия',
  'яна',
  // Central Asian names (common among migrants)
  'азамат',
  'азиз',
  'акбар',
  'бахтияр',
  'давлат',
  'джамшед',
  'зафар',
  'ислом',
  'камол',
  'мухаммад',
  'мухамад',
  'нодир',
  'рустам',
  'санжар',
  'тимур',
  'улугбек',
  'фаррух',
  'хуршед',
  'шавкат',
  'шерзод',
  'гулнора',
  'дилноза',
  'зарина',
  'зебо',
  'лола',
  'малика',
  'мунира',
  'нигора',
  'сабрина',
  'севара',
  'фатима',
  'ферузa',
  'феруза',
  'шахноза',
]);

/**
 * PII patterns with regex and masking rules
 */
interface PiiPattern {
  type: PiiType;
  regex: RegExp;
  mask: (match: string) => string;
  level: PiiFilterLevel;
}

@Injectable()
export class PiiFilterService {
  private readonly logger = new Logger(PiiFilterService.name);
  private readonly filterLevel: PiiFilterLevel;
  private readonly patterns: PiiPattern[];

  constructor(private readonly configService: ConfigService) {
    // Get filter level from config, default to CONTACTS
    const levelConfig = this.configService.get<string>('pii.filterLevel', 'contacts');
    this.filterLevel = this.parseFilterLevel(levelConfig);

    this.patterns = this.initPatterns();

    this.logger.log(`PiiFilterService initialized with level: ${this.filterLevel}`);
  }

  /**
   * Parse filter level from config string
   */
  private parseFilterLevel(level: string): PiiFilterLevel {
    switch (level.toLowerCase()) {
      case 'documents':
        return PiiFilterLevel.DOCUMENTS;
      case 'full':
        return PiiFilterLevel.FULL;
      case 'contacts':
      default:
        return PiiFilterLevel.CONTACTS;
    }
  }

  /**
   * Initialize PII detection patterns
   */
  private initPatterns(): PiiPattern[] {
    return [
      // Russian passport: XX XX XXXXXX (series + number)
      {
        type: PiiType.PASSPORT_RF,
        regex: /\b(\d{2})\s?(\d{2})\s?(\d{6})\b/g,
        mask: (match: string) => {
          const digits = match.replace(/\s/g, '');
          return `${digits.slice(0, 2)} ** ******`;
        },
        level: PiiFilterLevel.DOCUMENTS,
      },
      // INN: 10 or 12 digits
      {
        type: PiiType.INN,
        regex: /\b(\d{10}|\d{12})\b/g,
        mask: (match: string) => {
          if (match.length === 10) {
            return `${match.slice(0, 2)}********`;
          }
          return `${match.slice(0, 2)}**********`;
        },
        level: PiiFilterLevel.DOCUMENTS,
      },
      // SNILS: XXX-XXX-XXX XX or XXXXXXXXXXX
      {
        type: PiiType.SNILS,
        regex: /\b(\d{3})-?(\d{3})-?(\d{3})\s?(\d{2})\b/g,
        mask: () => '***-***-*** **',
        level: PiiFilterLevel.DOCUMENTS,
      },
      // Russian phone: +7/8 (XXX) XXX-XX-XX - requires country code or parentheses
      {
        type: PiiType.PHONE,
        regex:
          /(?:(?:\+7|8)\s?\(?(\d{3})\)?[\s-]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})|\((\d{3})\)\s?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2}))\b/g,
        mask: (match: string) => {
          // Extract area code from the match
          const cleaned = match.replace(/[\s()-]/g, '');
          const digits = cleaned.replace(/\D/g, '');
          // If starts with 7 or 8, skip first digit for area code
          const start = digits.startsWith('7') || digits.startsWith('8') ? 1 : 0;
          const areaCode = digits.slice(start, start + 3);
          return `+7 (${areaCode}) ***-**-**`;
        },
        level: PiiFilterLevel.CONTACTS,
      },
      // Email
      {
        type: PiiType.EMAIL,
        regex: /\b([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
        mask: (match: string) => {
          const [local, domain] = match.split('@');
          const maskedLocal =
            local.length > 2
              ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
              : '***';
          return `${maskedLocal}@${domain}`;
        },
        level: PiiFilterLevel.CONTACTS,
      },
      // Bank card: 16 digits
      {
        type: PiiType.BANK_CARD,
        regex: /\b(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})\b/g,
        mask: (match: string) => {
          const digits = match.replace(/[\s-]/g, '');
          return `${digits.slice(0, 4)} **** **** ${digits.slice(-4)}`;
        },
        level: PiiFilterLevel.DOCUMENTS,
      },
    ];
  }

  /**
   * Check if a pattern should be applied based on current filter level
   */
  private shouldApplyPattern(pattern: PiiPattern): boolean {
    const levelOrder = [PiiFilterLevel.DOCUMENTS, PiiFilterLevel.CONTACTS, PiiFilterLevel.FULL];
    const currentLevelIndex = levelOrder.indexOf(this.filterLevel);
    const patternLevelIndex = levelOrder.indexOf(pattern.level);
    return patternLevelIndex <= currentLevelIndex;
  }

  /**
   * Detect all PII in the given text
   */
  detectPii(text: string): DetectedPii[] {
    const detected: DetectedPii[] = [];

    // Apply regex patterns
    for (const pattern of this.patterns) {
      if (!this.shouldApplyPattern(pattern)) {
        continue;
      }

      // Reset regex lastIndex for global patterns
      pattern.regex.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = pattern.regex.exec(text)) !== null) {
        // Skip if this is likely a year (4 digits starting with 19 or 20)
        if (pattern.type === PiiType.INN && match[0].length === 10) {
          // Could be a date or other numeric sequence, additional validation
          const firstTwo = parseInt(match[0].slice(0, 2), 10);
          // INN regions start from 01 to 99, but we skip some obvious non-INN patterns
          if (firstTwo === 0) continue;
        }

        detected.push({
          type: pattern.type,
          value: match[0],
          maskedValue: pattern.mask(match[0]),
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    // Detect names if FULL level is enabled
    if (this.filterLevel === PiiFilterLevel.FULL) {
      const nameMatches = this.detectNames(text);
      detected.push(...nameMatches);
    }

    // Remove overlapping detections - prefer more specific patterns
    const deduped = this.deduplicateOverlapping(detected);

    // Sort by position in text
    deduped.sort((a, b) => a.startIndex - b.startIndex);

    return deduped;
  }

  /**
   * Priority order for PII types when deduplicating overlapping matches
   * Higher priority types are preferred when matches overlap
   */
  private readonly typePriority: Record<PiiType, number> = {
    [PiiType.SNILS]: 6, // Most specific format
    [PiiType.PASSPORT_RF]: 5, // Specific format
    [PiiType.BANK_CARD]: 4, // 16 digits is quite specific
    [PiiType.INN]: 3, // 10/12 digits
    [PiiType.EMAIL]: 2,
    [PiiType.PHONE]: 1, // Lowest priority - matches many number sequences
    [PiiType.NAME]: 0,
  };

  /**
   * Remove overlapping detections, preferring more specific types
   */
  private deduplicateOverlapping(detected: DetectedPii[]): DetectedPii[] {
    if (detected.length <= 1) {
      return detected;
    }

    // Sort by start position, then by priority (higher priority first)
    const sorted = [...detected].sort((a, b) => {
      if (a.startIndex !== b.startIndex) {
        return a.startIndex - b.startIndex;
      }
      return this.typePriority[b.type] - this.typePriority[a.type];
    });

    const result: DetectedPii[] = [];
    let lastEnd = -1;
    let lastPriority = -1;

    for (const item of sorted) {
      // Check if this item overlaps with the last accepted item
      if (item.startIndex < lastEnd) {
        // Overlapping - only replace if this has higher priority
        if (this.typePriority[item.type] > lastPriority) {
          result.pop();
          result.push(item);
          lastEnd = item.endIndex;
          lastPriority = this.typePriority[item.type];
        }
        // Otherwise skip this item (keep the existing one)
      } else {
        // No overlap, add this item
        result.push(item);
        lastEnd = item.endIndex;
        lastPriority = this.typePriority[item.type];
      }
    }

    return result;
  }

  /**
   * Detect common names in text (for FULL filter level)
   */
  private detectNames(text: string): DetectedPii[] {
    const detected: DetectedPii[] = [];
    const words = text.split(/\s+/);
    let currentIndex = 0;

    for (const word of words) {
      const cleanWord = word.replace(/[.,!?;:()"\[\]]/g, '').toLowerCase();
      const startIndex = text.indexOf(word, currentIndex);

      if (COMMON_NAMES.has(cleanWord) && cleanWord.length > 2) {
        detected.push({
          type: PiiType.NAME,
          value: word,
          maskedValue: `${word[0]}${'*'.repeat(word.length - 1)}`,
          startIndex,
          endIndex: startIndex + word.length,
        });
      }

      currentIndex = startIndex + word.length;
    }

    return detected;
  }

  /**
   * Mask all detected PII in the text
   */
  maskPii(text: string): string {
    const detected = this.detectPii(text);

    if (detected.length === 0) {
      return text;
    }

    // Build masked text by replacing detected PII from end to start
    // (to preserve indices)
    let maskedText = text;
    const sortedDesc = [...detected].sort((a, b) => b.startIndex - a.startIndex);

    for (const pii of sortedDesc) {
      maskedText =
        maskedText.slice(0, pii.startIndex) + pii.maskedValue + maskedText.slice(pii.endIndex);
    }

    return maskedText;
  }

  /**
   * Validate a message and return warnings about detected PII
   */
  validateMessage(text: string): ValidationResult {
    const detected = this.detectPii(text);
    const warnings: string[] = [];

    if (detected.length === 0) {
      return {
        safe: true,
        warnings: [],
        detectedPii: [],
      };
    }

    // Generate warnings by PII type
    const typeGroups = new Map<PiiType, number>();
    for (const pii of detected) {
      typeGroups.set(pii.type, (typeGroups.get(pii.type) || 0) + 1);
    }

    for (const [type, count] of typeGroups) {
      warnings.push(this.getWarningMessage(type, count));
    }

    // Log detection without actual values
    this.logPiiDetection(detected);

    return {
      safe: false,
      warnings,
      detectedPii: detected,
    };
  }

  /**
   * Get user-friendly warning message for PII type
   */
  private getWarningMessage(type: PiiType, count: number): string {
    const messages: Record<PiiType, string> = {
      [PiiType.PASSPORT_RF]: `Обнаружен номер паспорта (${count})`,
      [PiiType.INN]: `Обнаружен ИНН (${count})`,
      [PiiType.SNILS]: `Обнаружен СНИЛС (${count})`,
      [PiiType.PHONE]: `Обнаружен номер телефона (${count})`,
      [PiiType.EMAIL]: `Обнаружен email (${count})`,
      [PiiType.BANK_CARD]: `Обнаружен номер банковской карты (${count})`,
      [PiiType.NAME]: `Обнаружено имя (${count})`,
    };

    return messages[type] || `Обнаружены персональные данные типа ${type} (${count})`;
  }

  /**
   * Log PII detection without exposing actual values
   */
  private logPiiDetection(detected: DetectedPii[]): void {
    const summary = detected.reduce(
      (acc, pii) => {
        acc[pii.type] = (acc[pii.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    this.logger.warn(`PII detected in message: ${JSON.stringify(summary)}`);
  }

  /**
   * Get current filter level
   */
  getFilterLevel(): PiiFilterLevel {
    return this.filterLevel;
  }
}
