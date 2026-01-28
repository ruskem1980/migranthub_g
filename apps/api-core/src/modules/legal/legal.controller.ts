import { Controller, Get, Post, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { LegalService } from './legal.service';
import {
  CategoryDto,
  CategoryItemsDto,
  LawDto,
  LawFilterDto,
  FormDto,
  FaqItemDto,
  PatentCalcRequestDto,
  PatentCalcResponseDto,
  StayCalcRequestDto,
  StayCalcResponseDto,
  LegalMetadataDto,
} from './dto';

@ApiTags('Legal')
@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  // ==================== Metadata ====================

  @Get('metadata')
  @Public()
  @ApiOperation({ summary: 'Get legal data metadata (last updated date, counts)' })
  @ApiResponse({ status: 200, type: LegalMetadataDto })
  getMetadata(): LegalMetadataDto {
    return this.legalService.getMetadata();
  }

  // ==================== Categories ====================

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, type: [CategoryDto] })
  getCategories(): CategoryDto[] {
    return this.legalService.getCategories();
  }

  @Get('categories/:id')
  @Public()
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', example: 'registration' })
  @ApiResponse({ status: 200, type: CategoryDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  getCategoryById(@Param('id') id: string): CategoryDto {
    return this.legalService.getCategoryById(id);
  }

  @Get('categories/:id/items')
  @Public()
  @ApiOperation({ summary: 'Get category items (laws, forms, faq)' })
  @ApiParam({ name: 'id', example: 'registration' })
  @ApiResponse({ status: 200, type: CategoryItemsDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  getCategoryItems(@Param('id') id: string): CategoryItemsDto {
    return this.legalService.getCategoryItems(id);
  }

  // ==================== Laws ====================

  @Get('laws')
  @Public()
  @ApiOperation({ summary: 'Get all laws with optional filter' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, type: [LawDto] })
  getLaws(@Query() filter: LawFilterDto): LawDto[] {
    return this.legalService.getLaws(filter);
  }

  @Get('laws/:id')
  @Public()
  @ApiOperation({ summary: 'Get law by ID' })
  @ApiParam({ name: 'id', example: 'fz-115' })
  @ApiResponse({ status: 200, type: LawDto })
  @ApiResponse({ status: 404, description: 'Law not found' })
  getLawById(@Param('id') id: string): LawDto {
    return this.legalService.getLawById(id);
  }

  // ==================== Forms ====================

  @Get('forms')
  @Public()
  @ApiOperation({ summary: 'Get all forms' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiResponse({ status: 200, type: [FormDto] })
  getForms(@Query('categoryId') categoryId?: string): FormDto[] {
    return this.legalService.getForms(categoryId);
  }

  @Get('forms/:id')
  @Public()
  @ApiOperation({ summary: 'Get form by ID' })
  @ApiParam({ name: 'id', example: 'form-registration' })
  @ApiResponse({ status: 200, type: FormDto })
  @ApiResponse({ status: 404, description: 'Form not found' })
  getFormById(@Param('id') id: string): FormDto {
    return this.legalService.getFormById(id);
  }

  // ==================== FAQ ====================

  @Get('faq')
  @Public()
  @ApiOperation({ summary: 'Get FAQ items' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiResponse({ status: 200, type: [FaqItemDto] })
  getFaq(@Query('categoryId') categoryId?: string): FaqItemDto[] {
    return this.legalService.getFaq(categoryId);
  }

  // ==================== Calculators ====================

  @Get('calculators/patent/regions')
  @Public()
  @ApiOperation({ summary: 'Get patent regions with prices' })
  @ApiResponse({ status: 200 })
  getPatentRegions() {
    return this.legalService.getPatentRegions();
  }

  @Post('calculators/patent')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate patent price' })
  @ApiResponse({ status: 200, type: PatentCalcResponseDto })
  @ApiResponse({ status: 404, description: 'Region not found' })
  calculatePatentPrice(@Body() request: PatentCalcRequestDto): PatentCalcResponseDto {
    return this.legalService.calculatePatentPrice(request);
  }

  @Post('calculators/stay')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate 90/180 days stay period' })
  @ApiResponse({ status: 200, type: StayCalcResponseDto })
  calculateStay(@Body() request: StayCalcRequestDto): StayCalcResponseDto {
    return this.legalService.calculateStay(request);
  }
}
