import { Injectable, Logger } from '@nestjs/common';
import { BanCheckQueryDto, BanCheckResponseDto, BanStatus } from './dto';

@Injectable()
export class BanCheckService {
  private readonly logger = new Logger(BanCheckService.name);

  async checkBan(query: BanCheckQueryDto): Promise<BanCheckResponseDto> {
    this.logger.log(
      `Checking ban status for: ${query.lastName} ${query.firstName}, DOB: ${query.birthDate}`,
    );

    // MVP: Заглушка - всегда возвращает "нет запрета"
    // В production здесь будет прокси к внешнему API МВД
    // https://services.fms.gov.ru/info-service.htm?sid=2000

    try {
      // Симуляция задержки внешнего API
      await this.delay(500);

      // MVP: Возвращаем заглушку
      return {
        status: BanStatus.NO_BAN,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Ban check failed', error);
      return {
        status: BanStatus.CHECK_FAILED,
        checkedAt: new Date().toISOString(),
        error: 'External service unavailable. Please try again later.',
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
