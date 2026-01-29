import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { AssistantService } from './assistant.service';
import {
  SendMessageDto,
  AssistantResponseDto,
  ChatRequestDto,
  ChatResponseDto,
  SearchRequestDto,
  SearchResponseDto,
} from './dto';

@ApiTags('Assistant')
@Controller({
  path: 'assistant',
  version: '1',
})
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  /**
   * Chat with AI assistant (RAG-enhanced)
   * Rate limited to 10 requests per minute per IP
   */
  @Post('chat')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({
    summary: 'Chat with AI assistant (RAG-enhanced)',
    description:
      'Send a migration-related question and receive an AI-generated response. ' +
      'The assistant uses RAG (Retrieval Augmented Generation) to search the knowledge base ' +
      'and provide accurate, context-aware answers. ' +
      'Rate limited to 10 requests per minute.',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat response with context',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or failed to generate response',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  @ApiResponse({
    status: 503,
    description: 'AI service temporarily unavailable (circuit breaker open)',
  })
  async chat(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    return this.assistantService.chat(dto);
  }

  /**
   * Search knowledge base
   * Rate limited to 20 requests per minute per IP
   */
  @Post('search')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  @ApiOperation({
    summary: 'Search knowledge base',
    description:
      'Search the migration knowledge base for relevant documents. ' +
      'Returns top matching Q&A items ranked by relevance. ' +
      'Rate limited to 20 requests per minute.',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: SearchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  async search(@Body() dto: SearchRequestDto): Promise<SearchResponseDto> {
    const results = await this.assistantService.searchKnowledge(
      dto.query,
      dto.language || 'ru',
      dto.limit || 5,
    );

    // Filter by category if specified
    const filteredResults = dto.category
      ? results.filter((r) => r.category === dto.category)
      : results;

    return {
      results: filteredResults,
      total: filteredResults.length,
      query: dto.query,
    };
  }

  /**
   * Legacy endpoint for backward compatibility
   * Rate limited to 10 requests per minute per IP
   */
  @Post('message')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({
    summary: 'Send a message to the AI assistant (legacy)',
    description:
      'Send a migration-related question and receive an AI-generated response. ' +
      'The assistant automatically detects the user language and responds in the same language. ' +
      'Questions about illegal activities will be blocked with an explanation. ' +
      'Rate limited to 10 requests per minute. ' +
      'Note: Use /chat endpoint for RAG-enhanced responses.',
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
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  async sendMessage(@Body() dto: SendMessageDto): Promise<AssistantResponseDto> {
    return this.assistantService.sendMessage(dto);
  }
}
