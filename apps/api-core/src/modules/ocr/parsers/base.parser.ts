/**
 * Base interface for document parsers
 */
export interface ParsedField {
  value: string;
  confidence: number;
}

export interface ParseResult<T> {
  data: T;
  confidence: number;
  warnings: string[];
}

/**
 * Base class for document parsers
 * Provides common utilities for text parsing
 */
export abstract class BaseDocumentParser<T> {
  protected warnings: string[] = [];

  /**
   * Parse raw text into structured document data
   */
  abstract parse(text: string): ParseResult<T>;

  /**
   * Check if the text likely represents this document type
   */
  abstract detect(text: string): boolean;

  /**
   * Clean and normalize text for parsing
   */
  protected normalizeText(text: string): string {
    return text
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .replace(/[""«»]/g, '"')
      .trim();
  }

  /**
   * Extract date in DD.MM.YYYY format
   */
  protected extractDate(text: string, pattern?: RegExp): string | undefined {
    const datePatterns = pattern
      ? [pattern]
      : [
          /(\d{2})[.\/-](\d{2})[.\/-](\d{4})/g,
          /(\d{2})\s*(\d{2})\s*(\d{4})/g,
        ];

    for (const p of datePatterns) {
      const matches = text.matchAll(p);
      for (const match of matches) {
        const [, day, month, year] = match;
        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        // Basic validation
        if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
          return `${day}.${month}.${year}`;
        }
      }
    }
    return undefined;
  }

  /**
   * Extract numbers from text
   */
  protected extractNumbers(text: string, minLength: number = 1): string[] {
    const matches = text.match(/\d+/g) || [];
    return matches.filter((m) => m.length >= minLength);
  }

  /**
   * Find text after a keyword
   */
  protected findAfterKeyword(
    text: string,
    keywords: string[],
    maxLength: number = 100,
  ): string | undefined {
    const normalizedText = this.normalizeText(text);

    for (const keyword of keywords) {
      const upperKeyword = keyword.toUpperCase();
      const index = normalizedText.indexOf(upperKeyword);
      if (index !== -1) {
        const startIndex = index + upperKeyword.length;
        let remaining = normalizedText.substring(startIndex, startIndex + maxLength).trim();

        // Remove leading colons and spaces
        remaining = remaining.replace(/^[:\s]+/, '');

        // Take first word/value - stop at common delimiters
        // Stop at next keyword-like uppercase word after a space
        const wordMatch = remaining.match(/^([А-ЯЁA-Z0-9][А-ЯЁа-яёA-Za-z0-9.\-/]*)/);
        if (wordMatch) {
          return wordMatch[1].trim();
        }

        return remaining.split(/\s{2,}|\n|\r/)[0].trim();
      }
    }
    return undefined;
  }

  /**
   * Find a single value (word or phrase) after a keyword
   */
  protected findValueAfterKeyword(
    text: string,
    keywords: string[],
    stopKeywords: string[] = [],
  ): string | undefined {
    const normalizedText = this.normalizeText(text);

    for (const keyword of keywords) {
      const upperKeyword = keyword.toUpperCase();
      const index = normalizedText.indexOf(upperKeyword);
      if (index !== -1) {
        const startIndex = index + upperKeyword.length;
        let remaining = normalizedText.substring(startIndex).trim();

        // Remove leading colons and spaces
        remaining = remaining.replace(/^[:\s]+/, '');

        // Find where to stop
        let endIndex = remaining.length;

        // Stop at common structural keywords
        const defaultStopKeywords = [
          'ДАТА', 'НОМЕР', 'СЕРИЯ', 'ВЫДАН', 'МЕСТО', 'ПОЛ', 'ГРАЖДАНСТВО',
          'ФАМИЛИЯ', 'ИМЯ', 'ОТЧЕСТВО', 'СРОК', 'ДЕЙСТВИТЕЛЕН', 'АДРЕС',
          'ПРИНИМАЮЩАЯ', 'ЦЕЛЬ', 'ВЪЕЗД', 'ПРОФЕССИЯ', 'ТЕРРИТОРИЯ',
        ];

        const allStopKeywords = [...stopKeywords, ...defaultStopKeywords];

        for (const stopKw of allStopKeywords) {
          const stopIndex = remaining.indexOf(stopKw.toUpperCase());
          if (stopIndex > 0 && stopIndex < endIndex) {
            endIndex = stopIndex;
          }
        }

        const result = remaining.substring(0, endIndex).trim();
        // Clean up trailing spaces and punctuation
        return result.replace(/[\s,;:]+$/, '').trim();
      }
    }
    return undefined;
  }

  /**
   * Find text between two keywords
   */
  protected findBetweenKeywords(
    text: string,
    startKeywords: string[],
    endKeywords: string[],
  ): string | undefined {
    const normalizedText = this.normalizeText(text);

    for (const startKw of startKeywords) {
      const startIndex = normalizedText.indexOf(startKw.toUpperCase());
      if (startIndex === -1) continue;

      for (const endKw of endKeywords) {
        const endIndex = normalizedText.indexOf(endKw.toUpperCase(), startIndex + startKw.length);
        if (endIndex !== -1) {
          return normalizedText.substring(startIndex + startKw.length, endIndex).trim();
        }
      }
    }
    return undefined;
  }

  /**
   * Extract Cyrillic name (ФАМИЛИЯ ИМЯ ОТЧЕСТВО)
   */
  protected extractCyrillicName(text: string): string | undefined {
    // Match 2-4 Cyrillic words (surname, name, patronymic, possibly prefix)
    const namePattern = /([А-ЯЁ][А-ЯЁа-яё-]+(?:\s+[А-ЯЁ][А-ЯЁа-яё-]+){1,3})/g;
    const matches = text.match(namePattern);

    if (matches && matches.length > 0) {
      // Return the longest match as it's likely the full name
      return matches.sort((a, b) => b.length - a.length)[0].trim();
    }
    return undefined;
  }

  /**
   * Add a warning
   */
  protected addWarning(message: string): void {
    if (!this.warnings.includes(message)) {
      this.warnings.push(message);
    }
  }

  /**
   * Reset warnings for new parse
   */
  protected resetWarnings(): void {
    this.warnings = [];
  }

  /**
   * Calculate confidence based on parsed fields
   */
  protected calculateConfidence(data: T, requiredFields: string[]): number {
    const dataObj = data as Record<string, unknown>;
    let filledFields = 0;

    for (const field of requiredFields) {
      if (dataObj[field] !== undefined && dataObj[field] !== null && dataObj[field] !== '') {
        filledFields++;
      }
    }

    return Math.round((filledFields / requiredFields.length) * 100);
  }
}
