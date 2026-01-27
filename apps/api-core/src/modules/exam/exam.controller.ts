import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators';
import { Public } from '../auth/decorators/public.decorator';
import { ExamService } from './exam.service';
import {
  CategoryDto,
  QuestionDto,
  GetQuestionsQueryDto,
  SubmitExamDto,
  ExamResultDto,
  ExamProgressDto,
  ExamStatisticsDto,
} from './dto';

@ApiTags('Exam')
@Controller({
  path: 'exam',
  version: '1',
})
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Get all exam categories' })
  @ApiResponse({
    status: 200,
    description: 'List of exam categories',
    type: [CategoryDto],
  })
  getCategories(): CategoryDto[] {
    return this.examService.getCategories();
  }

  @Get('questions')
  @Public()
  @ApiOperation({ summary: 'Get exam questions with optional filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of questions',
    type: [QuestionDto],
  })
  getQuestions(@Query() query: GetQuestionsQueryDto): QuestionDto[] {
    return this.examService.getQuestions(query);
  }

  @Post('submit')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit exam answers and get results' })
  @ApiResponse({
    status: 200,
    description: 'Exam results',
    type: ExamResultDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async submitExam(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SubmitExamDto,
  ): Promise<ExamResultDto> {
    return this.examService.submitExam(user.deviceId, dto);
  }

  @Get('progress')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user exam progress' })
  @ApiResponse({
    status: 200,
    description: 'User progress data',
    type: ExamProgressDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProgress(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ExamProgressDto> {
    return this.examService.getProgress(user.deviceId);
  }

  @Get('statistics')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user exam statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics',
    type: ExamStatisticsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStatistics(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ExamStatisticsDto> {
    return this.examService.getStatistics(user.deviceId);
  }
}
