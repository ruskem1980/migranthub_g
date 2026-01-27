import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class FaqItemDto {
  @ApiProperty({
    description: 'Unique FAQ item identifier',
    example: 'faq-registration-1',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({
    description: 'FAQ question',
    example: 'Сколько дней можно находиться в России без регистрации?',
  })
  @IsString()
  @IsNotEmpty()
  question!: string;

  @ApiProperty({
    description: 'FAQ answer',
    example: 'Иностранный гражданин обязан встать на миграционный учёт в течение 7 рабочих дней с момента въезда.',
  })
  @IsString()
  @IsNotEmpty()
  answer!: string;

  @ApiProperty({
    description: 'Category ID this FAQ belongs to',
    example: 'registration',
  })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;
}
