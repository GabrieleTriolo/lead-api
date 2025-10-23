import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadSimulation } from './entities/lead-simulation.entity';

@Injectable()
export class LeadSimulationsService {

  constructor(
    @InjectRepository(LeadSimulation)
    private readonly repo: Repository<LeadSimulation>,
  ) {}

  async createForLead(leadId: string): Promise<LeadSimulation> {
    const entity = this.repo.create({ leadId });
    return this.repo.save(entity);
  }
}
