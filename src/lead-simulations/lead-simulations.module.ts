import { Module } from '@nestjs/common';
import { LeadSimulationsService } from './lead-simulations.service';
import { IdempotencyStoreModule } from '../idempotency-store/idempotency-store.module';

@Module({
  imports: [IdempotencyStoreModule],
  providers: [LeadSimulationsService],
  exports: [LeadSimulationsService],
})
export class LeadSimulationsModule {}
