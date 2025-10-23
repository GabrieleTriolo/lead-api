import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, In, Repository } from 'typeorm';
import { LeadApplicant } from '../entities/lead-applicant.entity';
import { CreateLeadApplicantDto } from '../dto/create-lead-applicant.dto';
import { UpdateLeadApplicantDto } from '../dto/update-lead-applicant.dto';

@Injectable()
export class LeadApplicantRepository {
  constructor(
    @InjectRepository(LeadApplicant)
    private readonly repo: Repository<LeadApplicant>,
  ) {}

  private toMoney(v: number | string) {
    return typeof v === 'number' ? v.toFixed(2) : v;
  }

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

  async upsertForLeadInTx(
    manager: EntityManager,
    leadId: string,
    items: UpdateLeadApplicantDto[],
  ): Promise<void> {
    const txRepo = manager.getRepository(LeadApplicant);

    for (const item of items) {
      if (item.id) {
        const patch: DeepPartial<LeadApplicant> = {
          type: item.type,
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          birthDate: item.birthDate,
          monthlyIncome:
            item.monthlyIncome !== undefined
              ? this.toMoney(item.monthlyIncome)
              : undefined,
          payFrequency: item.payFrequency,
        };
        await txRepo.update({ id: item.id, leadId }, patch);
      }
    }
  }
}
