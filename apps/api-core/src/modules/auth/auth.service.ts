import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { DeviceAuthDto, AuthResponseDto } from './dto';
import { SigningService } from './signing.service';

interface JwtPayload {
  sub: string;
  did: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly signingService: SigningService,
  ) {}

  async deviceAuth(dto: DeviceAuthDto): Promise<AuthResponseDto> {
    let user = await this.userRepository.findOne({
      where: { deviceId: dto.deviceId },
    });

    const isNewUser = !user;

    // Генерируем новый signing key при каждой аутентификации
    const signingKey = this.signingService.generateSigningKey();

    if (!user) {
      user = this.userRepository.create({
        deviceId: dto.deviceId,
        signingKey,
        settings: {
          locale: dto.locale || 'ru',
          notifications: {
            push: true,
            telegram: false,
            deadlines: true,
            news: true,
          },
          timezone: 'Europe/Moscow',
        },
      });
      await this.userRepository.save(user);
      this.logger.log(`New user registered: ${user.id}`);
    } else {
      this.logger.log(`User logged in: ${user.id}`);
    }

    const tokens = await this.generateTokens(user);

    // Store refresh token hash and signing key
    const refreshTokenHash = this.hashToken(tokens.refreshToken);
    await this.userRepository.update(user.id, { refreshTokenHash, signingKey });

    return {
      ...tokens,
      userId: user.id,
      isNewUser,
      signingKey,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify refresh token hash
      const tokenHash = this.hashToken(refreshToken);
      if (user.refreshTokenHash !== tokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);

      // Генерируем новый signing key при refresh
      const signingKey = this.signingService.generateSigningKey();

      // Update refresh token hash and signing key
      const newRefreshTokenHash = this.hashToken(tokens.refreshToken);
      await this.userRepository.update(user.id, {
        refreshTokenHash: newRefreshTokenHash,
        signingKey,
      });

      return {
        ...tokens,
        userId: user.id,
        isNewUser: false,
        signingKey,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Refresh token failed: ${message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
