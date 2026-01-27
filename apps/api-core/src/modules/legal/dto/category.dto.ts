import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({ example: 'registration' })
  id!: string;

  @ApiProperty({ example: 'Миграционный учёт' })
  name!: string;

  @ApiProperty({ example: 'Migration Registration' })
  nameEn!: string;

  @ApiProperty({ example: 'Постановка на учёт, продление' })
  description!: string;

  @ApiProperty({ example: '📋' })
  icon!: string;

  @ApiProperty({ example: 1 })
  order!: number;
}

export class CategoryItemsDto {
  @ApiProperty({ type: [Object] })
  laws!: object[];

  @ApiProperty({ type: [Object] })
  forms!: object[];

  @ApiProperty({ type: [Object] })
  faq!: object[];
}
