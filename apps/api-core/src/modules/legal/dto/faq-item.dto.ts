import { ApiProperty } from '@nestjs/swagger';

export class FaqItemDto {
  @ApiProperty({ example: 'faq-1' })
  id!: string;

  @ApiProperty({ example: 'registration' })
  categoryId!: string;

  @ApiProperty({ example: 'Сколько дней на постановку на учёт?' })
  question!: string;

  @ApiProperty({ example: 'Для граждан СНГ — 7 рабочих дней...' })
  answer!: string;

  @ApiProperty({ example: 1 })
  order!: number;
}
