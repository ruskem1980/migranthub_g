import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'change-me-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-refresh-me-in-production',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '24h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
}));
