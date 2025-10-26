import { IdempotencyStoreService } from './idempotency-store.service';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager, MoreThan, Repository } from 'typeorm';
import { IdempotencyStoreEntity } from './entities/idempotency-store.entity';
import { LeadSimulation } from '../lead-simulations/entities/lead-simulation.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

function buildStoreRow(partial: Partial<IdempotencyStoreEntity>): IdempotencyStoreEntity {
  return {
    id: 1,
    idempotencyKey: '',
    expiresAt: new Date(),
    resource: { id: '1', leadId: 'L' } as LeadSimulation,
    responseBodyJson: undefined,
    ...partial,
  } as IdempotencyStoreEntity;
}

describe('IdempotencyStoreService', () => {
  let service: IdempotencyStoreService;

  const now = new Date('2025-01-01T00:00:00.000Z');

  const makeManager = (repoImpl: Partial<Repository<IdempotencyStoreEntity>>) => {
    return {
      getRepository: jest.fn().mockImplementation(() => {
        return repoImpl
      }),
    } as Partial<EntityManager> as EntityManager;
  };

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(now);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdempotencyStoreService,
        { provide: getRepositoryToken(IdempotencyStoreEntity), useValue: {} },
      ],
    }).compile();

    service = module.get<IdempotencyStoreService>(IdempotencyStoreService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('returns cached response when a valid non-expired row exists', async () => {
    // Arrange
    const key = 'k1';
    const ttl = 60000;
    const cached = { foo: 'bar', expiresAt: now.toISOString(), idempotencyKey: key, simulationId: '1' } as any;
    const repo: Partial<Repository<IdempotencyStoreEntity>> = {
      findOne: jest.fn().mockResolvedValue(
        buildStoreRow({ idempotencyKey: key, expiresAt: new Date(now.getTime() + ttl), responseBodyJson: cached }),
      ),
    };
    const manager = makeManager(repo);

    // Act
    const result = await service.runOrGetResource(manager, key, ttl, async () => ({ id: 'sim-x' } as any));

    // Assert
    expect(result).toEqual({ ...cached, cached: true });
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { idempotencyKey: key, expiresAt: MoreThan(now) },
      relations: ['resource'],
      lock: undefined,
    });
  });

  it('creates resource and saves response when cache is missing', async () => {
    // Arrange
    const key = 'k2';
    const ttl = 60000;
    const repo: Partial<Repository<IdempotencyStoreEntity>> = {
      findOne: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockImplementation((data: any) => data),
      save: jest.fn().mockImplementation(async (row: any) => row),
    };
    const manager = makeManager(repo);

    // Act
    const result = await service.runOrGetResource(
      manager,
      key,
      ttl,
      async () => ({ id: '42', leadId: 'L-1' } as LeadSimulation),
    );

    // Assert
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result.cached).toBe(false);
    expect(result.idempotencyKey).toBe(key);
    expect(result.simulationId).toBe('42');
    expect(new Date(result.expiresAt).getTime()).toBe(now.getTime() + ttl);
  });

  it('handles race: save throws, then returns cached from a concurrent insert', async () => {
    // Arrange
    const key = 'k3';
    const ttl = 60000;
    const cached = { idempotencyKey: key, expiresAt: now.toISOString(), simulationId: '97' } as any;
    const repo: any = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(buildStoreRow({ idempotencyKey: key, expiresAt: new Date(now.getTime() + ttl), responseBodyJson: cached })),
      create: jest.fn().mockImplementation((d: any) => d),
      save: jest.fn().mockRejectedValue(new Error('duplicate key')),
    };
    const manager = makeManager(repo);

    // Act
    const result = await service.runOrGetResource(manager, key, ttl, async () => ({ id: 'x' } as any));

    // Assert
    expect(repo.save).toHaveBeenCalled();
    expect(repo.findOne).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ...cached, cached: true });
  });

  it('falls back to built response when race occurs and still no cached row', async () => {
    const key = 'k4';
    const ttl = 60000;
    const repo: any = {
      findOne: jest.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined),
      create: jest.fn().mockImplementation((d: any) => d),
      save: jest.fn().mockRejectedValue(new Error('duplicate key')),
    };
    const manager = makeManager(repo);

    const result = await service.runOrGetResource(manager, key, ttl, async () => ({ id: '55' } as any));

    expect(repo.findOne).toHaveBeenCalledTimes(2);
    expect(result.cached).toBe(false);
    expect(result.idempotencyKey).toBe(key);
    expect(result.simulationId).toBe('55');
  });
});
