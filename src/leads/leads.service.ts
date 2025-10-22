import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadRepository } from './repositories/lead.repository';
import { LeadApplicantRepository } from '../lead-applicants/repositories/lead-applicant.repository';

@Injectable()
export class LeadsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly leadsRepo: LeadRepository,
    private readonly applicantsRepo: LeadApplicantRepository,
  ) {}

  async create(dto: CreateLeadDto) {
    return this.dataSource.transaction(async (manager) => {
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
  }

  update(id: number, _dto: UpdateLeadDto) {
    return `This action updates a #${id} lead`;
  }
}
