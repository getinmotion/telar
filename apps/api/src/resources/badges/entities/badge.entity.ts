import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BadgeTarget {
  SHOP = 'shop',
  PRODUCT = 'product',
}

export enum BadgeAssignment {
  CURATED = 'curated',
  AUTOMATED = 'automated',
}

@Entity({ name: 'badges', schema: 'taxonomy' })
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  code: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true, name: 'icon_url' })
  iconUrl: string | null;

  @Column({
    type: 'enum',
    enum: BadgeTarget,
    name: 'target_type',
  })
  targetType: BadgeTarget;

  @Column({
    type: 'enum',
    enum: BadgeAssignment,
    name: 'assignment_type',
  })
  assignmentType: BadgeAssignment;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

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
