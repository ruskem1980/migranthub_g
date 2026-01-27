import { ApiProperty } from '@nestjs/swagger';

export class LegalMetadataDto {
  @ApiProperty({
    description: 'Date when legal data was last updated',
    example: '2025-01-28',
  })
  lastUpdatedAt!: string;

  @ApiProperty({
    description: 'Data source name',
    example: 'consultant.ru',
  })
  source!: string;

  @ApiProperty({
    description: 'Version of legal data',
    example: '1.0.0',
  })
  version!: string;

  @ApiProperty({
    description: 'Total number of laws',
    example: 15,
  })
  lawsCount!: number;

  @ApiProperty({
    description: 'Total number of forms',
    example: 10,
  })
  formsCount!: number;

  @ApiProperty({
    description: 'Total number of FAQ items',
    example: 25,
  })
  faqCount!: number;
}
