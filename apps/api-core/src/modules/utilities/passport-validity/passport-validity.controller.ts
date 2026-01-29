import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PassportValidityService } from './passport-validity.service';
import { PassportValidityQueryDto, PassportValidityResultDto } from './dto';

@ApiTags('utilities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'utilities/passport-validity',
  version: '1',
})
export class PassportValidityController {
  constructor(private readonly passportValidityService: PassportValidityService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Check Russian passport validity',
    description: `
Проверка действительности паспорта гражданина РФ в базе недействительных паспортов МВД.

**Возможности:**
- Проверка по серии и номеру паспорта
- Определение статуса: действителен, недействителен, не найден
- Кэширование результатов на 7 дней

**Статусы:**
- \`VALID\` - паспорт действителен
- \`INVALID\` - паспорт числится в базе недействительных
- \`NOT_FOUND\` - паспорт не найден в базе недействительных (считается действительным)
- \`UNKNOWN\` - статус неизвестен (ошибка проверки)

**Важно:**
- Данные кэшируются на 7 дней
- При недоступности сервиса МВД возвращается fallback ответ
- По умолчанию PASSPORT_VALIDITY_ENABLED=false (возвращает mock данные)
- Для тестирования: серия 0000 = недействителен

**Rate limit:** 10 запросов в минуту
    `,
  })
  @ApiBody({
    type: PassportValidityQueryDto,
    description: 'Данные паспорта для проверки',
    examples: {
      valid: {
        summary: 'Стандартная проверка',
        value: {
          series: '4510',
          number: '123456',
        },
      },
      testInvalid: {
        summary: 'Тестовые данные (недействителен)',
        value: {
          series: '0000',
          number: '000000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Результат проверки действительности паспорта',
    type: PassportValidityResultDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректные параметры запроса' })
  @ApiResponse({ status: 401, description: 'Требуется авторизация' })
  @ApiResponse({ status: 429, description: 'Превышен лимит запросов' })
  async checkValidity(@Body() query: PassportValidityQueryDto): Promise<PassportValidityResultDto> {
    return this.passportValidityService.checkValidity(query);
  }
}
