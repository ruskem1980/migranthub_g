import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { OcrService } from './ocr.service';
import { DocumentType, OcrRequestDto, OcrResponseDto } from './dto';

@ApiTags('OCR')
@Controller({
  path: 'ocr',
  version: '1',
})
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  /**
   * Process document image and extract data
   * Rate limited to 5 requests per minute per IP
   * Images are NOT stored - only processed and returned
   */
  @Post('process')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Process document image with OCR',
    description: `
Upload a document image to extract data using OCR.
Supported documents: passport, migration card, work patent, registration.

**Privacy Note**: Images are NOT stored on the server.
They are processed in memory and immediately discarded after returning the result.

**Rate Limiting**: 5 requests per minute per IP address.

**Supported formats**: JPEG, PNG, WebP, BMP, TIFF
**Maximum file size**: 10MB

**Document Type**:
- Use "auto" (default) for automatic detection
- Specify document type for better accuracy if known
    `,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document image file (JPEG, PNG, WebP, BMP, TIFF)',
        },
        documentType: {
          type: 'string',
          enum: ['passport', 'migration_card', 'patent', 'registration', 'auto'],
          default: 'auto',
          description: 'Document type hint for better parsing accuracy',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Document processed successfully',
    type: OcrResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or processing error',
  })
  @ApiResponse({
    status: 413,
    description: 'File too large (max 10MB)',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded (5 per minute)',
  })
  async processDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(jpeg|jpg|png|webp|bmp|tiff)$/i }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() dto: OcrRequestDto,
  ): Promise<OcrResponseDto> {
    return this.ocrService.process(file, dto.documentType || DocumentType.AUTO);
  }
}
