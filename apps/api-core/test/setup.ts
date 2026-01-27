import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { TestAppModule } from './test-app.module';

let app: INestApplication;

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [TestAppModule],
  }).compile();

  const testApp = moduleFixture.createNestApplication();

  // Match production configuration
  testApp.setGlobalPrefix('api');

  testApp.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  testApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await testApp.init();
  return testApp;
}

export function getTestApp(): INestApplication {
  return app;
}

export async function closeTestApp(): Promise<void> {
  if (app) {
    await app.close();
  }
}

// Global setup
beforeAll(async () => {
  app = await createTestApp();
});

// Global teardown
afterAll(async () => {
  await closeTestApp();
});
