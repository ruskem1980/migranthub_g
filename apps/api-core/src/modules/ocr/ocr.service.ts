import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Tesseract from 'tesseract.js';
import {
  DocumentType,
  OcrResponseDto,
  PassportDataDto,
  MigrationCardDataDto,
  PatentDataDto,
  RegistrationDataDto,
} from './dto';
import {
  PassportParser,
  MigrationCardParser,
  PatentParser,
  RegistrationParser,
  ParseResult,
} from './parsers';

/**
 * Supported image MIME types
 */
const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/tiff',
];

/**
 * Maximum file size in bytes (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private readonly passportParser: PassportParser;
  private readonly migrationCardParser: MigrationCardParser;
  private readonly patentParser: PatentParser;
  private readonly registrationParser: RegistrationParser;

  // Tesseract worker pool for better performance
  private worker: Tesseract.Worker | null = null;
  private workerInitializing = false;
  private workerInitPromise: Promise<Tesseract.Worker> | null = null;

  constructor(private readonly configService: ConfigService) {
    this.passportParser = new PassportParser();
    this.migrationCardParser = new MigrationCardParser();
    this.patentParser = new PatentParser();
    this.registrationParser = new RegistrationParser();

    this.logger.log('OcrService initialized');
  }

  /**
   * Initialize Tesseract worker lazily
   */
  private async getWorker(): Promise<Tesseract.Worker> {
    if (this.worker) {
      return this.worker;
    }

    if (this.workerInitPromise) {
      return this.workerInitPromise;
    }

    this.workerInitPromise = this.initializeWorker();
    return this.workerInitPromise;
  }

  private async initializeWorker(): Promise<Tesseract.Worker> {
    this.workerInitializing = true;
    this.logger.log('Initializing Tesseract worker...');

    try {
      const worker = await Tesseract.createWorker('rus+eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            this.logger.debug(`OCR progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      // Set parameters for better recognition of documents
      await worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        preserve_interword_spaces: '1',
      });

      this.worker = worker;
      this.workerInitializing = false;
      this.logger.log('Tesseract worker initialized successfully');

      return worker;
    } catch (error) {
      this.workerInitializing = false;
      this.workerInitPromise = null;
      this.logger.error(`Failed to initialize Tesseract worker: ${error}`);
      throw error;
    }
  }

  /**
   * Validate uploaded file
   */
  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!SUPPORTED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Supported types: JPEG, PNG, WebP, BMP, TIFF`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }
  }

  /**
   * Process image and extract text using OCR
   */
  async processImage(buffer: Buffer): Promise<string> {
    const worker = await this.getWorker();

    try {
      const { data } = await worker.recognize(buffer);
      return data.text;
    } catch (error) {
      this.logger.error(`OCR processing failed: ${error}`);
      throw new BadRequestException('Failed to process image. Please ensure the image is clear and readable.');
    }
  }

  /**
   * Detect document type from extracted text
   */
  detectDocumentType(text: string): DocumentType {
    // Check each parser's detection method
    if (this.migrationCardParser.detect(text)) {
      return DocumentType.MIGRATION_CARD;
    }

    if (this.patentParser.detect(text)) {
      return DocumentType.PATENT;
    }

    if (this.registrationParser.detect(text)) {
      return DocumentType.REGISTRATION;
    }

    if (this.passportParser.detect(text)) {
      return DocumentType.PASSPORT;
    }

    // Default to passport as it's most common
    return DocumentType.PASSPORT;
  }

  /**
   * Parse text based on document type
   */
  parseDocument(
    text: string,
    documentType: DocumentType,
  ): ParseResult<PassportDataDto | MigrationCardDataDto | PatentDataDto | RegistrationDataDto> {
    switch (documentType) {
      case DocumentType.PASSPORT:
        return this.passportParser.parse(text);
      case DocumentType.MIGRATION_CARD:
        return this.migrationCardParser.parse(text);
      case DocumentType.PATENT:
        return this.patentParser.parse(text);
      case DocumentType.REGISTRATION:
        return this.registrationParser.parse(text);
      default:
        return this.passportParser.parse(text);
    }
  }

  /**
   * Full OCR processing pipeline
   */
  async process(
    file: Express.Multer.File,
    requestedDocumentType: DocumentType = DocumentType.AUTO,
  ): Promise<OcrResponseDto> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      // Validate file
      this.validateFile(file);

      // Extract text using OCR
      this.logger.log(`Processing file: ${file.originalname} (${file.size} bytes)`);
      const rawText = await this.processImage(file.buffer);

      if (!rawText || rawText.trim().length < 10) {
        return {
          success: false,
          documentType: requestedDocumentType === DocumentType.AUTO ? DocumentType.PASSPORT : requestedDocumentType,
          confidence: 0,
          rawText: rawText || '',
          error: 'Could not extract text from image. Please ensure the document is clearly visible and well-lit.',
          processingTimeMs: Date.now() - startTime,
          warnings: ['No readable text found in image'],
        };
      }

      // Detect or use requested document type
      const documentType =
        requestedDocumentType === DocumentType.AUTO
          ? this.detectDocumentType(rawText)
          : requestedDocumentType;

      this.logger.log(`Detected document type: ${documentType}`);

      // Parse document
      const parseResult = this.parseDocument(rawText, documentType);
      warnings.push(...parseResult.warnings);

      // Build response
      const response: OcrResponseDto = {
        success: true,
        documentType,
        confidence: parseResult.confidence,
        rawText,
        processingTimeMs: Date.now() - startTime,
        warnings: warnings.length > 0 ? warnings : undefined,
      };

      // Add parsed data to appropriate field
      switch (documentType) {
        case DocumentType.PASSPORT:
          response.passport = parseResult.data as PassportDataDto;
          break;
        case DocumentType.MIGRATION_CARD:
          response.migrationCard = parseResult.data as MigrationCardDataDto;
          break;
        case DocumentType.PATENT:
          response.patent = parseResult.data as PatentDataDto;
          break;
        case DocumentType.REGISTRATION:
          response.registration = parseResult.data as RegistrationDataDto;
          break;
      }

      this.logger.log(
        `OCR completed: type=${documentType}, confidence=${parseResult.confidence}%, time=${response.processingTimeMs}ms`,
      );

      return response;
    } catch (error) {
      this.logger.error(`OCR processing error: ${error}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      return {
        success: false,
        documentType: requestedDocumentType === DocumentType.AUTO ? DocumentType.PASSPORT : requestedDocumentType,
        confidence: 0,
        error: 'An error occurred during document processing. Please try again.',
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Cleanup worker on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      this.logger.log('Terminating Tesseract worker...');
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
