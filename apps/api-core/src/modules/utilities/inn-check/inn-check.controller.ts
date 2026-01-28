import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiTooManyRequestsResponse,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InnCheckService } from './inn-check.service';
import { GetInnDto, InnResultDto } from './dto';

@ApiTags('utilities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'utilities/inn-check', version: '1' })
export class InnCheckController {
  constructor(private readonly innCheckService: InnCheckService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 запросов в минуту
  @ApiOperation({
    summary: 'Get INN by passport data',
    description: `
Получение ИНН иностранного гражданина по паспортным данным через сервис ФНС.

**Важно:**
- Результаты кэшируются на 30 дней (ИНН не меняется)
- При недоступности сервиса ФНС возвращается graceful degradation
- Rate limit: 10 запросов в минуту
- Требуется авторизация

**Поддерживаемые типы документов:**
- \`FOREIGN_PASSPORT\` - Паспорт иностранного гражданина
- \`RVP\` - Разрешение на временное проживание
- \`VNJ\` - Вид на жительство
    `,
  })
  @ApiBody({ type: GetInnDto })
  @ApiResponse({
    status: 200,
    description: 'Результат поиска ИНН',
    type: InnResultDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные входные данные',
  })
  @ApiUnauthorizedResponse({
    description: 'Не авторизован',
  })
  @ApiTooManyRequestsResponse({
    description: 'Превышен лимит запросов (10 в минуту)',
  })
  @ApiServiceUnavailableResponse({
    description: 'Сервис проверки временно недоступен',
  })
  async getInn(@Body() dto: GetInnDto): Promise<InnResultDto> {
    return this.innCheckService.getInn(dto);
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get INN check service status',
    description:
      'Returns current status of the INN check service including circuit breaker state.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service status',
    schema: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', description: 'Is the service enabled' },
        circuitState: { type: 'string', description: 'Circuit breaker state' },
        failures: { type: 'number', description: 'Current failure count' },
      },
    },
  })
  getStatus(): {
    enabled: boolean;
    circuitState: string;
    failures: number;
  } {
    const circuitInfo = this.innCheckService.getCircuitState();
    return {
      enabled: this.innCheckService.isEnabled(),
      circuitState: circuitInfo.state,
      failures: circuitInfo.failures,
    };
  }
}
