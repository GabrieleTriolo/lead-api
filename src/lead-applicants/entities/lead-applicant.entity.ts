import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Lead } from '../../leads/entities/lead.entity';
import { PayFrequencyEnum } from '../../common/enums/pay-frequency.enum';

@Entity({ name: 'lead_applicants' })
export class LeadApplicant {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @ManyToOne(() => Lead, (lead: Lead) => lead.applicants, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'lead_id' })
  lead!: Lead;

  @Column({ name: 'lead_id', type: 'bigint', unsigned: true })
  leadId!: string;

  @Index()
  @Column({ type: 'enum', enum: ['first', 'second'] })
  type!: 'first' | 'second';

  @Column({ name: 'first_name', type: 'varchar', length: 128 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 128 })
  lastName!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate!: string;

  @Column({ name: 'monthly_income', type: 'decimal', precision: 12, scale: 2 })
  monthlyIncome!: string;

  @Column({ name: 'pay_frequency', type: 'tinyint' })
  payFrequency!: PayFrequencyEnum;
}
