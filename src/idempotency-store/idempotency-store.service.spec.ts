import { Test, TestingModule } from '@nestjs/testing';
import { IdempotencyStoreService } from './idempotency-store.service';

describe('IdempotencyStoreService', () => {
  let service: IdempotencyStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdempotencyStoreService],
    }).compile();

    service = module.get<IdempotencyStoreService>(IdempotencyStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
