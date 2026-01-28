import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PatentCheckService } from './patent-check.service';
import { CacheService } from '../../cache/cache.service';
import { BrowserService, CaptchaSolverService } from '../../../common/services';
import { CheckPatentDto, PatentStatus } from './dto';

describe('PatentCheckService', () => {
  let service: PatentCheckService;
  let cacheService: jest.Mocked<CacheService>;
  let browserService: jest.Mocked<BrowserService>;
  let captchaSolver: jest.Mocked<CaptchaSolverService>;
  let configService: jest.Mocked<ConfigService>;

  const mockConfigValues: Record<string, unknown> = {
    'patentCheck.serviceUrl': 'https://services.fms.gov.ru/info-service.htm?sid=2000',
    'patentCheck.enabled': false,
    'patentCheck.timeout': 30000,
    'patentCheck.retryAttempts': 3,
    'patentCheck.retryDelay': 2000,
    'patentCheck.cacheTtl': 21600000,
    'patentCheck.circuitBreakerThreshold': 5,
    'patentCheck.circuitBreakerResetTime': 60000,
  };

  beforeEach(async () => {
    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      wrap: jest.fn(),
      isConnected: jest.fn().mockReturnValue(true),
    };

    const mockBrowserService = {
      getBrowser: jest.fn(),
      createContext: jest.fn(),
      createPage: jest.fn(),
      fetchPage: jest.fn(),
      getInteractivePage: jest.fn(),
      getScreenshot: jest.fn(),
      getElementScreenshot: jest.fn(),
      closePage: jest.fn(),
    };

    const mockCaptchaSolver = {
      isEnabled: jest.fn().mockReturnValue(false),
      solveImageCaptcha: jest.fn(),
      solveRecaptchaV2: jest.fn(),
      solveRecaptchaV3: jest.fn(),
      getBalance: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        return mockConfigValues[key] ?? defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatentCheckService,
        { provide: CacheService, useValue: mockCacheService },
        { provide: BrowserService, useValue: mockBrowserService },
        { provide: CaptchaSolverService, useValue: mockCaptchaSolver },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PatentCheckService>(PatentCheckService);
    cacheService = module.get(CacheService);
    browserService = module.get(BrowserService);
    captchaSolver = module.get(CaptchaSolverService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should report disabled when PATENT_CHECK_ENABLED is false', () => {
      expect(service.isEnabled()).toBe(false);
    });
  });

  describe('checkPatent', () => {
    const validDto: CheckPatentDto = {
      series: '77',
      number: '12345678',
    };

    it('should return cached result if available', async () => {
      const cachedResult = {
        status: PatentStatus.VALID,
        isValid: true,
        message: 'Патент действителен',
        series: '77',
        number: '12345678',
        fromCache: true,
        checkedAt: '2024-01-15T10:00:00.000Z',
        source: 'real' as const,
      };

      cacheService.get.mockResolvedValue(cachedResult);

      const result = await service.checkPatent(validDto);

      expect(result.fromCache).toBe(true);
      expect(result.status).toBe(PatentStatus.VALID);
      expect(cacheService.get).toHaveBeenCalledWith('patent:check:77:12345678');
    });

    it('should return mock data when service is disabled', async () => {
      cacheService.get.mockResolvedValue(null);

      const result = await service.checkPatent(validDto);

      expect(result.source).toBe('mock');
      expect(result.series).toBe('77');
      expect(result.number).toBe('12345678');
      expect(browserService.getInteractivePage).not.toHaveBeenCalled();
    });

    it('should return valid mock result for patents with last digit < 7', async () => {
      cacheService.get.mockResolvedValue(null);

      const dto: CheckPatentDto = {
        series: '77',
        number: '12345676', // Last digit is 6
      };

      const result = await service.checkPatent(dto);

      expect(result.status).toBe(PatentStatus.VALID);
      expect(result.isValid).toBe(true);
      expect(result.source).toBe('mock');
    });

    it('should return expired mock result for patents with last digit 7 or 8', async () => {
      cacheService.get.mockResolvedValue(null);

      const dto: CheckPatentDto = {
        series: '77',
        number: '12345677', // Last digit is 7
      };

      const result = await service.checkPatent(dto);

      expect(result.status).toBe(PatentStatus.EXPIRED);
      expect(result.isValid).toBe(false);
      expect(result.source).toBe('mock');
    });

    it('should return not_found mock result for patents with last digit 9', async () => {
      cacheService.get.mockResolvedValue(null);

      const dto: CheckPatentDto = {
        series: '77',
        number: '12345679', // Last digit is 9
      };

      const result = await service.checkPatent(dto);

      expect(result.status).toBe(PatentStatus.NOT_FOUND);
      expect(result.isValid).toBe(false);
      expect(result.source).toBe('mock');
    });

    it('should include owner name in mock result if provided', async () => {
      cacheService.get.mockResolvedValue(null);

      const dto: CheckPatentDto = {
        series: '77',
        number: '12345676',
        lastName: 'Ivanov',
        firstName: 'Ivan',
      };

      const result = await service.checkPatent(dto);

      expect(result.ownerName).toBe('IVANOV IVAN');
    });
  });

  describe('getCircuitState', () => {
    it('should return initial circuit breaker state', () => {
      const state = service.getCircuitState();

      expect(state.state).toBe('CLOSED');
      expect(state.failures).toBe(0);
    });
  });

  describe('isEnabled', () => {
    it('should return false when service is disabled', () => {
      expect(service.isEnabled()).toBe(false);
    });
  });
});

describe('PatentCheckService with enabled service', () => {
  const mockConfigValuesEnabled: Record<string, unknown> = {
    'patentCheck.serviceUrl': 'https://services.fms.gov.ru/info-service.htm?sid=2000',
    'patentCheck.enabled': true,
    'patentCheck.timeout': 30000,
    'patentCheck.retryAttempts': 2,
    'patentCheck.retryDelay': 100,
    'patentCheck.cacheTtl': 21600000,
    'patentCheck.circuitBreakerThreshold': 3,
    'patentCheck.circuitBreakerResetTime': 1000,
  };

  interface MockPageOptions {
    htmlContent: string;
    rejectNavigation?: boolean;
  }

  const createTestModule = async (options?: MockPageOptions) => {
    const mockCacheService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn(),
      wrap: jest.fn(),
      isConnected: jest.fn().mockReturnValue(true),
    };

    const mockInputElement = {
      fill: jest.fn().mockResolvedValue(undefined),
    };

    const mockPage = {
      waitForSelector: jest.fn().mockResolvedValue(undefined),
      $: jest.fn().mockImplementation((selector: string) => {
        if (selector.includes('captcha')) {
          return Promise.resolve(null);
        }
        if (selector.includes('submit') || selector.includes('Проверить')) {
          return Promise.resolve(null);
        }
        return Promise.resolve(mockInputElement);
      }),
      content: jest.fn().mockResolvedValue(options?.htmlContent || '<html></html>'),
      waitForNavigation: options?.rejectNavigation
        ? jest.fn().mockRejectedValue(new Error('Navigation failed'))
        : jest.fn().mockResolvedValue(undefined),
      waitForTimeout: jest.fn().mockResolvedValue(undefined),
      evaluate: jest.fn().mockResolvedValue(undefined),
      close: jest.fn(),
    };

    const mockContext = {
      close: jest.fn(),
    };

    const mockBrowserService = {
      getBrowser: jest.fn(),
      createContext: jest.fn(),
      createPage: jest.fn(),
      fetchPage: jest.fn(),
      getInteractivePage: options?.rejectNavigation
        ? jest.fn().mockRejectedValue(new Error('Connection failed'))
        : jest.fn().mockResolvedValue({
            page: mockPage,
            context: mockContext,
          }),
      getScreenshot: jest.fn(),
      getElementScreenshot: jest.fn(),
      closePage: jest.fn(),
    };

    const mockCaptchaSolver = {
      isEnabled: jest.fn().mockReturnValue(false),
      solveImageCaptcha: jest.fn(),
      solveRecaptchaV2: jest.fn(),
      solveRecaptchaV3: jest.fn(),
      getBalance: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        return mockConfigValuesEnabled[key] ?? defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatentCheckService,
        { provide: CacheService, useValue: mockCacheService },
        { provide: BrowserService, useValue: mockBrowserService },
        { provide: CaptchaSolverService, useValue: mockCaptchaSolver },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    return {
      service: module.get<PatentCheckService>(PatentCheckService),
      cacheService: module.get(CacheService) as jest.Mocked<CacheService>,
      browserService: module.get(BrowserService) as jest.Mocked<BrowserService>,
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should report enabled when PATENT_CHECK_ENABLED is true', async () => {
    const { service } = await createTestModule();
    expect(service.isEnabled()).toBe(true);
  });

  it('should attempt real check when service is enabled', async () => {
    const { service, browserService } = await createTestModule({
      htmlContent: '<html>Патент действителен до 31.12.2025</html>',
    });

    const dto: CheckPatentDto = {
      series: '77',
      number: '12345678',
    };

    const result = await service.checkPatent(dto);

    expect(browserService.getInteractivePage).toHaveBeenCalled();
    expect(result.status).toBe(PatentStatus.VALID);
    expect(result.isValid).toBe(true);
    expect(result.source).toBe('real');
  });

  it('should cache successful results', async () => {
    const { service, cacheService } = await createTestModule({
      htmlContent: '<html>Патент действителен</html>',
    });

    const dto: CheckPatentDto = {
      series: '77',
      number: '12345678',
    };

    await service.checkPatent(dto);

    expect(cacheService.set).toHaveBeenCalledWith(
      'patent:check:77:12345678',
      expect.objectContaining({
        status: PatentStatus.VALID,
        series: '77',
        number: '12345678',
      }),
      21600000,
    );
  });

  it('should parse expired patent correctly', async () => {
    const { service } = await createTestModule({
      htmlContent: '<html>Срок действия патента истек</html>',
    });

    const dto: CheckPatentDto = {
      series: '77',
      number: '12345678',
    };

    const result = await service.checkPatent(dto);

    expect(result.status).toBe(PatentStatus.EXPIRED);
    expect(result.isValid).toBe(false);
  });

  it('should parse not found patent correctly', async () => {
    const { service } = await createTestModule({
      htmlContent: '<html>Патент не найден в базе данных</html>',
    });

    const dto: CheckPatentDto = {
      series: '77',
      number: '12345678',
    };

    const result = await service.checkPatent(dto);

    expect(result.status).toBe(PatentStatus.NOT_FOUND);
    expect(result.isValid).toBe(false);
  });

  // This test is placed last because it may have side effects
  it('should return graceful degradation on persistent failures', async () => {
    const { service } = await createTestModule({
      htmlContent: '',
      rejectNavigation: true,
    });

    const dto: CheckPatentDto = {
      series: '77',
      number: '12345678',
    };

    const result = await service.checkPatent(dto);

    expect(result.status).toBe(PatentStatus.ERROR);
    expect(result.message).toContain('временно недоступен');
  });
});
