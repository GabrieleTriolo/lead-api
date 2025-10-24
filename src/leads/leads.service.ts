import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadRepository } from './repositories/lead.repository';
import { LeadApplicantRepository } from '../lead-applicants/repositories/lead-applicant.repository';
import { Lead } from './entities/lead.entity';
import { CrmPublisherService } from '../integrations/crm/crm-publisher.service';
import { LeadSimulationsService } from '../lead-simulations/lead-simulations.service';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly leadsRepo: LeadRepository,
    private readonly applicantsRepo: LeadApplicantRepository,
    private readonly crmPublisher: CrmPublisherService,
    private readonly leadSimulations: LeadSimulationsService,
  ) {}

  async upsertByPhone(dto: CreateLeadDto) {
    let action: 'create' | 'update' = 'create';
    const result = await this.dataSource.transaction(async (manager) => {
      const existing = await this.leadsRepo.findByPhoneInTx(
        manager,
        dto.phoneNumber,
      );

      if (existing) {
        action = 'update';

        const patch: Partial<Lead> = {
          requestedLoan: dto.requestedLoan,
          homeValue: dto.homeValue,
          city: dto.city,
        };
        await this.leadsRepo.updateLeadInTx(manager, existing.id, patch);
        await this.applicantsRepo.replaceForLeadInTx(manager, existing.id, dto.applicants);
        return this.leadsRepo.findByIdInTx(manager, existing.id);
      }

      const created = await this.leadsRepo.createLeadInTx(manager, {
        phoneNumber: dto.phoneNumber,
        requestedLoan: dto.requestedLoan,
        homeValue: dto.homeValue,
        city: dto.city,
      });
      await this.applicantsRepo.bulkCreateForLead(manager, created.id, dto.applicants);
      return this.leadsRepo.findByIdInTx(manager, created.id);
    });

    // Publish CRM event
    void this.crmPublisher.publishLeadSync(action, result!);

    // Create idempotent simulation
    this.leadSimulations
      .createForLeadWithIdempotency(result!.id, {
        requestedLoan: result!.requestedLoan,
        homeValue: result!.homeValue,
        city: result!.city,
      })
      .catch((err) => this.logger.error('Failed to create lead simulation', err?.stack || String(err)));

    return result;
  }

}
