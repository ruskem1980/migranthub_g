import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BanCheckQueryDto } from './dto';

/**
 * Результат проверки запрета на въезд от МВД
 */
export interface MvdCheckResult {
  hasBan: boolean;
  reason?: string;
  expiresAt?: string;
}

/**
 * Состояние circuit breaker
 */
enum CircuitState {
  CLOSED = 'CLOSED', // Нормальная работа
  OPEN = 'OPEN', // Запросы блокируются
  HALF_OPEN = 'HALF_OPEN', // Пробный запрос
}

/**
 * MvdClient - HTTP клиент для работы с API МВД.
 *
 * Особенности:
 * - Retry logic с exponential backoff
 * - Circuit breaker для защиты от каскадных сбоев
 * - Таймауты для предотвращения зависания
 * - Парсинг HTML-ответа сервиса МВД
 */
@Injectable()
export class MvdClient implements OnModuleInit {
  private readonly logger = new Logger(MvdClient.name);

  // Конфигурация
  private apiUrl: string;
  private enabled: boolean;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;
  private circuitBreakerThreshold: number;
  private circuitBreakerResetTime: number;

  // Circuit breaker state
  private circuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>(
      'mvd.apiUrl',
      'https://services.fms.gov.ru/info-service.htm?sid=2000',
    );
    this.enabled = this.configService.get<boolean>('mvd.enabled', false);
    this.timeout = this.configService.get<number>('mvd.timeout', 10000);
    this.retryAttempts = this.configService.get<number>('mvd.retryAttempts', 3);
    this.retryDelay = this.configService.get<number>('mvd.retryDelay', 1000);
    this.circuitBreakerThreshold = this.configService.get<number>('mvd.circuitBreakerThreshold', 5);
    this.circuitBreakerResetTime = this.configService.get<number>(
      'mvd.circuitBreakerResetTime',
      60000,
    );
  }

  onModuleInit(): void {
    this.logger.log(`MvdClient инициализирован: enabled=${this.enabled}, url=${this.apiUrl}`);
  }

  /**
   * Проверка доступности МВД API
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Проверка запрета на въезд через API МВД
   */
  async checkBan(query: BanCheckQueryDto): Promise<MvdCheckResult> {
    // Проверка circuit breaker
    if (!this.canMakeRequest()) {
      this.logger.warn('Circuit breaker открыт, запрос к МВД заблокирован');
      throw new Error('MVD service temporarily unavailable (circuit open)');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.logger.debug(`Попытка ${attempt}/${this.retryAttempts} запроса к МВД`);
        const result = await this.executeRequest(query);
        this.onSuccess();
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Попытка ${attempt} не удалась: ${lastError.message}`);

        if (attempt < this.retryAttempts) {
          const delay = this.calculateBackoff(attempt);
          this.logger.debug(`Ожидание ${delay}ms перед следующей попыткой`);
          await this.delay(delay);
        }
      }
    }

    this.onFailure();
    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Выполнение HTTP запроса к МВД
   */
  private async executeRequest(query: BanCheckQueryDto): Promise<MvdCheckResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Формирование параметров запроса
      // Сервис МВД использует GET с параметрами в URL
      const params = new URLSearchParams({
        sid: '2000',
        form_name: 'form',
        fam: query.lastName.toUpperCase(),
        nam: query.firstName.toUpperCase(),
        dat: this.formatDate(query.birthDate),
      });

      const url = `${this.apiUrl.split('?')[0]}?${params.toString()}`;

      this.logger.debug(`Запрос к МВД: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'MigrantHub/1.0',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'ru-RU,ru;q=0.9',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      return this.parseResponse(html);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Парсинг HTML-ответа от сервиса МВД
   *
   * Сервис возвращает HTML страницу с результатом проверки.
   * Ищем ключевые фразы для определения статуса.
   */
  private parseResponse(html: string): MvdCheckResult {
    // Нормализация HTML для поиска
    const normalizedHtml = html.toLowerCase();

    // Ключевые фразы для определения наличия запрета
    const banIndicators = [
      'запрет на въезд',
      'въезд закрыт',
      'нежелательность пребывания',
      'депортация',
      'выдворение',
      'закрыт въезд',
    ];

    // Ключевые фразы для отсутствия запрета
    const noBanIndicators = [
      'оснований не въезд не имеется',
      'оснований для неразрешения въезда не выявлено',
      'данные отсутствуют',
      'сведения не найдены',
      'запретов не обнаружено',
    ];

    // Проверка на наличие запрета
    for (const indicator of banIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.log('Обнаружен запрет на въезд');
        return {
          hasBan: true,
          reason: this.extractReason(html),
          expiresAt: this.extractExpirationDate(html),
        };
      }
    }

    // Проверка на явное отсутствие запрета
    for (const indicator of noBanIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.log('Запрет на въезд не обнаружен');
        return { hasBan: false };
      }
    }

    // Если не удалось определить - считаем что запрета нет
    // (консервативный подход - лучше не блокировать пользователя)
    this.logger.warn('Не удалось точно определить статус, предполагаем отсутствие запрета');
    return { hasBan: false };
  }

  /**
   * Извлечение причины запрета из HTML
   */
  private extractReason(html: string): string | undefined {
    // Паттерны для извлечения причины
    const patterns = [/причина[:\s]*([^<]+)/i, /основание[:\s]*([^<]+)/i, /статья[:\s]*([^<]+)/i];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        return match[1].trim().slice(0, 500); // Ограничиваем длину
      }
    }

    return undefined;
  }

  /**
   * Извлечение даты окончания запрета из HTML
   */
  private extractExpirationDate(html: string): string | undefined {
    // Паттерны для дат в формате DD.MM.YYYY
    const datePattern = /до[:\s]*(\d{2}\.\d{2}\.\d{4})/i;
    const match = html.match(datePattern);

    if (match?.[1]) {
      // Конвертируем DD.MM.YYYY в ISO формат
      const [day, month, year] = match[1].split('.');
      return `${year}-${month}-${day}`;
    }

    return undefined;
  }

  /**
   * Форматирование даты для запроса к МВД (DD.MM.YYYY)
   */
  private formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  /**
   * Проверка возможности выполнения запроса (circuit breaker)
   */
  private canMakeRequest(): boolean {
    const now = Date.now();

    switch (this.circuitState) {
      case CircuitState.CLOSED:
        return true;

      case CircuitState.OPEN:
        // Проверяем, прошло ли достаточно времени для пробного запроса
        if (now - this.lastFailureTime >= this.circuitBreakerResetTime) {
          this.circuitState = CircuitState.HALF_OPEN;
          this.logger.log('Circuit breaker переведен в HALF_OPEN');
          return true;
        }
        return false;

      case CircuitState.HALF_OPEN:
        return true;

      default:
        return true;
    }
  }

  /**
   * Обработка успешного запроса
   */
  private onSuccess(): void {
    if (this.circuitState === CircuitState.HALF_OPEN) {
      this.logger.log('Circuit breaker закрыт после успешного запроса');
    }
    this.circuitState = CircuitState.CLOSED;
    this.failureCount = 0;
  }

  /**
   * Обработка неудачного запроса
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.circuitState === CircuitState.HALF_OPEN) {
      this.circuitState = CircuitState.OPEN;
      this.logger.warn('Circuit breaker открыт после неудачного пробного запроса');
    } else if (this.failureCount >= this.circuitBreakerThreshold) {
      this.circuitState = CircuitState.OPEN;
      this.logger.warn(`Circuit breaker открыт после ${this.failureCount} ошибок`);
    }
  }

  /**
   * Расчет задержки с exponential backoff
   */
  private calculateBackoff(attempt: number): number {
    // Exponential backoff: delay * 2^(attempt-1) с jitter
    const exponentialDelay = this.retryDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
    return Math.min(exponentialDelay + jitter, 30000); // Максимум 30 сек
  }

  /**
   * Утилита для задержки
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Получение состояния circuit breaker (для мониторинга)
   */
  getCircuitState(): { state: string; failures: number } {
    return {
      state: this.circuitState,
      failures: this.failureCount,
    };
  }
}
