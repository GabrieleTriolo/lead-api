import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadRepository } from './repositories/lead.repository';
import { LeadApplicantRepository } from '../lead-applicants/repositories/lead-applicant.repository';
import { Lead } from './entities/lead.entity';
import { CrmPublisherService } from '../integrations/crm/crm-publisher.service';

@Injectable()
export class LeadsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly leadsRepo: LeadRepository,
    private readonly applicantsRepo: LeadApplicantRepository,
    private readonly crmPublisher: CrmPublisherService,
  ) {}

  async create(dto: CreateLeadDto) {
    const created = await this.dataSource.transaction(async (manager) => {
      const lead = await this.leadsRepo.createLeadInTx(manager, {
        phoneNumber: dto.phoneNumber,
        requestedLoan: dto.requestedLoan,
        homeValue: dto.homeValue,
        city: dto.city,
      });

      if (dto.applicants?.length) {
        await this.applicantsRepo.bulkCreateForLead(
          manager,
          lead.id,
          dto.applicants,
        );
      }

      return this.leadsRepo.findByIdInTx(manager, lead.id);
    });

    void this.crmPublisher.publishLeadSync('create', created!);
    return created;
  }

  async update(id: number, dto: UpdateLeadDto) {
    const leadId = String(id);
    const updated = await this.dataSource.transaction(async (manager) => {
      const existing = await this.leadsRepo.findByIdInTx(manager, leadId);
      if (!existing) {
        throw new NotFoundException(`Lead ${leadId} not found`);
      }

      const patch: Partial<Lead> = {};

      if (dto.phoneNumber !== undefined) {
        patch.phoneNumber = dto.phoneNumber;
      }

      if (dto.requestedLoan !== undefined) {
        patch.requestedLoan = dto.requestedLoan;
      }

      if (dto.homeValue !== undefined) {
        patch.homeValue = dto.homeValue;
      }

      if (dto.city !== undefined) {
        patch.city = dto.city;
      }

      if (dto.crmId !== undefined) {
        patch.crmId = String(dto.crmId);
      }

      if (Object.keys(patch).length) {
        await this.leadsRepo.updateLeadInTx(manager, leadId, patch);
      }

      if (dto.applicants) {
        await this.applicantsRepo.upsertForLeadInTx(
          manager,
          leadId,
          dto.applicants,
        );
      }

      return this.leadsRepo.findByIdInTx(manager, leadId);
    });

    void this.crmPublisher.publishLeadSync('update', updated!);
    return updated;
  }
}
