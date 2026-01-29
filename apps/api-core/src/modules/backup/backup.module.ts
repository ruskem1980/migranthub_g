import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';
import { Backup } from './entities/backup.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Backup]),
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB
      },
    }),
  ],
  controllers: [BackupController],
  providers: [BackupService],
  exports: [BackupService],
})
export class BackupModule {}
