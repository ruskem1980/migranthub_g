import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

@Module({})
export class SentryModule {
  static forRootAsync() {
    return {
      module: SentryModule,
      providers: [
        {
          provide: 'SENTRY_INIT',
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const dsn = configService.get<string>('SENTRY_DSN');
            const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
            const isProduction = nodeEnv === 'production';

            if (dsn && isProduction) {
              Sentry.init({
                dsn,
                environment: nodeEnv,
                enabled: isProduction,
                tracesSampleRate: 0.1,
                profilesSampleRate: 0.1,
                integrations: [nodeProfilingIntegration()],
                beforeSend(event) {
                  // Filter PII from user data
                  if (event.user) {
                    delete event.user.email;
                    delete event.user.ip_address;
                    delete event.user.username;
                  }

                  // Filter PII from request data
                  if (event.request) {
                    delete event.request.cookies;
                    if (event.request.headers) {
                      delete event.request.headers['authorization'];
                      delete event.request.headers['cookie'];
                    }
                  }

                  return event;
                },
              });
            }

            return { initialized: isProduction && !!dsn };
          },
        },
      ],
      exports: ['SENTRY_INIT'],
    };
  }
}
