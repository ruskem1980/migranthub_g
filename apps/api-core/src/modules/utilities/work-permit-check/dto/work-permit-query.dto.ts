import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Matches, Length, IsOptional } from 'class-validator';

/**
 * DTO для запроса проверки разрешения на работу (РНР)
 */
export class WorkPermitQueryDto {
  @ApiProperty({
    description: 'Серия разрешения на работу (2-4 символа)',
    example: '77',
    minLength: 2,
    maxLength: 4,
  })
  @IsString()
  @Length(2, 4, { message: 'Серия разрешения должна содержать от 2 до 4 символов' })
  @Matches(/^[A-Za-z0-9]{2,4}$/, {
    message: 'Серия разрешения должна состоять из 2-4 буквенно-цифровых символов',
  })
  series!: string;

  @ApiProperty({
    description: 'Номер разрешения на работу (6-7 цифр)',
    example: '1234567',
    minLength: 6,
    maxLength: 7,
  })
  @IsString()
  @Length(6, 7, { message: 'Номер разрешения должен содержать от 6 до 7 цифр' })
  @Matches(/^\d{6,7}$/, { message: 'Номер разрешения должен состоять из 6-7 цифр' })
  number!: string;

  @ApiPropertyOptional({
    description: 'Фамилия владельца (для уточнения поиска)',
    example: 'Иванов',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Фамилия должна содержать от 1 до 100 символов' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Имя владельца (для уточнения поиска)',
    example: 'Иван',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Имя должно содержать от 1 до 100 символов' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Отчество владельца (для уточнения поиска)',
    example: 'Иванович',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Отчество должно содержать от 1 до 100 символов' })
  middleName?: string;
}
