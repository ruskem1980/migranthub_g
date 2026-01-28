import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RecoveryService } from './recovery.service';
import {
  DeviceAuthDto,
  RefreshTokenDto,
  AuthResponseDto,
  VerifyRecoveryDto,
  RecoveryResponseDto,
} from './dto';

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly recoveryService: RecoveryService,
  ) {}

  @Post('device')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Authenticate device',
    description: 'Register a new device or authenticate an existing one. Returns JWT tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
  })
  async deviceAuth(@Body() dto: DeviceAuthDto): Promise<AuthResponseDto> {
    return this.authService.deviceAuth(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Exchange a valid refresh token for new access and refresh tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
  })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('recovery/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({
    summary: 'Verify recovery code',
    description:
      'Verify a recovery code to restore access to an account. Returns new JWT tokens and a new recovery code. Rate limited to 3 attempts per device, with 15-minute lockout after exceeding.',
  })
  @ApiResponse({
    status: 200,
    description: 'Recovery successful. New tokens and recovery code returned.',
    type: RecoveryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid device ID or recovery code',
  })
  @ApiForbiddenResponse({
    description: 'Too many failed attempts. Account temporarily locked.',
  })
  async verifyRecovery(@Body() dto: VerifyRecoveryDto): Promise<RecoveryResponseDto> {
    return this.recoveryService.verifyRecoveryCode(dto);
  }
}
