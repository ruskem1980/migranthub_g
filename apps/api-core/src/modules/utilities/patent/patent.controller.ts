import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../auth/decorators/public.decorator';
import { PatentService } from './patent.service';
import { PatentCheckService } from './patent-check.service';
import {
  PatentRegionsResponseDto,
  CheckPatentDto,
  PatentCheckResultDto,
  PatentCheckErrorDto,
} from './dto';

@ApiTags('utilities')
@Controller({
  path: 'utilities/patent',
  version: '1',
})
export class PatentController {
  constructor(
    private readonly patentService: PatentService,
    private readonly patentCheckService: PatentCheckService,
  ) {}

  @Get('regions')
  @Public()
  @ApiOperation({
    summary: 'Get patent prices by region',
    description: 'Returns list of Russian regions with monthly patent prices. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of regions with patent prices',
    type: PatentRegionsResponseDto,
  })
  async getRegions(): Promise<PatentRegionsResponseDto> {
    return this.patentService.getRegions();
  }

  @Post('check')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 запросов в минуту
  @ApiOperation({
    summary: 'Check patent validity',
    description: `
Проверяет действительность патента на работу через сервис ФМС.

**Важно:**
- Результаты кэшируются на 6 часов
- При недоступности сервиса ФМС возвращается graceful degradation
- Rate limit: 10 запросов в минуту

**Статусы патента:**
- \`valid\` - Патент действителен
- \`invalid\` - Патент недействителен
- \`expired\` - Срок действия патента истек
- \`not_found\` - Патент не найден в базе данных
- \`error\` - Ошибка при проверке
    `,
  })
  @ApiBody({ type: CheckPatentDto })
  @ApiResponse({
    status: 200,
    description: 'Результат проверки патента',
    type: PatentCheckResultDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные входные данные',
  })
  @ApiServiceUnavailableResponse({
    description: 'Сервис проверки временно недоступен',
    type: PatentCheckErrorDto,
  })
  async checkPatent(@Body() dto: CheckPatentDto): Promise<PatentCheckResultDto> {
    return this.patentCheckService.checkPatent(dto);
  }

  @Get('check/status')
  @Public()
  @ApiOperation({
    summary: 'Get patent check service status',
    description:
      'Returns current status of the patent check service including circuit breaker state.',
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
  getCheckStatus(): {
    enabled: boolean;
    circuitState: string;
    failures: number;
  } {
    const circuitInfo = this.patentCheckService.getCircuitState();
    return {
      enabled: this.patentCheckService.isEnabled(),
      circuitState: circuitInfo.state,
      failures: circuitInfo.failures,
    };
  }
}
