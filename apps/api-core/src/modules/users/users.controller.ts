import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators';
import { UsersService } from './users.service';
import { DeadlineCalculatorService } from './deadline-calculator.service';
import {
  UpdateUserDto,
  UserResponseDto,
  CompleteOnboardingDto,
  CalculateDeadlinesDto,
  DeadlinesResponseDto,
} from './dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly deadlineCalculatorService: DeadlineCalculatorService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@CurrentUser() user: CurrentUserPayload): Promise<UserResponseDto> {
    const profile = await this.usersService.getProfile(user.id);
    return UserResponseDto.fromEntity(profile);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const profile = await this.usersService.updateProfile(user.id, dto);
    return UserResponseDto.fromEntity(profile);
  }

  @Post('onboarding/complete')
  @ApiOperation({ summary: 'Complete user onboarding' })
  @ApiResponse({
    status: 200,
    description: 'Onboarding completed successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request body or onboarding already completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async completeOnboarding(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CompleteOnboardingDto,
  ): Promise<UserResponseDto> {
    const profile = await this.usersService.completeOnboarding(user.id, dto);
    return UserResponseDto.fromEntity(profile);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate migration deadlines' })
  @ApiResponse({
    status: 200,
    description: 'Deadlines calculated successfully',
    type: DeadlinesResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  calculateDeadlines(@Body() dto: CalculateDeadlinesDto): DeadlinesResponseDto {
    return this.deadlineCalculatorService.calculateDeadlines(dto);
  }

  @Delete('account')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user account (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Account deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteAccount(@CurrentUser() user: CurrentUserPayload): Promise<void> {
    await this.usersService.deleteAccount(user.id);
  }
}
