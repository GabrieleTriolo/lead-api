import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateLeadSimulationDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+$/, { message: 'leadId must be a numeric string (bigint)' })
  leadId!: string;
}
