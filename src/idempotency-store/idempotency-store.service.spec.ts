import { IdempotencyStoreService } from './idempotency-store.service';
import { Test, TestingModule } from '@nestjs/testing';

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
