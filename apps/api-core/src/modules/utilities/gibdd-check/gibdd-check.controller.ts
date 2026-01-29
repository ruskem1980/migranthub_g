import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GibddCheckService } from './gibdd-check.service';
import { GibddQueryDto, GibddResultDto, GibddCheckType } from './dto';

@ApiTags('utilities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'utilities/gibdd-fines',
  version: '1',
})
export class GibddCheckController {
  constructor(private readonly gibddCheckService: GibddCheckService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Check GIBDD fines',
    description: `
Проверка наличия штрафов ГИБДД.

**Два режима проверки:**
1. **По СТС** - госномер + номер СТС (свидетельство о регистрации ТС)
2. **По ВУ** - серия/номер водительского удостоверения + дата выдачи

**Возможности:**
- Получение списка штрафов с суммами
- Информация о скидке 50% (если доступна)
- Ссылки для оплаты на Госуслугах
- Информация о статьях КоАП РФ

**Важно:**
- Данные кэшируются на 6 часов
- При недоступности сервиса ГИБДД возвращается fallback ответ
- По умолчанию GIBDD_CHECK_ENABLED=false (возвращает mock данные)

**Rate limit:** 10 запросов в минуту
    `,
  })
  @ApiBody({
    type: GibddQueryDto,
    description: 'Данные для проверки штрафов',
    examples: {
      sts: {
        summary: 'Проверка по СТС (госномер + свидетельство)',
        value: {
          checkType: GibddCheckType.STS,
          regNumber: 'А123БВ777',
          stsNumber: '7700123456',
        },
      },
      license: {
        summary: 'Проверка по водительскому удостоверению',
        value: {
          checkType: GibddCheckType.LICENSE,
          licenseNumber: '7700123456',
          issueDate: '2020-05-15',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Результат проверки штрафов',
    type: GibddResultDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректные параметры запроса' })
  @ApiResponse({ status: 401, description: 'Требуется авторизация' })
  @ApiResponse({ status: 429, description: 'Превышен лимит запросов' })
  async checkFines(@Body() query: GibddQueryDto): Promise<GibddResultDto> {
    return this.gibddCheckService.checkFines(query);
  }
}
