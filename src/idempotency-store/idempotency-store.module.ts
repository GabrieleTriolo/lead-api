import { Module } from '@nestjs/common';
import { IdempotencyStoreService } from './idempotency-store.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdempotencyStoreEntity } from './entities/idempotency-store.entity';
import { LeadSimulation } from '../lead-simulations/entities/lead-simulation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IdempotencyStoreEntity, LeadSimulation])],
  providers: [IdempotencyStoreService],
  exports: [IdempotencyStoreService, TypeOrmModule],
})
export class IdempotencyStoreModule {}
