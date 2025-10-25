import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { LeadsModule } from './leads/leads.module';
import { LeadSimulationsModule } from './lead-simulations/lead-simulations.module';
import { IdempotencyStoreModule } from './idempotency-store/idempotency-store.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RabbitmqModule,
    LeadsModule,
    LeadSimulationsModule,
    IdempotencyStoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
