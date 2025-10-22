import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  Check,
  OneToMany,
} from 'typeorm';
import { LeadApplicant } from '../../lead-applicants/entities/lead-applicant.entity';

@Entity({ name: 'leads' })
@Check(`"requested_loan" > 0`)
@Check(`"home_value" > 0`)
export class Lead {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Index('IDX_leads_phone_number')
  @Column({ name: 'phone_number', type: 'varchar', length: 32 })
  phoneNumber!: string;

  @Column({
    name: 'requested_loan',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  requestedLoan!: number;

  @Column({ name: 'home_value', type: 'decimal', precision: 12, scale: 2 })
  homeValue!: number;

  @Column({ name: 'city', type: 'varchar', length: 128 })
  city!: string;

  @Column({ name: 'crm_id', type: 'bigint', unsigned: true, nullable: true })
  crmId: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @OneToMany(() => LeadApplicant, (la) => la.lead, { cascade: false })
  applicants?: LeadApplicant[];
}
