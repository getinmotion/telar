import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { Craft } from '../../crafts/entities/craft.entity';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity({ name: 'techniques', schema: 'taxonomy' })
export class Technique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Columna legacy — ahora nullable; la relación canónica está en technique_craft_links */
  @Column({ type: 'uuid', name: 'craft_id', nullable: true })
  craftId: string | null;

  @ManyToOne(() => Craft, { nullable: true })
  @JoinColumn({ name: 'craft_id' })
  craft?: Craft;

  @ManyToMany(() => Craft, { eager: false })
  @JoinTable({
    name: 'technique_craft_links',
    schema: 'taxonomy',
    joinColumn: { name: 'technique_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'craft_id', referencedColumnName: 'id' },
  })
  crafts?: Craft[];

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.APPROVED,
  })
  status: ApprovalStatus;

  @Index()
  @Column({ type: 'varchar', length: 5, nullable: true, name: 'sku_code' })
  skuCode: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'suggested_by' })
  suggestedBy: string | null;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
    default: () => 'NOW()',
  })
  updatedAt: Date;
}
