import { ApiProperty } from '@nestjs/swagger';

export class FormDto {
  @ApiProperty({ example: 'form-registration' })
  id!: string;

  @ApiProperty({ example: 'registration' })
  categoryId!: string;

  @ApiProperty({ example: 'Уведомление о прибытии' })
  title!: string;

  @ApiProperty({ example: 'Форма для постановки на учёт' })
  description!: string;

  @ApiProperty({ example: '/forms/uvedomlenie.pdf' })
  fileUrl!: string;

  @ApiProperty({ example: 'pdf', enum: ['pdf', 'doc', 'docx'] })
  format!: string;

  @ApiProperty({ example: '156 KB', required: false })
  size?: string;
}
