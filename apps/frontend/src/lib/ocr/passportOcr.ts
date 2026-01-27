/**
 * Passport OCR Service using Tesseract.js
 * Supports CIS passports with Cyrillic and Latin text
 */

import Tesseract, { Worker, createWorker } from 'tesseract.js';
import { parseMRZ, extractMRZFromText, MRZData } from './mrzParser';

export interface PassportData {
  fullName?: string;
  fullNameLatin?: string;
  passportNumber?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  citizenship?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
}

export interface OcrProgress {
  status: 'loading' | 'recognizing' | 'done';
  progress: number; // 0-100
  message: string;
}

type ProgressCallback = (progress: OcrProgress) => void;

let worker: Worker | null = null;
let isWorkerReady = false;

/**
 * Initialize Tesseract worker with Russian and English languages
 */
export async function initializeOcr(onProgress?: ProgressCallback): Promise<void> {
  if (isWorkerReady && worker) {
    return;
  }

  onProgress?.({
    status: 'loading',
    progress: 0,
    message: 'Загрузка модели распознавания...',
  });

  worker = await createWorker('rus+eng', Tesseract.OEM.LSTM_ONLY, {
    logger: (m) => {
      if (m.status === 'loading tesseract core') {
        onProgress?.({
          status: 'loading',
          progress: 10,
          message: 'Загрузка ядра OCR...',
        });
      } else if (m.status === 'initializing tesseract') {
        onProgress?.({
          status: 'loading',
          progress: 20,
          message: 'Инициализация...',
        });
      } else if (m.status === 'loading language traineddata') {
        onProgress?.({
          status: 'loading',
          progress: 30 + (m.progress || 0) * 50,
          message: 'Загрузка языковых моделей...',
        });
      } else if (m.status === 'initializing api') {
        onProgress?.({
          status: 'loading',
          progress: 90,
          message: 'Подготовка к распознаванию...',
        });
      }
    },
  });

  isWorkerReady = true;

  onProgress?.({
    status: 'loading',
    progress: 100,
    message: 'Готово к распознаванию',
  });
}

/**
 * Preprocess image for better OCR results
 * Uses canvas to adjust contrast and convert to grayscale
 */
export async function preprocessImage(imageSource: string | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert to grayscale and increase contrast
      for (let i = 0; i < data.length; i += 4) {
        // Grayscale
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

        // Increase contrast (factor 1.5)
        const factor = 1.5;
        const adjusted = factor * (gray - 128) + 128;
        const final = Math.max(0, Math.min(255, adjusted));

        data[i] = final;     // R
        data[i + 1] = final; // G
        data[i + 2] = final; // B
        // Alpha unchanged
      }

      ctx.putImageData(imageData, 0, 0);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(imageSource);
    }
  });
}

/**
 * Recognize passport and extract data
 */
export async function recognizePassport(
  imageSource: string | File,
  onProgress?: ProgressCallback
): Promise<PassportData> {
  // Initialize worker if needed
  if (!isWorkerReady || !worker) {
    await initializeOcr(onProgress);
  }

  if (!worker) {
    throw new Error('OCR worker not initialized');
  }

  onProgress?.({
    status: 'recognizing',
    progress: 0,
    message: 'Подготовка изображения...',
  });

  // Preprocess image
  const processedImage = await preprocessImage(imageSource);

  onProgress?.({
    status: 'recognizing',
    progress: 20,
    message: 'Распознавание текста...',
  });

  // Perform OCR
  const result = await worker.recognize(processedImage);
  const text = result.data.text;

  onProgress?.({
    status: 'recognizing',
    progress: 80,
    message: 'Анализ данных...',
  });

  // Try to extract MRZ first
  const mrzLines = extractMRZFromText(text);

  if (mrzLines) {
    const mrzData = parseMRZ(mrzLines.line1, mrzLines.line2);

    if (mrzData) {
      onProgress?.({
        status: 'done',
        progress: 100,
        message: 'Распознавание завершено',
      });

      return convertMRZToPassportData(mrzData, text);
    }
  }

  // Fallback: try to extract data from plain text
  const fallbackData = extractFromPlainText(text);

  onProgress?.({
    status: 'done',
    progress: 100,
    message: 'Распознавание завершено',
  });

  return fallbackData;
}

/**
 * Convert MRZ data to PassportData format
 */
function convertMRZToPassportData(mrz: MRZData, fullText: string): PassportData {
  // Try to find Cyrillic name in the text
  const cyrillicName = extractCyrillicName(fullText);

  return {
    fullName: cyrillicName || `${mrz.lastName} ${mrz.firstName}`,
    fullNameLatin: `${mrz.lastName} ${mrz.firstName}`,
    passportNumber: formatPassportNumber(mrz.passportNumber),
    birthDate: mrz.birthDate,
    gender: mrz.gender,
    citizenship: mrz.nationality,
    passportExpiryDate: mrz.expiryDate,
  };
}

/**
 * Extract Cyrillic name from OCR text
 */
function extractCyrillicName(text: string): string | undefined {
  // Look for Cyrillic names (uppercase letters, typically after "ФАМИЛИЯ" or "SURNAME")
  const cyrillicPattern = /[А-ЯЁ]{2,}\s+[А-ЯЁ]{2,}(?:\s+[А-ЯЁ]{2,})?/g;
  const matches = text.match(cyrillicPattern);

  if (matches && matches.length > 0) {
    // Return the longest match (most likely the full name)
    return matches.sort((a, b) => b.length - a.length)[0];
  }

  return undefined;
}

/**
 * Format passport number (add space after series)
 */
function formatPassportNumber(number: string): string {
  // Common format: AA1234567 -> AA 1234567
  const match = number.match(/^([A-Z]{2})(\d+)$/);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }
  return number;
}

/**
 * Fallback: extract data from plain text without MRZ
 */
function extractFromPlainText(text: string): PassportData {
  const data: PassportData = {};

  // Extract passport number (various formats)
  const passportMatch = text.match(/([A-Z]{1,2})\s*(\d{6,9})/);
  if (passportMatch) {
    data.passportNumber = `${passportMatch[1]} ${passportMatch[2]}`;
  }

  // Extract date (DD.MM.YYYY or DD/MM/YYYY format)
  const dateMatches = text.match(/(\d{2})[.\/](\d{2})[.\/](\d{4})/g);
  if (dateMatches && dateMatches.length > 0) {
    // First date is usually birth date
    const birthMatch = dateMatches[0].match(/(\d{2})[.\/](\d{2})[.\/](\d{4})/);
    if (birthMatch) {
      data.birthDate = `${birthMatch[3]}-${birthMatch[2]}-${birthMatch[1]}`;
    }
  }

  // Extract Cyrillic name
  const cyrillicName = extractCyrillicName(text);
  if (cyrillicName) {
    data.fullName = cyrillicName;
  }

  // Extract gender
  if (/\bМУЖ\b|\bМ\b|\bMALE\b|\bM\b/i.test(text)) {
    data.gender = 'male';
  } else if (/\bЖЕН\b|\bЖ\b|\bFEMALE\b|\bF\b/i.test(text)) {
    data.gender = 'female';
  }

  // Extract citizenship (3-letter code)
  const citizenshipMatch = text.match(/\b(UZB|TJK|KGZ|KAZ|RUS|UKR|BLR|MDA|AZE|ARM|GEO|TKM)\b/);
  if (citizenshipMatch) {
    data.citizenship = citizenshipMatch[1];
  }

  return data;
}

/**
 * Terminate the OCR worker
 */
export async function terminateOcr(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
    isWorkerReady = false;
  }
}
