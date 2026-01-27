import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CategoryDto {
  @ApiProperty({
    description: 'Unique category identifier',
    example: 'registration',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({
    description: 'Category display name',
    example: 'Миграционный учёт',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Category icon name',
    example: 'home',
  })
  @IsString()
  @IsNotEmpty()
  icon!: string;

  @ApiProperty({
    description: 'Number of items in category',
    example: 5,
  })
  @IsInt()
  @Min(0)
  itemCount!: number;
}
