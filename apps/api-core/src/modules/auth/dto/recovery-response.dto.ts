import { ApiProperty } from '@nestjs/swagger';

export class RecoveryResponseDto {
  @ApiProperty({
    description: 'JWT access token (valid for 24 hours)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT refresh token (valid for 30 days)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'New recovery code (save it securely, shown only once)',
    example: 'XYZ789ABC012',
  })
  newRecoveryCode!: string;

  @ApiProperty({
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId!: string;

  @ApiProperty({
    description: 'Secret key for request signing (HMAC-SHA256). Store securely on device.',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
  })
  signingKey!: string;
}
