import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermitStatusCheckService } from './permit-status-check.service';
import { CheckPermitDto, PermitStatusResponseDto } from './dto';

@ApiTags('utilities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'utilities/permit-status',
  version: '1',
})
export class PermitStatusCheckController {
  constructor(private readonly permitStatusCheckService: PermitStatusCheckService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Check RVP/VNJ application status',
    description:
      'Checks the status of RVP (temporary residence permit) or VNJ (residence permit) application. Rate limited to 5 requests per minute.',
  })
  @ApiResponse({
    status: 200,
    description: 'Permit status check result',
    type: PermitStatusResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async checkPermitStatus(@Body() body: CheckPermitDto): Promise<PermitStatusResponseDto> {
    return this.permitStatusCheckService.checkStatus(body);
  }
}
