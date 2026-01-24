import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, Length, IsNotEmpty } from 'class-validator';

export class BanCheckQueryDto {
  @ApiProperty({
    description: 'Last name (surname) in Latin characters',
    example: 'IVANOV',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  lastName!: string;

  @ApiProperty({
    description: 'First name in Latin characters',
    example: 'IVAN',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  firstName!: string;

  @ApiProperty({
    description: 'Birth date in ISO format',
    example: '1990-01-15',
  })
  @IsDateString()
  birthDate!: string;
}
