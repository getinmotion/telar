import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum HerramientaStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity({ name: 'herramientas', schema: 'taxonomy' })
export class Herramienta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: HerramientaStatus.APPROVED,
  })
  status: HerramientaStatus;

  @Column({ type: 'uuid', nullable: true, name: 'suggested_by' })
  suggestedBy: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', default: () => 'NOW()' })
  updatedAt: Date;
}
