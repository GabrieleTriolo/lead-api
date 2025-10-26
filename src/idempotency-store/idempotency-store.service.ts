import { Injectable } from '@nestjs/common';
import { Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IdempotencyStoreEntity } from './entities/idempotency-store.entity';
import { LeadSimulation } from '../lead-simulations/entities/lead-simulation.entity';
import { SimulationResponse } from '../lead-simulations/interfaces/simulation-response.interface';

@Injectable()
export class IdempotencyStoreService {
  constructor(
    @InjectRepository(IdempotencyStoreEntity)
    private readonly repo: Repository<IdempotencyStoreEntity>,
  ) {}

  async runOrGetResource(
    manager: EntityManager,
    key: string,
    ttlMs: number,
    createResource: () => Promise<LeadSimulation>,
  ): Promise<SimulationResponse> {
    const now = new Date();
    const storeRepo = manager.getRepository(IdempotencyStoreEntity);

    const existing = await storeRepo.findOne({
      where: { idempotencyKey: key },
      relations: ['resource'],
    });

    if (existing && existing.expiresAt > now && existing.responseBodyJson) {
      const cached = existing.responseBodyJson as SimulationResponse;
      return { ...cached, cached: true };
    }

    // Not found or expired: create/update the resource mapping and persist a mock response body
    const resource = await createResource();
    const expiresAt = new Date(now.getTime() + ttlMs);

    const response: SimulationResponse = this.buildMockResponse(
      resource,
      expiresAt,
      false,
    );

    try {
      if (existing) {
        // Update the existing row
        existing.expiresAt = expiresAt;
        existing.resource = resource;
        existing.responseBodyJson = response;
        await storeRepo.save(existing);
      } else {
        const row = storeRepo.create({
          idempotencyKey: key,
          expiresAt,
          resource,
          responseBodyJson: response,
        });
        await storeRepo.save(row);
      }
      return response;
    } catch (err) {
      // In case of race, fetch the existing record and return its JSON response if any and still valid
      const again = await storeRepo.findOne({
        where: { idempotencyKey: key },
        relations: ['resource'],
      });
      if (again && again.expiresAt > now && again.responseBodyJson) {
        const cached = again.responseBodyJson as SimulationResponse;
        return { ...cached, cached: true };
      }
      // If still not found, fallback to the response we built
      return response;
    }
  }

  private buildMockResponse(
    resource: LeadSimulation,
    expiresAt: Date,
    cached: boolean,
  ): SimulationResponse {
    return {
      cached,
      expiresAt: expiresAt.toISOString(),
      simulationId: String(resource.id),
      results: {
        offers: [
          {
            id: 'offer-1',
            bank: 'Banca Alpha',
            product: 'fisso',
            tan: 3.2,
            taeg: 3.4,
            ltv: 70,
            monthlyPayment: 550,
            upfrontFees: 1200,
            durationYears: 20,
          },
          {
            id: 'offer-2',
            bank: 'Banca Beta',
            product: 'variabile',
            tan: 2.8,
            taeg: 3.1,
            ltv: 75,
            monthlyPayment: 520,
            upfrontFees: 900,
            durationYears: 25,
          },
        ],
        bestOfferId: 'offer-2',
        note: 'Mocked response for demo/cache behavior',
      },
    };
  }
}
