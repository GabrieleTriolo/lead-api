import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateLeadApplicantDto } from './create-lead-applicant.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLeadApplicantDto extends PartialType(CreateLeadApplicantDto) {
  @ApiPropertyOptional({ example: '123', description: 'Existing applicant id' })
  @IsOptional()
  @IsString()
  id?: string;
}
