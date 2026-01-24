import { ApiProperty } from '@nestjs/swagger';

export class PatentRegionDto {
  @ApiProperty({
    description: 'Region code',
    example: '77',
  })
  code!: string;

  @ApiProperty({
    description: 'Region name',
    example: 'Москва',
  })
  name!: string;

  @ApiProperty({
    description: 'Monthly patent price in rubles',
    example: 7500,
  })
  price!: number;
}

export class PatentRegionsResponseDto {
  @ApiProperty({
    description: 'List of regions with patent prices',
    type: [PatentRegionDto],
  })
  regions!: PatentRegionDto[];

  @ApiProperty({
    description: 'Data update timestamp',
    example: '2024-01-01',
  })
  updatedAt!: string;
}
