import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsNumber,
  IsPositive,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { CreateLeadApplicantDto } from '../../lead-applicants/dto/create-lead-applicant.dto';

export class CreateLeadDto {
  @ApiProperty({ example: '+393804306394', name: 'phone_number' })
  @Expose({ name: 'phone_number' })
  @IsString()
  @Length(3, 32)
  phoneNumber!: string;

  @ApiProperty({ example: 150000, name: 'requested_loan' })
  @Expose({ name: 'requested_loan' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  requestedLoan!: number;

  @ApiProperty({ example: 250000, name: 'home_value' })
  @Expose({ name: 'home_value' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  homeValue!: number;

  @ApiProperty({ example: 'Pisa' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 128)
  city!: string;

  @ApiProperty({
    name: 'applicants',
    type: [CreateLeadApplicantDto],
    example: [
      {
        type: 'first',
        firstName: 'Luca',
        lastName: 'Rossi',
        email: 'luca.rossi@example.com',
        birthDate: '1990-05-14',
        monthlyIncome: 2200.0,
        payFrequency: 13,
      },
      {
        type: 'second',
        firstName: 'Giulia',
        lastName: 'Bianchi',
        email: 'giulia.bianchi@example.com',
        birthDate: '1992-10-20',
        monthlyIncome: 1800.0,
        payFrequency: 12,
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateLeadApplicantDto)
  @ArrayMinSize(1)
  applicants!: CreateLeadApplicantDto[];
}
