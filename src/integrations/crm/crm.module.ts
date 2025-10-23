import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmPublisherService } from './crm-publisher.service';
import { Lead } from '../../leads/entities/lead.entity';
import { LeadApplicant } from '../../lead-applicants/entities/lead-applicant.entity';
import { LeadRepository } from '../../leads/repositories/lead.repository';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, LeadApplicant]), RabbitmqModule],
  providers: [CrmPublisherService, LeadRepository],
  exports: [CrmPublisherService],
})
export class CrmModule {}
