import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { LegalService } from './legal.service';
import {
  CategoryDto,
  LawDto,
  FormDto,
  FaqItemDto,
  PatentCalcRequestDto,
  PatentCalcResponseDto,
  StayCalcRequestDto,
  StayCalcResponseDto,
} from './dto';

@ApiTags('legal')
@Controller({
  path: 'legal',
  version: '1',
})
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Получить категории законодательства' })
  @ApiResponse({
    status: 200,
    description: 'Список категорий законодательства',
    type: [CategoryDto],
  })
  getCategories(): CategoryDto[] {
    return this.legalService.getCategories();
  }

  @Get('categories/:id/items')
  @Public()
  @ApiOperation({ summary: 'Получить законы по категории' })
  @ApiParam({
    name: 'id',
    description: 'ID категории',
    example: 'registration',
  })
  @ApiResponse({
    status: 200,
    description: 'Список законов в категории',
    type: [LawDto],
  })
  getCategoryItems(@Param('id') id: string): LawDto[] {
    return this.legalService.getCategoryItems(id);
  }

  @Get('laws')
  @Public()
  @ApiOperation({ summary: 'Получить все законы' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Поиск по названию или номеру закона',
    example: '115-ФЗ',
  })
  @ApiResponse({
    status: 200,
    description: 'Список законов',
    type: [LawDto],
  })
  getLaws(@Query('search') search?: string): LawDto[] {
    return this.legalService.getLaws(search);
  }

  @Get('laws/:id')
  @Public()
  @ApiOperation({ summary: 'Получить закон по ID' })
  @ApiParam({
    name: 'id',
    description: 'ID закона',
    example: 'fz-115',
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о законе',
    type: LawDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Закон не найден',
  })
  getLawById(@Param('id') id: string): LawDto {
    const law = this.legalService.getLawById(id);
    if (!law) {
      throw new NotFoundException(`Закон с ID "${id}" не найден`);
    }
    return law;
  }

  @Get('forms')
  @Public()
  @ApiOperation({ summary: 'Получить формы документов' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Фильтр по категории',
    example: 'registration',
  })
  @ApiResponse({
    status: 200,
    description: 'Список форм документов',
    type: [FormDto],
  })
  getForms(@Query('category') category?: string): FormDto[] {
    return this.legalService.getForms(category);
  }

  @Get('faq')
  @Public()
  @ApiOperation({ summary: 'Получить FAQ' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Фильтр по категории',
    example: 'registration',
  })
  @ApiResponse({
    status: 200,
    description: 'Список часто задаваемых вопросов',
    type: [FaqItemDto],
  })
  getFaq(@Query('category') category?: string): FaqItemDto[] {
    return this.legalService.getFaq(category);
  }

  @Post('calculators/patent-price')
  @Public()
  @ApiOperation({ summary: 'Рассчитать стоимость патента' })
  @ApiBody({ type: PatentCalcRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Результат расчёта стоимости патента',
    type: PatentCalcResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Регион не найден',
  })
  calculatePatentPrice(@Body() dto: PatentCalcRequestDto): PatentCalcResponseDto {
    return this.legalService.calculatePatentPrice(dto);
  }

  @Post('calculators/stay')
  @Public()
  @ApiOperation({ summary: 'Рассчитать срок пребывания 90/180' })
  @ApiBody({ type: StayCalcRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Результат расчёта срока пребывания',
    type: StayCalcResponseDto,
  })
  calculateStay(@Body() dto: StayCalcRequestDto): StayCalcResponseDto {
    return this.legalService.calculateStay(dto);
  }
}
