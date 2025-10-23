import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { Lead } from '../entities/lead.entity';

@Injectable()
export class LeadRepository {
  constructor(
    @InjectRepository(Lead) private readonly repo: Repository<Lead>,
  ) {}

  findByPhone(phoneNumber: string) {
    return this.repo.findOne({
      where: { phoneNumber },
      relations: ['applicants'],
    });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['applicants'] });
  }

  createLead(data: Partial<Lead>): Promise<Lead> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async updateLead(id: string, patch: Partial<Lead>) {
    await this.repo.update({ id }, patch);
    return this.findById(id);
  }

  async createLeadInTx(
    manager: EntityManager,
    data: Partial<Lead>,
  ): Promise<Lead> {
    const txRepo = manager.getRepository(Lead);
    const entity = txRepo.create(data as DeepPartial<Lead>);
    return txRepo.save(entity);
  }

  async updateLeadInTx(
    manager: EntityManager,
    id: string,
    patch: Partial<Lead>,
  ) {
    const txRepo = manager.getRepository(Lead);
    await txRepo.update({ id }, patch as DeepPartial<Lead>);
    return this.findByIdInTx(manager, id);
  }

  findByIdInTx(manager: EntityManager, id: string) {
    return manager
      .getRepository(Lead)
      .findOne({ where: { id }, relations: ['applicants'] });
  }
}
