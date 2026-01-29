import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WorkPermitCheckService } from './work-permit-check.service';
import { WorkPermitQueryDto, WorkPermitResultDto } from './dto';

@ApiTags('utilities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'utilities/work-permit-check',
  version: '1',
})
export class WorkPermitCheckController {
  constructor(private readonly workPermitCheckService: WorkPermitCheckService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Check work permit validity',
    description: `
Проверка действительности разрешения на работу (РНР) для иностранных граждан из визовых стран.

**Возможности:**
- Проверка по серии и номеру разрешения
- Определение статуса: действительно, недействительно, истекло, не найдено
- Получение информации о регионе, работодателе, сроке действия
- Кэширование результатов на 6 часов

**Статусы:**
- \`VALID\` - разрешение действительно
- \`INVALID\` - разрешение недействительно (аннулировано)
- \`EXPIRED\` - срок действия разрешения истек
- \`NOT_FOUND\` - разрешение не найдено в базе
- \`UNKNOWN\` - статус неизвестен (ошибка проверки)

**Важно:**
- Данные кэшируются на 6 часов
- При недоступности сервиса ФМС возвращается fallback ответ
- По умолчанию WORK_PERMIT_ENABLED=false (возвращает mock данные)
- Для тестирования: серия "00" = недействителен, серия "99" = срок истек

**Rate limit:** 10 запросов в минуту
    `,
  })
  @ApiBody({
    type: WorkPermitQueryDto,
    description: 'Данные разрешения на работу для проверки',
    examples: {
      valid: {
        summary: 'Стандартная проверка',
        value: {
          series: '77',
          number: '1234567',
        },
      },
      withFio: {
        summary: 'Проверка с ФИО',
        value: {
          series: '77',
          number: '1234567',
          lastName: 'Иванов',
          firstName: 'Иван',
          middleName: 'Иванович',
        },
      },
      testInvalid: {
        summary: 'Тестовые данные (недействителен)',
        value: {
          series: '00',
          number: '0000000',
        },
      },
      testExpired: {
        summary: 'Тестовые данные (истек)',
        value: {
          series: '99',
          number: '9999999',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Результат проверки разрешения на работу',
    type: WorkPermitResultDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректные параметры запроса' })
  @ApiResponse({ status: 401, description: 'Требуется авторизация' })
  @ApiResponse({ status: 429, description: 'Превышен лимит запросов' })
  async checkPermit(@Body() query: WorkPermitQueryDto): Promise<WorkPermitResultDto> {
    return this.workPermitCheckService.checkPermit(query);
  }
}
