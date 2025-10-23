import { ApiPropertyOptional, PartialType, ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateLeadDto } from './create-lead.dto';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type as TransformType } from 'class-transformer';
import { UpdateLeadApplicantDto } from '../../lead-applicants/dto/update-lead-applicant.dto';

export class UpdateLeadDto extends PartialType(OmitType(CreateLeadDto, ['applicants'] as const)) {
  @ApiPropertyOptional({ example: 123456, name: 'crm_id' })
  @Expose({ name: 'crm_id' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  crmId?: number;

  @ApiProperty({ required: false, type: [UpdateLeadApplicantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @TransformType(() => UpdateLeadApplicantDto)
  applicants?: UpdateLeadApplicantDto[];
}
