import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LeadSimulation } from './entities/lead-simulation.entity';
import { IdempotencyStoreService } from '../idempotency-store/idempotency-store.service';
import { createHash } from 'crypto';
import { LeadSimulationFingerprint } from './interfaces/lead-simulation-fingerprint.interface';

@Injectable()
export class LeadSimulationsService {
  private static readonly TEN_MINUTES_MS = 10 * 60 * 1000;

  constructor(
    private readonly dataSource: DataSource,
    private readonly idempotency: IdempotencyStoreService,
  ) {}

  async createForLeadWithIdempotency(
    leadId: string,
    fingerprint: LeadSimulationFingerprint,
  ): Promise<LeadSimulation> {
    const key = this.buildKey(leadId, fingerprint);

    return this.dataSource.transaction(async (manager) => {
      return this.idempotency.runOrGetResource<LeadSimulation>(
        manager,
        key,
        LeadSimulationsService.TEN_MINUTES_MS,
        async () => {
          const entity = manager.getRepository(LeadSimulation).create({ leadId });
          return manager.getRepository(LeadSimulation).save(entity);
        },
      );
    });
  }

  private serializeFingerprintLower(fp: LeadSimulationFingerprint): string {
    return [
      String(fp.requestedLoan),
      String(fp.homeValue),
      (fp.city ?? '').trim(),
    ].join('|').toLowerCase();
  }

  private buildKey(leadId: string, fp: LeadSimulationFingerprint): string {
    const payload = this.serializeFingerprintLower(fp);
    const hash = createHash('sha256').update(payload, 'utf8').digest('hex');
    return `lead:${leadId}:sim:${hash}`;
  }
}
