import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateLeadApplicantDto {
  @ApiProperty({ example: 'first', enum: ['first', 'second'] })
  @IsString()
  @IsIn(['first', 'second'])
  type!: 'first' | 'second';

  @ApiProperty({ example: 'Luca' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 128)
  firstName!: string;

  @ApiProperty({ example: 'Rossi' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 128)
  lastName!: string;

  @ApiProperty({ example: 'luca.rossi@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '1990-05-14', description: 'ISO date YYYY-MM-DD' })
  @IsDateString()
  birthDate!: string;

  @ApiProperty({ example: 2200.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyIncome!: number;

  @ApiProperty({ example: 13, enum: [12, 13, 14] })
  @IsInt()
  @Min(12)
  @Max(14)
  payFrequency!: 12 | 13 | 14;
}
