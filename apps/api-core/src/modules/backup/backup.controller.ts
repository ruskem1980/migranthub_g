import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators';
import {
  UploadBackupDto,
  BackupResponseDto,
  BackupListResponseDto,
  BackupDownloadResponseDto,
} from './dto';

@ApiTags('backup')
@Controller({
  path: 'backup',
  version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 uploads per hour
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload encrypted backup',
    description:
      'Uploads an E2E encrypted backup. Maximum 50MB. Old backups are automatically deleted when exceeding 3 backups per device.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'salt', 'iv'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Encrypted backup file',
        },
        salt: {
          type: 'string',
          description: 'PBKDF2 salt (base64)',
        },
        iv: {
          type: 'string',
          description: 'AES-GCM IV (base64)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Backup uploaded successfully',
    type: BackupResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or file too large',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadBackupDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<BackupResponseDto> {
    if (!file) {
      throw new Error('File is required');
    }

    return this.backupService.upload(
      user.deviceId,
      file.buffer,
      dto.salt,
      dto.iv,
    );
  }

  @Get('list')
  @ApiOperation({
    summary: 'List all backups',
    description: 'Returns a list of all backups for the current device.',
  })
  @ApiResponse({
    status: 200,
    description: 'Backup list returned',
    type: BackupListResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async list(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<BackupListResponseDto> {
    return this.backupService.list(user.deviceId);
  }

  @Get('latest')
  @ApiOperation({
    summary: 'Get latest backup',
    description: 'Returns metadata of the most recent backup for the current device.',
  })
  @ApiResponse({
    status: 200,
    description: 'Latest backup metadata returned',
    type: BackupResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No backups found',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async getLatest(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<BackupResponseDto> {
    const backup = await this.backupService.getLatest(user.deviceId);

    if (!backup) {
      throw new Error('No backups found');
    }

    return backup;
  }

  @Get(':id/download')
  @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 downloads per hour
  @ApiOperation({
    summary: 'Download backup',
    description: 'Downloads the encrypted backup file.',
  })
  @ApiResponse({
    status: 200,
    description: 'Backup file returned',
    headers: {
      'X-Backup-Salt': {
        description: 'PBKDF2 salt (base64)',
        schema: { type: 'string' },
      },
      'X-Backup-IV': {
        description: 'AES-GCM IV (base64)',
        schema: { type: 'string' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Backup not found',
  })
  @ApiForbiddenResponse({
    description: 'Access denied to this backup',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { data, backup } = await this.backupService.download(
      user.deviceId,
      id,
    );

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="backup-${id}.bin"`,
      'Content-Length': backup.sizeBytes.toString(),
      'X-Backup-Salt': backup.salt,
      'X-Backup-IV': backup.iv,
    });

    return new StreamableFile(data);
  }

  @Get(':id/metadata')
  @ApiOperation({
    summary: 'Get backup metadata',
    description: 'Returns metadata for a specific backup without downloading the file.',
  })
  @ApiResponse({
    status: 200,
    description: 'Backup metadata returned',
    type: BackupDownloadResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Backup not found',
  })
  @ApiForbiddenResponse({
    description: 'Access denied to this backup',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async getMetadata(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<BackupDownloadResponseDto> {
    const { backup } = await this.backupService.download(user.deviceId, id);
    return backup;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete backup',
    description: 'Deletes a specific backup.',
  })
  @ApiResponse({
    status: 204,
    description: 'Backup deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Backup not found',
  })
  @ApiForbiddenResponse({
    description: 'Access denied to this backup',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.backupService.delete(user.deviceId, id);
  }
}
