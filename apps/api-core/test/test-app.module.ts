import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { HealthModule } from '../src/modules/health/health.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { UsersModule } from '../src/modules/users/users.module';
import { UtilitiesModule } from '../src/modules/utilities/utilities.module';
import { LegalModule } from '../src/modules/legal/legal.module';
import { AuditModule } from '../src/modules/audit/audit.module';
import { CacheService } from '../src/modules/cache/cache.service';
import appConfig from '../src/config/app.config';
import jwtConfig from '../src/config/jwt.config';
import databaseConfig from '../src/config/database.config';

/**
 * Test Cache Module - provides CacheService globally for tests
 */
@Global()
@Module({
  imports: [
    NestCacheModule.register({
      isGlobal: true,
      ttl: 300000,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
class TestCacheModule {}

/**
 * Test-specific App Module that uses PostgreSQL test database
 * and in-memory cache instead of Redis
 */
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, databaseConfig],
      envFilePath: ['.env.test', '.env'],
    }),

    // Rate limiting (high limit for tests)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 1000,
      },
    ]),

    // Database - PostgreSQL test database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host', 'localhost'),
        port: configService.get<number>('database.port', 5432),
        username: configService.get<string>('database.username', 'postgres'),
        password: configService.get<string>('database.password', 'postgres'),
        database: configService.get<string>('database.name', 'migranthub_test'),
        autoLoadEntities: true,
        synchronize: true, // Auto-sync schema for tests
        dropSchema: true, // Clean database before each test run
        logging: false,
      }),
    }),

    // Cache - in-memory for tests
    TestCacheModule,

    // Feature modules
    HealthModule,
    UsersModule,
    AuthModule,
    UtilitiesModule,
    LegalModule,
    AuditModule,
  ],
})
export class TestAppModule {}
