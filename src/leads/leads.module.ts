import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './entities/lead.entity';
import { LeadApplicant } from '../lead-applicants/entities/lead-applicant.entity';
import { LeadRepository } from './repositories/lead.repository';
import { LeadApplicantRepository } from '../lead-applicants/repositories/lead-applicant.repository';
import { CrmModule } from '../integrations/crm/crm.module';
import { LeadSimulationsModule } from '../lead-simulations/lead-simulations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, LeadApplicant]), CrmModule, LeadSimulationsModule],
  controllers: [LeadsController],
  providers: [LeadsService, LeadRepository, LeadApplicantRepository],
  exports: [LeadsService, TypeOrmModule],
})
export class LeadsModule {}
