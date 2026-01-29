import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Document types supported by OCR
 */
export enum DocumentType {
  PASSPORT = 'passport',
  MIGRATION_CARD = 'migration_card',
  PATENT = 'patent',
  REGISTRATION = 'registration',
  AUTO = 'auto',
}

export class OcrRequestDto {
  @ApiPropertyOptional({
    description: 'Document type to parse. Use "auto" for automatic detection.',
    enum: DocumentType,
    default: DocumentType.AUTO,
    example: 'passport',
  })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType = DocumentType.AUTO;
}

export class OcrFileUploadDto {
  @ApiProperty({
    description: 'Document image file (JPEG, PNG, WebP, BMP, TIFF)',
    type: 'string',
    format: 'binary',
  })
  file!: Express.Multer.File;
}
