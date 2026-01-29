import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  ParseUUIDPipe,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators';
import { User } from '../users/entities/user.entity';
import {
  CreatePaymentDto,
  PaymentResponseDto,
  CreatePaymentResponseDto,
  PaymentStatusResponseDto,
  YooKassaWebhookDto,
} from './dto';

@ApiTags('payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create new payment',
    description:
      'Creates a new payment for patent fee. Returns a URL to redirect user for payment completion.',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: CreatePaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async createPayment(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: User,
    @Req() req: Request,
  ): Promise<CreatePaymentResponseDto> {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    return this.paymentsService.createPayment(user.id, dto, ipAddress, userAgent);
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment status',
    description: 'Returns the current status of a payment. Checks YooKassa for pending payments.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status returned',
    type: PaymentStatusResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async getPaymentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<PaymentStatusResponseDto> {
    return this.paymentsService.getPaymentStatus(id, user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment details',
    description: 'Returns full payment details including metadata.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment details returned',
    type: PaymentResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async getPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.getPayment(id, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment history',
    description: 'Returns paginated list of user payments.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of payments to return (default: 20)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of payments to skip (default: 0)',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment history returned',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async getPayments(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ payments: PaymentResponseDto[]; total: number }> {
    return this.paymentsService.getUserPayments(
      user.id,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({
    summary: 'YooKassa webhook endpoint',
    description:
      'Receives payment status updates from YooKassa. This endpoint should be configured in YooKassa dashboard.',
  })
  @ApiHeader({
    name: 'Content-Type',
    description: 'application/json',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid webhook payload',
  })
  async handleWebhook(@Body() dto: YooKassaWebhookDto): Promise<{ status: string }> {
    await this.paymentsService.processWebhook(dto);
    return { status: 'ok' };
  }
}
