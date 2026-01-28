import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsEnum, Length, IsNotEmpty } from 'class-validator';

export enum ForeignDocumentType {
  FOREIGN_PASSPORT = 'FOREIGN_PASSPORT', // Паспорт иностранного гражданина (код 10)
  RVP = 'RVP', // Разрешение на временное проживание (код 15)
  VNJ = 'VNJ', // Вид на жительство (код 12)
}

export class GetInnDto {
  @ApiProperty({ description: 'Фамилия', example: 'IVANOV' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  lastName!: string;

  @ApiProperty({ description: 'Имя', example: 'IVAN' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  firstName!: string;

  @ApiPropertyOptional({
    description: 'Отчество (если есть)',
    example: 'IVANOVICH',
  })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  middleName?: string;

  @ApiProperty({ description: 'Дата рождения (ISO)', example: '1990-01-15' })
  @IsDateString()
  birthDate!: string;

  @ApiProperty({
    enum: ForeignDocumentType,
    description: 'Тип документа',
    example: ForeignDocumentType.FOREIGN_PASSPORT,
  })
  @IsEnum(ForeignDocumentType)
  documentType!: ForeignDocumentType;

  @ApiProperty({ description: 'Серия документа', example: '12' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  documentSeries!: string;

  @ApiProperty({ description: 'Номер документа', example: '3456789' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 30)
  documentNumber!: string;

  @ApiProperty({
    description: 'Дата выдачи документа (ISO)',
    example: '2020-05-20',
  })
  @IsDateString()
  documentDate!: string;
}
