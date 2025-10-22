import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateLeadDto } from './create-lead.dto';
import { Expose, Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiPropertyOptional({ example: 123456, name: 'crm_id' })
  @Expose({ name: 'crm_id' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  crmId?: number;
}
