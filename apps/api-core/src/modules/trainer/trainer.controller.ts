import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { TrainerService } from './trainer.service';
import {
  StartScenarioDto,
  ContinueConversationDto,
  ScenarioDescriptionDto,
  ScenarioResponseDto,
  SessionHistoryDto,
} from './dto';

@ApiTags('Trainer')
@Controller({
  path: 'trainer',
  version: '1',
})
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  @Get('scenarios')
  @Public()
  @ApiOperation({
    summary: 'Get available training scenarios',
    description: 'Returns list of all available training scenarios with descriptions',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available scenarios',
    type: [ScenarioDescriptionDto],
  })
  getScenarios(): ScenarioDescriptionDto[] {
    return this.trainerService.getAvailableScenarios();
  }

  @Post('start')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start a new training scenario',
    description: 'Initializes a new training session with the specified scenario type',
  })
  @ApiResponse({
    status: 200,
    description: 'Scenario started successfully',
    type: ScenarioResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid scenario type',
  })
  async startScenario(@Body() dto: StartScenarioDto): Promise<ScenarioResponseDto> {
    return this.trainerService.startScenario(dto);
  }

  @Post('message')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send a message in the training scenario',
    description: 'Continues the conversation and receives AI response with evaluation',
  })
  @ApiResponse({
    status: 200,
    description: 'Message processed successfully',
    type: ScenarioResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Session already completed or invalid request',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  async continueConversation(@Body() dto: ContinueConversationDto): Promise<ScenarioResponseDto> {
    return this.trainerService.continueConversation(dto);
  }

  @Get('session/:id')
  @Public()
  @ApiOperation({
    summary: 'Get session history',
    description: 'Returns the full conversation history for a training session',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Session history',
    type: SessionHistoryDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  getSessionHistory(@Param('id') sessionId: string): SessionHistoryDto {
    return this.trainerService.getSessionHistory(sessionId);
  }
}
