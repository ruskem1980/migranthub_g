import { Injectable, UnauthorizedException, Logger, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { VerifyRecoveryDto } from './dto/verify-recovery.dto';
import { RecoveryResponseDto } from './dto/recovery-response.dto';
import { SigningService } from './signing.service';

interface JwtPayload {
  sub: string;
  did: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class RecoveryService {
  private readonly logger = new Logger(RecoveryService.name);

  // Rate limiting configuration
  private readonly MAX_ATTEMPTS = 3;
  private readonly BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly signingService: SigningService,
  ) {}

  /**
   * Verify recovery code and return new tokens
   */
  async verifyRecoveryCode(dto: VerifyRecoveryDto): Promise<RecoveryResponseDto> {
    const user = await this.userRepository.findOne({
      where: { deviceId: dto.deviceId },
    });

    if (!user) {
      this.logger.warn(`Recovery attempt for unknown device: ${dto.deviceId}`);
      throw new UnauthorizedException('Invalid device ID or recovery code');
    }

    // Check if user is blocked due to too many attempts
    if (user.recoveryBlockedUntil && new Date() < user.recoveryBlockedUntil) {
      const remainingMs = user.recoveryBlockedUntil.getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      this.logger.warn(
        `Recovery blocked for user ${user.id}, ${remainingMinutes} minutes remaining`,
      );
      throw new ForbiddenException(
        `Too many failed attempts. Try again in ${remainingMinutes} minutes.`,
      );
    }

    // Reset block if expired
    if (user.recoveryBlockedUntil && new Date() >= user.recoveryBlockedUntil) {
      await this.userRepository.update(user.id, {
        recoveryAttempts: 0,
        recoveryBlockedUntil: null,
      });
      user.recoveryAttempts = 0;
      user.recoveryBlockedUntil = null;
    }

    // Check if recovery code exists
    if (!user.recoveryCodeHash) {
      this.logger.warn(`Recovery attempt for user ${user.id} without recovery code set`);
      throw new UnauthorizedException('Invalid device ID or recovery code');
    }

    // Verify recovery code
    const codeHash = this.hashCode(dto.recoveryCode);
    if (codeHash !== user.recoveryCodeHash) {
      // Increment attempts
      const newAttempts = user.recoveryAttempts + 1;
      const updates: Partial<User> = { recoveryAttempts: newAttempts };

      if (newAttempts >= this.MAX_ATTEMPTS) {
        updates.recoveryBlockedUntil = new Date(Date.now() + this.BLOCK_DURATION_MS);
        this.logger.warn(`User ${user.id} blocked after ${newAttempts} failed recovery attempts`);
      }

      await this.userRepository.update(user.id, updates);

      const remainingAttempts = this.MAX_ATTEMPTS - newAttempts;
      if (remainingAttempts > 0) {
        throw new UnauthorizedException(
          `Invalid recovery code. ${remainingAttempts} attempt(s) remaining.`,
        );
      } else {
        throw new ForbiddenException(`Too many failed attempts. Try again in 15 minutes.`);
      }
    }

    // Success: generate new tokens, recovery code, and signing key
    this.logger.log(`Recovery successful for user ${user.id}`);

    const newRecoveryCode = this.generateRecoveryCode();
    const tokens = await this.generateTokens(user);
    const signingKey = this.signingService.generateSigningKey();

    // Update user: reset attempts, set new recovery code hash, update refresh token hash and signing key
    await this.userRepository.update(user.id, {
      recoveryAttempts: 0,
      recoveryBlockedUntil: null,
      recoveryCodeHash: this.hashCode(newRecoveryCode),
      refreshTokenHash: this.hashToken(tokens.refreshToken),
      signingKey,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      newRecoveryCode,
      userId: user.id,
      signingKey,
    };
  }

  /**
   * Generate a new recovery code (12 uppercase alphanumeric characters)
   */
  generateRecoveryCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = crypto.randomBytes(12);
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return code;
  }

  /**
   * Hash a recovery code
   */
  private hashCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Hash a token
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const accessPayload: JwtPayload = {
      sub: user.id,
      did: user.deviceId,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      did: user.deviceId,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
