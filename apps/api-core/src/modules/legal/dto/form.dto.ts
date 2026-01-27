import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

export class FormDto {
  @ApiProperty({
    description: 'Unique form identifier',
    example: 'notice-arrival',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({
    description: 'Form title',
    example: 'Уведомление о прибытии иностранного гражданина',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Form description',
    example: 'Бланк уведомления для постановки на миграционный учёт',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'URL to download the form',
    example: 'https://мвд.рф/upload/site1/document_file/blank_uvedomlenie.pdf',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  downloadUrl?: string;

  @ApiProperty({
    description: 'Category ID this form belongs to',
    example: 'registration',
  })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;
}
