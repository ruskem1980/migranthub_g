import { getFormById, FIELD_SOURCE_DOCUMENT, FIELD_LABELS } from '../formsRegistry';

export interface MissingDocumentInfo {
  document: string;
  label: string;
  fields: string[];
  fieldLabels: string[];
}

export interface MissingDocumentsResult {
  missingDocuments: MissingDocumentInfo[];
  incompleteFields: Array<{
    field: string;
    label: string;
    documentLabel: string;
  }>;
  hasAllData: boolean;
}

/**
 * Check which documents are missing for a given form
 * @param formId - The form ID to check
 * @param profileData - Current profile data with field values
 * @param loadedDocuments - Array of document types that have been loaded (e.g., ['passport', 'migration_card'])
 * @returns Object with missing documents info and incomplete fields
 */
export function getMissingDocuments(
  formId: string,
  profileData: Record<string, any>,
  loadedDocuments: string[] = []
): MissingDocumentsResult {
  const form = getFormById(formId);
  if (!form) {
    return {
      missingDocuments: [],
      incompleteFields: [],
      hasAllData: true,
    };
  }

  const documentFieldsMap: Record<string, { fields: string[]; fieldLabels: string[] }> = {};
  const incompleteFields: MissingDocumentsResult['incompleteFields'] = [];

  // Check each required field
  for (const field of form.requiredFields) {
    const value = profileData[field];
    const hasValue = value !== undefined && value !== null && value !== '';

    if (!hasValue) {
      const sourceInfo = FIELD_SOURCE_DOCUMENT[field];
      const fieldLabel = FIELD_LABELS[field] || field;

      if (sourceInfo) {
        // Skip manual input fields - they don't require a document
        if (sourceInfo.document === 'manual') {
          continue;
        }

        // Track incomplete field
        incompleteFields.push({
          field,
          label: fieldLabel,
          documentLabel: sourceInfo.label,
        });

        // Group by document
        if (!documentFieldsMap[sourceInfo.document]) {
          documentFieldsMap[sourceInfo.document] = {
            fields: [],
            fieldLabels: [],
          };
        }
        documentFieldsMap[sourceInfo.document].fields.push(field);
        documentFieldsMap[sourceInfo.document].fieldLabels.push(fieldLabel);
      }
    }
  }

  // Build missing documents list (excluding already loaded documents)
  const missingDocuments: MissingDocumentInfo[] = [];

  for (const [document, data] of Object.entries(documentFieldsMap)) {
    // If document is loaded but still missing fields, it means data wasn't extracted properly
    // We still report it as needing attention
    if (!loadedDocuments.includes(document)) {
      const sourceInfo = FIELD_SOURCE_DOCUMENT[data.fields[0]];
      missingDocuments.push({
        document,
        label: sourceInfo?.label || document,
        fields: data.fields,
        fieldLabels: data.fieldLabels,
      });
    }
  }

  return {
    missingDocuments,
    incompleteFields,
    hasAllData: incompleteFields.length === 0,
  };
}

/**
 * Get placeholder text for a missing field in PDF
 * @param field - The field name
 * @returns Placeholder text indicating which document is needed
 */
export function getFieldPlaceholder(field: string): string {
  const sourceInfo = FIELD_SOURCE_DOCUMENT[field];
  if (sourceInfo && sourceInfo.document !== 'manual') {
    return `[Нужен документ: ${sourceInfo.label}]`;
  }
  return '_______________';
}

/**
 * Get unique list of missing document labels for a form
 * @param formId - The form ID
 * @param profileData - Current profile data
 * @returns Array of unique document labels that are missing
 */
export function getUniqueMissingDocumentLabels(
  formId: string,
  profileData: Record<string, any>
): string[] {
  const result = getMissingDocuments(formId, profileData);
  const labels = new Set<string>();

  for (const doc of result.missingDocuments) {
    labels.add(doc.label);
  }

  return Array.from(labels);
}
