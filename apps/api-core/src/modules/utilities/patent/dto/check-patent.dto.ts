import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches, IsOptional } from 'class-validator';

/**
 * DTO для запроса проверки действительности патента
 */
export class CheckPatentDto {
  @ApiProperty({
    description: 'Серия патента',
    example: '77',
    minLength: 2,
    maxLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 2, { message: 'Серия патента должна состоять из 2 символов' })
  @Matches(/^\d{2}$/, { message: 'Серия патента должна содержать 2 цифры' })
  series!: string;

  @ApiProperty({
    description: 'Номер патента',
    example: '12345678',
    minLength: 8,
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 10, {
    message: 'Номер патента должен содержать от 8 до 10 символов',
  })
  @Matches(/^\d{8,10}$/, {
    message: 'Номер патента должен содержать от 8 до 10 цифр',
  })
  number!: string;

  @ApiProperty({
    description: 'Фамилия владельца патента (латиницей)',
    example: 'IVANOV',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  @Matches(/^[A-Za-z\-\s]+$/, {
    message: 'Фамилия должна быть на латинице',
  })
  lastName?: string;

  @ApiProperty({
    description: 'Имя владельца патента (латиницей)',
    example: 'IVAN',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  @Matches(/^[A-Za-z\-\s]+$/, {
    message: 'Имя должно быть на латинице',
  })
  firstName?: string;
}
