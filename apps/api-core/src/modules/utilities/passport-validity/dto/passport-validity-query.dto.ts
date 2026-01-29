import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, Length } from 'class-validator';

/**
 * DTO для запроса проверки действительности паспорта РФ
 */
export class PassportValidityQueryDto {
  @ApiProperty({
    description: 'Серия паспорта (4 цифры)',
    example: '4510',
    minLength: 4,
    maxLength: 4,
  })
  @IsString()
  @Length(4, 4, { message: 'Серия паспорта должна содержать ровно 4 цифры' })
  @Matches(/^\d{4}$/, { message: 'Серия паспорта должна состоять из 4 цифр' })
  series!: string;

  @ApiProperty({
    description: 'Номер паспорта (6 цифр)',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6, { message: 'Номер паспорта должен содержать ровно 6 цифр' })
  @Matches(/^\d{6}$/, { message: 'Номер паспорта должен состоять из 6 цифр' })
  number!: string;
}
