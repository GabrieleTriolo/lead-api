import { Module } from '@nestjs/common';
import { IdempotencyStoreService } from './idempotency-store.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdempotencyStoreEntity } from './entities/idempotency-store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IdempotencyStoreEntity])],
  providers: [IdempotencyStoreService],
  exports: [IdempotencyStoreService, TypeOrmModule],
})
export class IdempotencyStoreModule {}
