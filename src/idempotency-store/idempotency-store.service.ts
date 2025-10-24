import { Injectable } from '@nestjs/common';
import { Repository, MoreThan, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IdempotencyStoreEntity } from './entities/idempotency-store.entity';

@Injectable()
export class IdempotencyStoreService {
  constructor(
    @InjectRepository(IdempotencyStoreEntity)
    private readonly repo: Repository<IdempotencyStoreEntity>,
  ) {}

  async runOrGetResource<TResource extends { id: string }>(
    manager: EntityManager,
    key: string,
    ttlMs: number,
    createResource: () => Promise<TResource>,
  ): Promise<TResource> {
    const now = new Date();
    const existing = await manager.getRepository(IdempotencyStoreEntity).findOne({
      where: { idempotencyKey: key, expiresAt: MoreThan(now) },
      relations: ['resource'],
      lock: undefined,
    });

    if (existing?.resource) {
      return existing.resource as unknown as TResource;
    }

    const resource = await createResource();
    const expiresAt = new Date(now.getTime() + ttlMs);

    const storeRepo = manager.getRepository(IdempotencyStoreEntity);

    try {
      const row = storeRepo.create({
        idempotencyKey: key,
        expiresAt,
        resource: resource as any,
        responseStatusCode: null,
        responseBodyJson: null,
      });
      await storeRepo.save(row);
      return resource;
    } catch (err) {
      // In case of race, fetch the existing valid record and return its resource if any
      const again = await storeRepo.findOne({
        where: { idempotencyKey: key, expiresAt: MoreThan(now) },
        relations: ['resource'],
      });
      if (again?.resource) {
        return again.resource as unknown as TResource;
      }
      // If still not found, fallback to resource we created
      return resource;
    }
  }
}
