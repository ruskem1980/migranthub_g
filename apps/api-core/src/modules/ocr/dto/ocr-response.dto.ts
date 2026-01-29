import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from './ocr-request.dto';

/**
 * Parsed passport data
 */
export class PassportDataDto {
  @ApiPropertyOptional({
    description: 'Passport series (first 4 digits)',
    example: '4511',
  })
  series?: string;

  @ApiPropertyOptional({
    description: 'Passport number (last 6 digits)',
    example: '123456',
  })
  number?: string;

  @ApiPropertyOptional({
    description: 'Full name (surname and given names)',
    example: 'ИВАНОВ ИВАН ИВАНОВИЧ',
  })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Surname',
    example: 'ИВАНОВ',
  })
  surname?: string;

  @ApiPropertyOptional({
    description: 'Given name(s)',
    example: 'ИВАН ИВАНОВИЧ',
  })
  givenNames?: string;

  @ApiPropertyOptional({
    description: 'Date of birth (DD.MM.YYYY)',
    example: '01.01.1990',
  })
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'Place of birth',
    example: 'Г. МОСКВА',
  })
  birthPlace?: string;

  @ApiPropertyOptional({
    description: 'Sex (M/F)',
    example: 'M',
  })
  sex?: string;

  @ApiPropertyOptional({
    description: 'Nationality/Citizenship',
    example: 'УЗБЕКИСТАН',
  })
  nationality?: string;

  @ApiPropertyOptional({
    description: 'Issue date (DD.MM.YYYY)',
    example: '15.03.2020',
  })
  issueDate?: string;

  @ApiPropertyOptional({
    description: 'Expiry date (DD.MM.YYYY)',
    example: '15.03.2030',
  })
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Issuing authority',
    example: 'МВД РЕСПУБЛИКИ УЗБЕКИСТАН',
  })
  issuingAuthority?: string;
}

/**
 * Parsed migration card data
 */
export class MigrationCardDataDto {
  @ApiPropertyOptional({
    description: 'Migration card series',
    example: '5019',
  })
  series?: string;

  @ApiPropertyOptional({
    description: 'Migration card number',
    example: '12345678',
  })
  number?: string;

  @ApiPropertyOptional({
    description: 'Full name from migration card',
    example: 'ИВАНОВ ИВАН ИВАНОВИЧ',
  })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Entry date to Russia (DD.MM.YYYY)',
    example: '01.06.2024',
  })
  entryDate?: string;

  @ApiPropertyOptional({
    description: 'Purpose of visit',
    example: 'РАБОТА',
  })
  visitPurpose?: string;

  @ApiPropertyOptional({
    description: 'Stay duration in days',
    example: '90',
  })
  stayDuration?: string;

  @ApiPropertyOptional({
    description: 'Entry checkpoint',
    example: 'ДОМОДЕДОВО',
  })
  entryCheckpoint?: string;
}

/**
 * Parsed patent data
 */
export class PatentDataDto {
  @ApiPropertyOptional({
    description: 'Patent series',
    example: '77',
  })
  series?: string;

  @ApiPropertyOptional({
    description: 'Patent number',
    example: '123456789',
  })
  number?: string;

  @ApiPropertyOptional({
    description: 'Full name',
    example: 'ИВАНОВ ИВАН ИВАНОВИЧ',
  })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Citizenship',
    example: 'УЗБЕКИСТАН',
  })
  citizenship?: string;

  @ApiPropertyOptional({
    description: 'Issue date (DD.MM.YYYY)',
    example: '01.06.2024',
  })
  issueDate?: string;

  @ApiPropertyOptional({
    description: 'Valid until date (DD.MM.YYYY)',
    example: '01.06.2025',
  })
  validUntil?: string;

  @ApiPropertyOptional({
    description: 'Region where patent is valid',
    example: 'МОСКВА',
  })
  region?: string;

  @ApiPropertyOptional({
    description: 'Profession/occupation',
    example: 'ПОДСОБНЫЙ РАБОЧИЙ',
  })
  profession?: string;

  @ApiPropertyOptional({
    description: 'Issuing authority',
    example: 'ГУ МВД РОССИИ ПО Г. МОСКВЕ',
  })
  issuingAuthority?: string;
}

/**
 * Parsed registration data
 */
export class RegistrationDataDto {
  @ApiPropertyOptional({
    description: 'Registration number',
    example: '77-23-123456',
  })
  registrationNumber?: string;

  @ApiPropertyOptional({
    description: 'Full name',
    example: 'ИВАНОВ ИВАН ИВАНОВИЧ',
  })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Registration address',
    example: 'Г. МОСКВА, УЛ. ПУШКИНА, Д. 10, КВ. 5',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'Registration date (DD.MM.YYYY)',
    example: '01.06.2024',
  })
  registrationDate?: string;

  @ApiPropertyOptional({
    description: 'Valid until date (DD.MM.YYYY)',
    example: '01.09.2024',
  })
  validUntil?: string;

  @ApiPropertyOptional({
    description: 'Host/sponsor name',
    example: 'ПЕТРОВ ПЕТР ПЕТРОВИЧ',
  })
  hostName?: string;

  @ApiPropertyOptional({
    description: 'Issuing authority',
    example: 'ОВМ УМВД РОССИИ ПО РАЙОНУ ТВЕРСКОЙ Г. МОСКВЫ',
  })
  issuingAuthority?: string;
}

/**
 * OCR processing result
 */
export class OcrResponseDto {
  @ApiProperty({
    description: 'Whether OCR processing was successful',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Detected or specified document type',
    enum: DocumentType,
    example: 'passport',
  })
  documentType!: DocumentType;

  @ApiProperty({
    description: 'Confidence level of recognition (0-100)',
    example: 85,
  })
  confidence!: number;

  @ApiPropertyOptional({
    description: 'Raw extracted text from document',
    example: 'ПАСПОРТ СЕРИЯ 4511 НОМЕР 123456...',
  })
  rawText?: string;

  @ApiPropertyOptional({
    description: 'Parsed passport data (if document is passport)',
    type: PassportDataDto,
  })
  passport?: PassportDataDto;

  @ApiPropertyOptional({
    description: 'Parsed migration card data (if document is migration card)',
    type: MigrationCardDataDto,
  })
  migrationCard?: MigrationCardDataDto;

  @ApiPropertyOptional({
    description: 'Parsed patent data (if document is patent)',
    type: PatentDataDto,
  })
  patent?: PatentDataDto;

  @ApiPropertyOptional({
    description: 'Parsed registration data (if document is registration)',
    type: RegistrationDataDto,
  })
  registration?: RegistrationDataDto;

  @ApiPropertyOptional({
    description: 'Error message if processing failed',
    example: 'Failed to recognize text in image',
  })
  error?: string;

  @ApiPropertyOptional({
    description: 'Processing time in milliseconds',
    example: 1234,
  })
  processingTimeMs?: number;

  @ApiPropertyOptional({
    description: 'Warnings about data quality or missing fields',
    type: [String],
    example: ['Low image quality', 'Some fields could not be parsed'],
  })
  warnings?: string[];
}
