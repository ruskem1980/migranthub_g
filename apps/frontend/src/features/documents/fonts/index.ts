/**
 * Font utilities for jsPDF with Cyrillic support
 */
import type { jsPDF } from 'jspdf';
import { robotoRegularBase64, ROBOTO_FONT_NAME } from './roboto-regular';

/**
 * Register Roboto font with jsPDF instance
 * Must be called before using Cyrillic text
 */
export function registerCyrillicFont(doc: jsPDF): void {
  // Add font file to virtual file system
  doc.addFileToVFS(`${ROBOTO_FONT_NAME}.ttf`, robotoRegularBase64);

  // Register the font
  doc.addFont(`${ROBOTO_FONT_NAME}.ttf`, ROBOTO_FONT_NAME, 'normal');
}

/**
 * Set Roboto as the current font
 */
export function setCyrillicFont(doc: jsPDF): void {
  doc.setFont(ROBOTO_FONT_NAME);
}

/**
 * Initialize jsPDF with Cyrillic support
 * Registers and sets Roboto font
 */
export function initCyrillicPDF(doc: jsPDF): void {
  registerCyrillicFont(doc);
  setCyrillicFont(doc);
}

export { robotoRegularBase64, ROBOTO_FONT_NAME };
