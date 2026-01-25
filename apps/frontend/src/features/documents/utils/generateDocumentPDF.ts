/**
 * PDF generation utilities for documents
 */
import { jsPDF } from 'jspdf';
import type { TypedDocument, DocumentTypeValue } from '@/lib/db/types';
import { documentTypeLabels } from '@/lib/db/types';
import { getSampleDataForDocument, documentFieldLabels } from '../sampleData/index';
import { initCyrillicPDF, ROBOTO_FONT_NAME } from '../fonts';

/**
 * Get field value or sample placeholder
 */
function getFieldValue(
  data: Record<string, unknown>,
  field: string,
  sampleData: Record<string, unknown>
): { value: string; isPlaceholder: boolean } {
  const value = data[field];
  if (value !== undefined && value !== null && value !== '') {
    // Format date fields
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return { value: formatDateForPDF(value), isPlaceholder: false };
    }
    // Format gender
    if (field === 'gender') {
      return { value: value === 'male' ? 'Мужской' : 'Женский', isPlaceholder: false };
    }
    return { value: String(value), isPlaceholder: false };
  }

  const sampleValue = sampleData[field];
  if (sampleValue !== undefined && sampleValue !== null && sampleValue !== '') {
    // Format sample date fields
    if (typeof sampleValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(sampleValue)) {
      return { value: `[${formatDateForPDF(sampleValue)}]`, isPlaceholder: true };
    }
    // Format sample gender
    if (field === 'gender') {
      return { value: `[${sampleValue === 'male' ? 'Мужской' : 'Женский'}]`, isPlaceholder: true };
    }
    return { value: `[${sampleValue}]`, isPlaceholder: true };
  }

  return { value: '[не указано]', isPlaceholder: true };
}

/**
 * Format date for PDF display
 */
function formatDateForPDF(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Get field label for display
 */
function getFieldLabel(field: string, documentType: DocumentTypeValue): string {
  const labels = documentFieldLabels[documentType];
  return labels?.[field] || field;
}

/**
 * Field order by document type for proper display
 */
const fieldOrder: Record<DocumentTypeValue, string[]> = {
  passport: [
    'lastName', 'firstName', 'middleName',
    'lastNameLatin', 'firstNameLatin',
    'birthDate', 'birthPlace', 'gender',
    'citizenship', 'passportSeries', 'passportNumber',
    'issueDate', 'expiryDate', 'issuedBy',
  ],
  migration_card: [
    'lastName', 'firstName', 'middleName',
    'cardSeries', 'cardNumber',
    'entryDate', 'stayUntil',
    'entryPurpose', 'entryPoint',
  ],
  patent: [
    'lastName', 'firstName', 'middleName',
    'patentSeries', 'patentNumber',
    'issueDate', 'expiryDate',
    'region', 'profession',
    'issuedBy',
  ],
  registration: [
    'lastName', 'firstName', 'middleName',
    'registrationType',
    'registrationDate', 'expiryDate',
    'region', 'city', 'street', 'building', 'apartment',
    'hostFullName', 'hostDocumentInfo',
  ],
  inn: [
    'fullName', 'innNumber',
    'issueDate', 'issuedBy', 'taxAuthorityCode',
  ],
  snils: [
    'fullName', 'snilsNumber',
    'birthDate', 'birthPlace', 'gender',
    'registrationDate',
  ],
  dms: [
    'fullName', 'policyNumber',
    'insuranceCompany', 'programName',
    'startDate', 'expiryDate',
    'coverageTerritory', 'insurancePhone',
  ],
};

/**
 * Generate PDF for a document
 */
export async function generateDocumentPDF(document: TypedDocument): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Initialize Cyrillic font support
  initCyrillicPDF(doc);

  const sampleData = getSampleDataForDocument(document.type);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('MIGRANTHUB', pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(documentTypeLabels[document.type], pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Generation date
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Сформирован: ${new Date().toLocaleDateString('ru-RU')}`, pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Document data
  doc.setFontSize(10);
  const data = document.data as Record<string, unknown>;
  const fields = fieldOrder[document.type] || Object.keys(data);

  for (const field of fields) {
    // Skip empty fields not in data
    if (!(field in data) && !(field in sampleData)) continue;

    const { value, isPlaceholder } = getFieldValue(data, field, sampleData);
    const label = getFieldLabel(field, document.type);

    // Set color based on whether it's a placeholder
    if (isPlaceholder) {
      doc.setTextColor(150, 150, 150);
    } else {
      doc.setTextColor(0, 0, 0);
    }

    // Label (bold simulation - Roboto doesn't have bold variant, use larger size briefly)
    doc.setFont(ROBOTO_FONT_NAME, 'normal');
    doc.text(`${label}:`, margin, y);

    // Value - split long text
    const labelWidth = doc.getTextWidth(`${label}: `);
    const maxValueWidth = pageWidth - margin * 2 - labelWidth;
    const valueLines = doc.splitTextToSize(value, maxValueWidth);

    if (valueLines.length === 1) {
      doc.text(value, margin + labelWidth, y);
      y += 7;
    } else {
      y += 5;
      for (const line of valueLines) {
        doc.text(line, margin + 5, y);
        y += 6;
      }
      y += 2;
    }

    // Check for page break
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
  }

  // Footer with legend
  y = Math.max(y + 10, doc.internal.pageSize.getHeight() - 30);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('[значение] — образец данных (не заполнено)', margin, y);
  y += 10;

  doc.text('Создано в MigrantHub', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  return doc.output('blob');
}

/**
 * Preview document PDF in new window
 */
export async function previewDocumentPDF(document: TypedDocument): Promise<void> {
  const blob = await generateDocumentPDF(document);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

/**
 * Download document PDF
 */
export async function downloadDocumentPDF(document: TypedDocument): Promise<void> {
  const blob = await generateDocumentPDF(document);
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;

  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  link.download = `${documentTypeLabels[document.type]}_${timestamp}.pdf`;

  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
