/**
 * MRZ (Machine Readable Zone) Parser for TD3 Passports
 * TD3 format: 2 lines x 44 characters
 */

export interface MRZData {
  documentType: string;
  countryCode: string;
  lastName: string;
  firstName: string;
  passportNumber: string;
  nationality: string;
  birthDate: string; // ISO format YYYY-MM-DD
  gender: 'male' | 'female' | undefined;
  expiryDate: string; // ISO format YYYY-MM-DD
  personalNumber?: string;
  isValid: boolean;
}

// Character weights for check digit calculation
const WEIGHTS = [7, 3, 1];

// MRZ character to value mapping
function charToValue(char: string): number {
  if (char >= '0' && char <= '9') {
    return parseInt(char, 10);
  }
  if (char >= 'A' && char <= 'Z') {
    return char.charCodeAt(0) - 55; // A=10, B=11, etc.
  }
  if (char === '<') {
    return 0;
  }
  return 0;
}

// Calculate MRZ check digit
function calculateCheckDigit(str: string): number {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += charToValue(str[i]) * WEIGHTS[i % 3];
  }
  return sum % 10;
}

// Validate check digit
function validateCheckDigit(str: string, checkDigit: string): boolean {
  if (checkDigit === '<') return str.replace(/</g, '').length === 0;
  const calculated = calculateCheckDigit(str);
  return calculated === parseInt(checkDigit, 10);
}

// Convert MRZ date (YYMMDD) to ISO date (YYYY-MM-DD)
function mrzDateToISO(mrzDate: string, isBirthDate: boolean = false): string {
  if (mrzDate.length !== 6) return '';

  const yy = parseInt(mrzDate.substring(0, 2), 10);
  const mm = mrzDate.substring(2, 4);
  const dd = mrzDate.substring(4, 6);

  // For birth dates: 00-30 = 2000-2030, 31-99 = 1931-1999
  // For expiry dates: 00-50 = 2000-2050, 51-99 = 1951-1999
  const currentYear = new Date().getFullYear() % 100;
  const threshold = isBirthDate ? 30 : 50;

  const yyyy = yy <= threshold ? 2000 + yy : 1900 + yy;

  return `${yyyy}-${mm}-${dd}`;
}

// Parse name from MRZ format (LASTNAME<<FIRSTNAME<MIDDLENAME)
function parseName(nameField: string): { lastName: string; firstName: string } {
  const parts = nameField.split('<<');
  const lastName = (parts[0] || '').replace(/</g, ' ').trim();
  const firstName = (parts[1] || '').replace(/</g, ' ').trim();

  return { lastName, firstName };
}

// Parse gender from MRZ
function parseGender(genderChar: string): 'male' | 'female' | undefined {
  if (genderChar === 'M') return 'male';
  if (genderChar === 'F') return 'female';
  return undefined;
}

/**
 * Parse MRZ from two lines of text
 * Line 1: P<UTOUSMANOV<<ALISHER<BAKHTIYAROVICH<<<<<<<<<<<<<<
 * Line 2: AA1234567<1UZB9005155M3001101<<<<<<<<<<<<<<02
 */
export function parseMRZ(line1: string, line2: string): MRZData | null {
  // Normalize lines - remove spaces, convert to uppercase
  line1 = line1.replace(/\s/g, '').toUpperCase();
  line2 = line2.replace(/\s/g, '').toUpperCase();

  // Validate line lengths (should be 44 characters each for TD3)
  if (line1.length < 44 || line2.length < 44) {
    return null;
  }

  // Take exactly 44 characters
  line1 = line1.substring(0, 44);
  line2 = line2.substring(0, 44);

  // Parse Line 1
  const documentType = line1.substring(0, 2).replace(/</g, '');
  const countryCode = line1.substring(2, 5).replace(/</g, '');
  const nameField = line1.substring(5, 44);
  const { lastName, firstName } = parseName(nameField);

  // Parse Line 2
  const passportNumber = line2.substring(0, 9).replace(/</g, '');
  const passportCheckDigit = line2.substring(9, 10);
  const nationality = line2.substring(10, 13).replace(/</g, '');
  const birthDateMRZ = line2.substring(13, 19);
  const birthCheckDigit = line2.substring(19, 20);
  const gender = parseGender(line2.substring(20, 21));
  const expiryDateMRZ = line2.substring(21, 27);
  const expiryCheckDigit = line2.substring(27, 28);
  const personalNumber = line2.substring(28, 42).replace(/</g, '') || undefined;
  const personalCheckDigit = line2.substring(42, 43);
  const compositeCheckDigit = line2.substring(43, 44);

  // Validate check digits
  const passportValid = validateCheckDigit(line2.substring(0, 9), passportCheckDigit);
  const birthValid = validateCheckDigit(birthDateMRZ, birthCheckDigit);
  const expiryValid = validateCheckDigit(expiryDateMRZ, expiryCheckDigit);
  const personalValid = validateCheckDigit(line2.substring(28, 42), personalCheckDigit);

  // Composite check digit validation
  const compositeString = line2.substring(0, 10) + line2.substring(13, 20) + line2.substring(21, 43);
  const compositeValid = validateCheckDigit(compositeString, compositeCheckDigit);

  const isValid = passportValid && birthValid && expiryValid && personalValid && compositeValid;

  return {
    documentType,
    countryCode,
    lastName,
    firstName,
    passportNumber,
    nationality,
    birthDate: mrzDateToISO(birthDateMRZ, true),
    gender,
    expiryDate: mrzDateToISO(expiryDateMRZ, false),
    personalNumber,
    isValid,
  };
}

/**
 * Find and extract MRZ lines from OCR text
 * Returns null if MRZ not found
 */
export function extractMRZFromText(text: string): { line1: string; line2: string } | null {
  // Normalize text
  const lines = text.split('\n').map(line => line.trim().toUpperCase());

  // Look for MRZ pattern - lines starting with P< (passport)
  // Also handle common OCR errors: 0 instead of O, etc.
  const mrzPattern = /^P[<0O]/;

  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i].replace(/\s/g, '');

    // Check if this looks like MRZ line 1
    if (mrzPattern.test(currentLine) && currentLine.length >= 30) {
      // Find the second MRZ line (should follow)
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const nextLine = lines[j].replace(/\s/g, '');

        // Second line should start with alphanumeric and be similar length
        if (nextLine.length >= 30 && /^[A-Z0-9]/.test(nextLine)) {
          // Fix common OCR errors
          const line1Fixed = fixOcrErrors(currentLine);
          const line2Fixed = fixOcrErrors(nextLine);

          return { line1: line1Fixed, line2: line2Fixed };
        }
      }
    }
  }

  return null;
}

/**
 * Fix common OCR errors in MRZ
 */
function fixOcrErrors(line: string): string {
  // Common substitutions in MRZ context
  return line
    .replace(/0/g, 'O') // In names, 0 should be O
    .replace(/P[O0]/g, 'P<') // Document type fix
    .replace(/[|I!]/g, '1') // Vertical lines to 1
    .replace(/[oO]/g, function(match, offset) {
      // In numeric positions (line 2), O should be 0
      // This is a simplified heuristic
      return match;
    });
}
