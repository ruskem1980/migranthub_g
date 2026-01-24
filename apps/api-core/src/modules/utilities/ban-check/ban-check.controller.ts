import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BanCheckService } from './ban-check.service';
import { BanCheckQueryDto, BanCheckResponseDto } from './dto';

@ApiTags('utilities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'utilities/ban-check',
  version: '1',
})
export class BanCheckController {
  constructor(private readonly banCheckService: BanCheckService) {}

  @Get()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Check entry ban status',
    description:
      'Checks if a person has an entry ban to Russia. Rate limited to 10 requests per minute.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ban check result',
    type: BanCheckResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async checkBan(@Query() query: BanCheckQueryDto): Promise<BanCheckResponseDto> {
    return this.banCheckService.checkBan(query);
  }
}
