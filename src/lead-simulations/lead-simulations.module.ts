import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadSimulation } from './entities/lead-simulation.entity';
import { LeadSimulationsService } from './lead-simulations.service';

@Module({
  imports: [TypeOrmModule.forFeature([LeadSimulation])],
  providers: [LeadSimulationsService],
  exports: [LeadSimulationsService, TypeOrmModule],
})
export class LeadSimulationsModule {}
