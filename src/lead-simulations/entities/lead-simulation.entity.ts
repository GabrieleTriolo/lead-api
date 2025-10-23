import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Lead } from '../../leads/entities/lead.entity';

@Entity({ name: 'lead_simulations' })
export class LeadSimulation {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Index('IDX_sim_lead')
  @ManyToOne(() => Lead, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'lead_id', referencedColumnName: 'id' })
  lead!: Lead;

  @Column({ name: 'lead_id', type: 'bigint', unsigned: true })
  leadId!: string;
}
