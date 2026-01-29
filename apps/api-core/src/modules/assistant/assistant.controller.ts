import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { AssistantService } from './assistant.service';
import { SendMessageDto, AssistantResponseDto } from './dto';

@ApiTags('Assistant')
@Controller({
  path: 'assistant',
  version: '1',
})
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('message')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send a message to the AI assistant',
    description:
      'Send a migration-related question and receive an AI-generated response. ' +
      'The assistant automatically detects the user language and responds in the same language. ' +
      'Questions about illegal activities will be blocked with an explanation.',
  })
  @ApiResponse({
    status: 200,
    description: 'Message processed successfully',
    type: AssistantResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or failed to generate response',
  })
  async sendMessage(@Body() dto: SendMessageDto): Promise<AssistantResponseDto> {
    return this.assistantService.sendMessage(dto);
  }
}
