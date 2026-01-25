import jsPDF from 'jspdf';
import { getFormById, FIELD_LABELS } from './formsRegistry';
import { getFieldPlaceholder } from './utils/getMissingDocuments';
import { initCyrillicPDF, ROBOTO_FONT_NAME } from './fonts';
import { getTranslation, Language } from '@/lib/i18n';

// Convert form ID (kebab-case) to translation key (camelCase)
function formIdToKey(formId: string): string {
  return formId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

interface GeneratePDFOptions {
  formId: string;
  data: Record<string, any>;
  profileData: Record<string, any>;
  userLanguage?: Language; // Language for hints/explanations
}

// Cyrillic font support would require embedding fonts
// For now, we'll generate a simple PDF with form data

export async function generatePDF({ formId, data, profileData, userLanguage = 'ru' }: GeneratePDFOptions): Promise<Blob> {
  const form = getFormById(formId);
  if (!form) {
    throw new Error(`Form not found: ${formId}`);
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Initialize Cyrillic font support
  initCyrillicPDF(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(12);
  doc.text('MIGRANTHUB', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Title in Russian (official document language per RF law)
  doc.setFontSize(14);
  doc.text(form.titleShort, pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Title hint in user's language (if not Russian)
  if (userLanguage !== 'ru') {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const titleHint = getTranslation(userLanguage, `documents.forms.${formIdToKey(formId)}.titleShort`);
    if (titleHint && titleHint !== form.titleShort) {
      doc.text(`(${titleHint})`, pageWidth / 2, y, { align: 'center' });
    }
    doc.setTextColor(0, 0, 0);
  }
  y += 10;

  // Date
  doc.setFontSize(10);
  const today = new Date().toLocaleDateString('ru-RU');
  doc.text(`Дата: ${today}`, margin, y);
  y += 10;

  // Separator
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Form data
  doc.setFontSize(10);
  doc.setFont(ROBOTO_FONT_NAME, 'normal');

  const allData = { ...profileData, ...data };

  form.requiredFields.forEach((field) => {
    // Russian label (official)
    const label = FIELD_LABELS[field] || field;
    const rawValue = allData[field];
    const hasValue = rawValue !== undefined && rawValue !== null && rawValue !== '';

    let value: string;
    let isPlaceholder = false;

    if (hasValue) {
      value = String(rawValue);
    } else {
      // Use placeholder indicating which document is needed (in Russian)
      value = getFieldPlaceholder(field);
      isPlaceholder = true;
    }

    // Set gray color for placeholders
    if (isPlaceholder) {
      doc.setTextColor(128, 128, 128);
    } else {
      doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(10);
    doc.text(`${label}: ${value}`, margin, y);
    y += 5;

    // Add hint in user's language (small font) if not Russian
    if (userLanguage !== 'ru') {
      const fieldHint = getTranslation(userLanguage, `profile.fields.${field}`);
      if (fieldHint && fieldHint !== label) {
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(`(${fieldHint})`, margin + 2, y);
        doc.setTextColor(0, 0, 0);
      }
    }
    y += 5;

    // Check if we need a new page
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
  });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Additional fields from form data
  Object.entries(data).forEach(([key, value]) => {
    if (!form.requiredFields.includes(key) && value) {
      const label = FIELD_LABELS[key] || key;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`${label}: ${value}`, margin, y);
      y += 5;

      // Add hint in user's language (small font) if not Russian
      if (userLanguage !== 'ru') {
        const fieldHint = getTranslation(userLanguage, `profile.fields.${key}`);
        if (fieldHint && fieldHint !== label) {
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          doc.text(`(${fieldHint})`, margin + 2, y);
          doc.setTextColor(0, 0, 0);
        }
      }
      y += 5;

      if (y > 270) {
        doc.addPage();
        y = margin;
      }
    }
  });

  // Signature line
  y += 20;
  doc.text('Подпись: _______________', margin, y);
  y += 10;
  doc.text('Дата: _______________', margin, y);

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text(
    'Создано в MigrantHub — migranthub.ru',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc.output('blob');
}

export async function downloadPDF(options: GeneratePDFOptions): Promise<void> {
  const blob = await generatePDF(options);
  const form = getFormById(options.formId);

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${form?.id || 'document'}_${Date.now()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function previewPDF(options: GeneratePDFOptions): Promise<void> {
  const blob = await generatePDF(options);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export async function sharePDF(options: GeneratePDFOptions): Promise<void> {
  const blob = await generatePDF(options);
  const form = getFormById(options.formId);
  const file = new File([blob], `${form?.id || 'document'}.pdf`, { type: 'application/pdf' });

  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: form?.title || 'Document',
    });
  } else {
    // Fallback to download
    await downloadPDF(options);
  }
}
