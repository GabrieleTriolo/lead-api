import { Module } from '@nestjs/common';
import { LeadApplicantsService } from './lead-applicants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadApplicant } from './entities/lead-applicant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeadApplicant])],
  providers: [LeadApplicantsService],
  exports: [LeadApplicantsService, TypeOrmModule],
})
export class LeadApplicantsModule {}
