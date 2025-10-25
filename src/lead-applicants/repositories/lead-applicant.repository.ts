import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { LeadApplicant } from '../entities/lead-applicant.entity';
import { CreateLeadApplicantDto } from '../dto/create-lead-applicant.dto';
import { UpdateLeadApplicantDto } from '../dto/update-lead-applicant.dto';

@Injectable()
export class LeadApplicantRepository {
  constructor(
    @InjectRepository(LeadApplicant)
    private readonly repo: Repository<LeadApplicant>,
  ) {}

  bulkCreateForLead(
    manager: EntityManager,
    leadId: string,
    items: CreateLeadApplicantDto[] | UpdateLeadApplicantDto[],
  ) {
    const txRepo = manager.getRepository(LeadApplicant);
    const rows: DeepPartial<LeadApplicant>[] = items.map((a) => ({
      leadId,
      type: a.type,
      firstName: a.firstName,
      lastName: a.lastName,
      email: a.email,
      birthDate: a.birthDate,
      monthlyIncome: this.toMoney(a.monthlyIncome),
      payFrequency: a.payFrequency,
    }));
    const entities = txRepo.create(rows);
    return txRepo.save(entities);
  }

  async replaceForLeadInTx(
    manager: EntityManager,
    leadId: string,
    items: CreateLeadApplicantDto[] | UpdateLeadApplicantDto[],
  ): Promise<void> {
    const txRepo = manager.getRepository(LeadApplicant);
    await txRepo.delete({ leadId });
    await this.bulkCreateForLead(manager, leadId, items);
  }

  private toMoney(v: number | string) {
    return typeof v === 'number' ? v.toFixed(2) : v;
  }
}
