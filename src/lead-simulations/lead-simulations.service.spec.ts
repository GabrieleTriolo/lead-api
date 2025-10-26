import { Test, TestingModule } from '@nestjs/testing';
import { LeadSimulationsService } from './lead-simulations.service';
import { DataSource, EntityManager } from 'typeorm';
import { IdempotencyStoreService } from '../idempotency-store/idempotency-store.service';
import { createHash } from 'crypto';
import { LeadSimulation } from './entities/lead-simulation.entity';

describe('LeadSimulationsService', () => {
  let service: LeadSimulationsService;

  const transactionMock = jest.fn();
  const dataSourceMock: Partial<DataSource> = {
    transaction: transactionMock as any,
  };

  const idempotencyMock: Partial<IdempotencyStoreService> = {
    runOrGetResource: jest.fn(),
  };

  const fakeManager: Partial<EntityManager> = {
    getRepository: jest.fn().mockImplementation(() => ({
      create: (data: any) => ({ id: 'sim-1', ...data }),
      save: async (entity: any) => entity,
    })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadSimulationsService,
        { provide: DataSource, useValue: dataSourceMock },
        { provide: IdempotencyStoreService, useValue: idempotencyMock },
      ],
    }).compile();

    service = module.get<LeadSimulationsService>(LeadSimulationsService);
  });

  it('should call idempotency with a deterministic key and TTL, creating resource through manager', async () => {
    // Arrange
    const leadId = '42';
    const fingerprint = { requestedLoan: 100000, homeValue: 200000, city: ' Roma ' };
    const expectedPayload = ['100000', '200000', 'Roma'].join('|').toLowerCase();
    const hash = createHash('sha256').update(expectedPayload, 'utf8').digest('hex');
    const expectedKey = `lead:${leadId}:sim:${hash}`;
    const expectedTtl = 10 * 60 * 1000;

    const expectedResponse = {
      cached: false,
      idempotencyKey: expectedKey,
      expiresAt: new Date(Date.now() + expectedTtl).toISOString(),
      simulationId: 'sim-1',
      results: { offers: [], bestOfferId: null, note: 'unit-test' },
    };

    (dataSourceMock.transaction as jest.Mock).mockImplementation(async (cb) => cb(fakeManager));
    (idempotencyMock.runOrGetResource as jest.Mock).mockImplementation(
      async (manager: EntityManager, key: string, ttl: number, createResource: () => Promise<LeadSimulation>) => {
        expect(manager).toBe(fakeManager);
        expect(key).toBe(expectedKey);
        expect(ttl).toBe(expectedTtl);
        const resource = await createResource();
        expect(resource).toEqual({ id: 'sim-1', leadId });
        return expectedResponse;
      },
    );

    // Act
    const result = await service.createForLeadWithIdempotency(leadId, fingerprint as any);

    // Assert
    expect(result).toBe(expectedResponse);
    expect(dataSourceMock.transaction).toHaveBeenCalledTimes(1);
    expect(idempotencyMock.runOrGetResource).toHaveBeenCalledTimes(1);
  });
});
