import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FmsClient } from './fms.client';
import { BrowserService, CaptchaSolverService } from '../../../common/services';
import { BanType } from './dto';

describe('FmsClient', () => {
  let client: FmsClient;
  let browserService: jest.Mocked<BrowserService>;
  let captchaSolver: jest.Mocked<CaptchaSolverService>;

  const mockQuery = {
    lastName: 'IVANOV',
    firstName: 'IVAN',
    middleName: 'PETROVICH',
    birthDate: '1990-01-01',
    citizenship: 'UZB',
  };

  const defaultConfig: Record<string, unknown> = {
    'entryBan.serviceUrl': 'https://services.fms.gov.ru/info-service.htm?sid=3000',
    'entryBan.enabled': true,
    'entryBan.timeout': 30000,
    'entryBan.retryAttempts': 1, // Only 1 attempt for faster tests
    'entryBan.retryDelay': 10, // Short delay for tests
    'entryBan.circuitBreakerThreshold': 5,
    'entryBan.circuitBreakerResetTime': 60000,
  };

  // Mock page object
  const createMockPage = (content: string) => ({
    waitForSelector: jest.fn().mockResolvedValue(undefined),
    $: jest.fn().mockImplementation((selector: string) => {
      // Return mock submit button FIRST (before input check catches it)
      if (selector.includes('button') || selector.includes('submit')) {
        return Promise.resolve({
          click: jest.fn().mockResolvedValue(undefined),
        });
      }
      // Return null for captcha image (no captcha by default)
      if (selector.includes('captcha') || selector.includes('img')) {
        return Promise.resolve(null);
      }
      // Return mock element for form fields
      if (selector.includes('input') || selector.includes('select')) {
        return Promise.resolve({
          fill: jest.fn().mockResolvedValue(undefined),
          selectOption: jest.fn().mockResolvedValue(undefined),
          screenshot: jest.fn().mockResolvedValue(Buffer.from('captcha-image')),
        });
      }
      return Promise.resolve(null);
    }),
    waitForNavigation: jest.fn().mockResolvedValue(undefined),
    waitForTimeout: jest.fn().mockResolvedValue(undefined),
    content: jest.fn().mockResolvedValue(content),
    evaluate: jest.fn().mockResolvedValue(undefined),
  });

  const createMockContext = () => ({
    close: jest.fn().mockResolvedValue(undefined),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FmsClient,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string, defaultValue?: unknown) => {
              return defaultConfig[key] ?? defaultValue;
            }),
          },
        },
        {
          provide: BrowserService,
          useValue: {
            getInteractivePage: jest.fn(),
            closePage: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: CaptchaSolverService,
          useValue: {
            isEnabled: jest.fn().mockReturnValue(false),
            solveImageCaptcha: jest.fn(),
          },
        },
      ],
    }).compile();

    client = module.get<FmsClient>(FmsClient);
    browserService = module.get(BrowserService);
    captchaSolver = module.get(CaptchaSolverService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isEnabled', () => {
    it('should return enabled status from config', () => {
      expect(client.isEnabled()).toBe(true);
    });
  });

  describe('checkBan', () => {
    it('should throw error if citizenship is not provided', async () => {
      const queryWithoutCitizenship = {
        lastName: 'IVANOV',
        firstName: 'IVAN',
        birthDate: '1990-01-01',
      };

      await expect(client.checkBan(queryWithoutCitizenship)).rejects.toThrow(
        'Citizenship is required for FMS check',
      );
    });

    it('should make request through browser service', async () => {
      const mockPage = createMockPage('Данных нет');
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      await client.checkBan(mockQuery);

      expect(browserService.getInteractivePage).toHaveBeenCalledWith(
        'https://services.fms.gov.ru/info-service.htm?sid=3000',
      );
    });

    it('should close page and context after request', async () => {
      const mockPage = createMockPage('Данных нет');
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      await client.checkBan(mockQuery);

      expect(browserService.closePage).toHaveBeenCalledWith(mockPage, mockContext);
    });

    it('should fail when browser service throws', async () => {
      browserService.getInteractivePage.mockRejectedValue(new Error('Network error'));

      await expect(client.checkBan(mockQuery)).rejects.toThrow('Network error');
    });
  });

  describe('parseResult', () => {
    it('should detect ban with "въезд не разрешен"', async () => {
      const mockPage = createMockPage('Въезд не разрешен. Запрет действует до 31.12.2025');
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      const result = await client.checkBan(mockQuery);

      expect(result.hasBan).toBe(true);
      expect(result.banType).toBe(BanType.ADMINISTRATIVE);
    });

    it('should detect ban with "запрет на въезд"', async () => {
      const mockPage = createMockPage('Обнаружен запрет на въезд в Российскую Федерацию');
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      const result = await client.checkBan(mockQuery);

      expect(result.hasBan).toBe(true);
      expect(result.banType).toBe(BanType.ADMINISTRATIVE);
    });

    it('should detect ban with "нежелательность пребывания"', async () => {
      const mockPage = createMockPage('Нежелательность пребывания на территории РФ');
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      const result = await client.checkBan(mockQuery);

      expect(result.hasBan).toBe(true);
      expect(result.banType).toBe(BanType.SANITARY);
    });

    it('should detect ban with "административное выдворение"', async () => {
      const mockPage = createMockPage('Административное выдворение за пределы РФ');
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      const result = await client.checkBan(mockQuery);

      expect(result.hasBan).toBe(true);
      expect(result.banType).toBe(BanType.ADMINISTRATIVE);
    });

    it('should detect ban with "депортация"', async () => {
      const mockPage = createMockPage('Депортация из Российской Федерации');
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      const result = await client.checkBan(mockQuery);

      expect(result.hasBan).toBe(true);
      expect(result.banType).toBe(BanType.ADMINISTRATIVE);
    });

    it('should detect criminal ban type', async () => {
      const mockPage = createMockPage('Запрет на въезд по уголовному делу');
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      const result = await client.checkBan(mockQuery);

      expect(result.hasBan).toBe(true);
      expect(result.banType).toBe(BanType.CRIMINAL);
    });

    it('should detect sanitary ban type', async () => {
      const mockPage = createMockPage('Санитарные ограничения на въезд');
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      const result = await client.checkBan(mockQuery);

      expect(result.hasBan).toBe(true);
      expect(result.banType).toBe(BanType.SANITARY);
    });

    it('should detect no ban with "данных нет"', async () => {
      const mockPage = createMockPage('Данных нет');
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      const result = await client.checkBan(mockQuery);

      expect(result.hasBan).toBe(false);
    });

    it('should detect no ban with "сведения не найдены"', async () => {
      const mockPage = createMockPage('Сведения не найдены в базе данных');
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      const result = await client.checkBan(mockQuery);

      expect(result.hasBan).toBe(false);
    });

    it('should detect no ban with "оснований не въезд не имеется"', async () => {
      const mockPage = createMockPage('Оснований не въезд не имеется');
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      const result = await client.checkBan(mockQuery);

      expect(result.hasBan).toBe(false);
    });

    it('should extract reason from HTML', async () => {
      const mockPage = createMockPage(
        '<html><body>Запрет на въезд. Причина: нарушение миграционного законодательства</body></html>',
      );
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      const result = await client.checkBan(mockQuery);

      expect(result.hasBan).toBe(true);
      expect(result.reason).toContain('нарушение миграционного законодательства');
    });

    it('should extract expiration date', async () => {
      const mockPage = createMockPage(
        'Запрет на въезд до: 31.12.2025. Причина: административное выдворение',
      );
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      const result = await client.checkBan(mockQuery);

      expect(result.hasBan).toBe(true);
      expect(result.expiresAt).toBe('2025-12-31');
    });

    it('should return no ban for ambiguous response', async () => {
      const mockPage = createMockPage('Некорректные данные. Повторите запрос позже.');
      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      const result = await client.checkBan(mockQuery);

      // Conservative approach - assume no ban if can't determine
      expect(result.hasBan).toBe(false);
    });
  });

  describe('captcha handling', () => {
    it('should handle captcha when present and solver enabled', async () => {
      const mockPage = createMockPage('Данных нет');
      mockPage.$ = jest.fn().mockImplementation((selector: string) => {
        // Check button/submit FIRST (before input catches 'input[type="submit"]')
        if (selector.includes('button') || selector.includes('submit')) {
          return Promise.resolve({
            click: jest.fn().mockResolvedValue(undefined),
          });
        }
        if (selector.includes('captcha') && selector.includes('img')) {
          return Promise.resolve({
            screenshot: jest.fn().mockResolvedValue(Buffer.from('captcha-image')),
          });
        }
        if (selector.includes('input')) {
          return Promise.resolve({
            fill: jest.fn().mockResolvedValue(undefined),
            selectOption: jest.fn().mockResolvedValue(undefined),
          });
        }
        return Promise.resolve(null);
      });

      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      captchaSolver.isEnabled.mockReturnValue(true);
      captchaSolver.solveImageCaptcha.mockResolvedValue({
        success: true,
        solution: 'ABC123',
      });

      await client.checkBan(mockQuery);

      expect(captchaSolver.solveImageCaptcha).toHaveBeenCalled();
    });

    it('should throw error if captcha present but solver disabled', async () => {
      const mockPage = createMockPage('Данных нет');
      mockPage.$ = jest.fn().mockImplementation((selector: string) => {
        if (selector.includes('captcha') && selector.includes('img')) {
          return Promise.resolve({
            screenshot: jest.fn().mockResolvedValue(Buffer.from('captcha-image')),
          });
        }
        if (selector.includes('input')) {
          return Promise.resolve({
            fill: jest.fn().mockResolvedValue(undefined),
          });
        }
        return Promise.resolve(null);
      });

      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      captchaSolver.isEnabled.mockReturnValue(false);

      await expect(client.checkBan(mockQuery)).rejects.toThrow(
        'Captcha required but solver is not configured',
      );
    });

    it('should throw error if captcha solution fails', async () => {
      const mockPage = createMockPage('Данных нет');
      mockPage.$ = jest.fn().mockImplementation((selector: string) => {
        if (selector.includes('captcha') && selector.includes('img')) {
          return Promise.resolve({
            screenshot: jest.fn().mockResolvedValue(Buffer.from('captcha-image')),
          });
        }
        if (selector.includes('input')) {
          return Promise.resolve({
            fill: jest.fn().mockResolvedValue(undefined),
          });
        }
        return Promise.resolve(null);
      });

      const mockContext = createMockContext();

      browserService.getInteractivePage.mockResolvedValue({
        page: mockPage as any,
        context: mockContext as any,
      });

      captchaSolver.isEnabled.mockReturnValue(true);
      captchaSolver.solveImageCaptcha.mockResolvedValue({
        success: false,
        error: 'Captcha service timeout',
      });

      await expect(client.checkBan(mockQuery)).rejects.toThrow('Failed to solve captcha');
    });
  });

  describe('getCircuitState', () => {
    it('should return current state and failure count', () => {
      const state = client.getCircuitState();

      expect(state).toHaveProperty('state');
      expect(state).toHaveProperty('failures');
      expect(state.state).toBe('CLOSED');
      expect(state.failures).toBe(0);
    });
  });
});
