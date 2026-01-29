import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Backup } from './entities/backup.entity';
import {
  BackupResponseDto,
  BackupListResponseDto,
  BackupDownloadResponseDto,
} from './dto';

/** Maximum number of backups per device */
const MAX_BACKUPS = 3;

/** Maximum backup size in bytes (50 MB) */
const MAX_SIZE_BYTES = 50 * 1024 * 1024;

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    @InjectRepository(Backup)
    private readonly backupRepository: Repository<Backup>,
  ) {}

  /**
   * Upload a new encrypted backup
   * Automatically removes old backups if exceeding MAX_BACKUPS
   */
  async upload(
    deviceId: string,
    file: Buffer,
    salt: string,
    iv: string,
  ): Promise<BackupResponseDto> {
    const sizeBytes = file.length;

    if (sizeBytes > MAX_SIZE_BYTES) {
      throw new BadRequestException(
        `Backup size exceeds maximum allowed size of ${MAX_SIZE_BYTES} bytes`,
      );
    }

    if (sizeBytes === 0) {
      throw new BadRequestException('Backup file is empty');
    }

    this.logger.log(
      `Uploading backup for device ${deviceId}, size: ${sizeBytes} bytes`,
    );

    // Create new backup
    const backup = this.backupRepository.create({
      deviceId,
      encryptedData: file,
      salt,
      iv,
      sizeBytes,
    });

    await this.backupRepository.save(backup);

    // Clean up old backups if necessary
    await this.cleanupOldBackups(deviceId);

    this.logger.log(`Backup created: ${backup.id} for device ${deviceId}`);

    return this.toBackupResponseDto(backup);
  }

  /**
   * Download a specific backup
   * Returns the encrypted data buffer with metadata
   */
  async download(
    deviceId: string,
    backupId: string,
  ): Promise<{ data: Buffer; backup: BackupDownloadResponseDto }> {
    const backup = await this.backupRepository.findOne({
      where: { id: backupId },
    });

    if (!backup) {
      throw new NotFoundException(`Backup ${backupId} not found`);
    }

    if (backup.deviceId !== deviceId) {
      throw new ForbiddenException('Access denied to this backup');
    }

    this.logger.log(`Downloading backup ${backupId} for device ${deviceId}`);

    return {
      data: backup.encryptedData,
      backup: {
        id: backup.id,
        salt: backup.salt,
        iv: backup.iv,
        sizeBytes: backup.sizeBytes,
        createdAt: backup.createdAt,
      },
    };
  }

  /**
   * List all backups for a device
   */
  async list(deviceId: string): Promise<BackupListResponseDto> {
    const backups = await this.backupRepository.find({
      where: { deviceId },
      order: { createdAt: 'DESC' },
      select: ['id', 'sizeBytes', 'createdAt'],
    });

    return {
      backups: backups.map((b) => this.toBackupResponseDto(b)),
      total: backups.length,
    };
  }

  /**
   * Get the latest backup for a device
   */
  async getLatest(deviceId: string): Promise<BackupResponseDto | null> {
    const backup = await this.backupRepository.findOne({
      where: { deviceId },
      order: { createdAt: 'DESC' },
      select: ['id', 'sizeBytes', 'createdAt'],
    });

    if (!backup) {
      return null;
    }

    return this.toBackupResponseDto(backup);
  }

  /**
   * Delete a specific backup
   */
  async delete(deviceId: string, backupId: string): Promise<void> {
    const backup = await this.backupRepository.findOne({
      where: { id: backupId },
      select: ['id', 'deviceId'],
    });

    if (!backup) {
      throw new NotFoundException(`Backup ${backupId} not found`);
    }

    if (backup.deviceId !== deviceId) {
      throw new ForbiddenException('Access denied to this backup');
    }

    await this.backupRepository.delete(backupId);

    this.logger.log(`Backup ${backupId} deleted for device ${deviceId}`);
  }

  /**
   * Remove old backups exceeding MAX_BACKUPS limit
   */
  private async cleanupOldBackups(deviceId: string): Promise<void> {
    const backups = await this.backupRepository.find({
      where: { deviceId },
      order: { createdAt: 'DESC' },
      select: ['id'],
    });

    if (backups.length > MAX_BACKUPS) {
      const backupsToDelete = backups.slice(MAX_BACKUPS);
      const idsToDelete = backupsToDelete.map((b) => b.id);

      await this.backupRepository.delete(idsToDelete);

      this.logger.log(
        `Cleaned up ${idsToDelete.length} old backups for device ${deviceId}`,
      );
    }
  }

  /**
   * Convert entity to response DTO
   */
  private toBackupResponseDto(backup: Backup): BackupResponseDto {
    return {
      id: backup.id,
      sizeBytes: backup.sizeBytes,
      createdAt: backup.createdAt,
    };
  }
}
