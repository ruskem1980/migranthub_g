import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FsspCheckService } from './fssp-check.service';
import { FsspQueryDto, FsspResultDto } from './dto';

@ApiTags('utilities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'utilities/fssp-check',
  version: '1',
})
export class FsspCheckController {
  constructor(private readonly fsspCheckService: FsspCheckService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Check FSSP debt status',
    description: `
Проверка наличия задолженности в Федеральной службе судебных приставов (ФССП).

**Возможности:**
- Поиск исполнительных производств по физическому лицу
- Получение суммы задолженности
- Список всех открытых исполнительных производств
- Информация о судебных приставах-исполнителях

**Важно:**
- Данные кэшируются на 24 часа
- При недоступности сервиса ФССП возвращается fallback ответ
- По умолчанию FSSP_CHECK_ENABLED=false (возвращает mock данные)

**Rate limit:** 10 запросов в минуту
    `,
  })
  @ApiBody({
    type: FsspQueryDto,
    description: 'Данные для проверки задолженности',
    examples: {
      moscow: {
        summary: 'Проверка в Москве',
        value: {
          lastName: 'Иванов',
          firstName: 'Иван',
          middleName: 'Петрович',
          birthDate: '1990-01-15',
          region: 77,
        },
      },
      spb: {
        summary: 'Проверка в Санкт-Петербурге',
        value: {
          lastName: 'Петров',
          firstName: 'Петр',
          birthDate: '1985-06-20',
          region: 78,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Результат проверки задолженности',
    type: FsspResultDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректные параметры запроса' })
  @ApiResponse({ status: 401, description: 'Требуется авторизация' })
  @ApiResponse({ status: 429, description: 'Превышен лимит запросов' })
  async checkDebt(@Body() query: FsspQueryDto): Promise<FsspResultDto> {
    return this.fsspCheckService.checkDebt(query);
  }
}
