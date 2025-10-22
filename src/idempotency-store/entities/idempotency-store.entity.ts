import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LeadSimulation } from '../../lead-simulations/entities/lead-simulation.entity';

@Entity({ name: 'idempotency_store' })
@Unique('UK_idempotency_key', ['idempotencyKey'])
@Unique('UK_idempotency_resource', ['resource'])
export class IdempotencyStoreEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 128 })
  idempotencyKey!: string;

  @Index('IDX_idempotency_expires')
  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt!: Date;

  @Column({ name: 'response_status_code', type: 'int', nullable: true })
  responseStatusCode: number | null;

  @Column({ name: 'response_body_json', type: 'json', nullable: true })
  responseBodyJson: unknown | null;

  @ManyToOne(() => LeadSimulation, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'resource_id', referencedColumnName: 'id' })
  resource: LeadSimulation | null;
}
