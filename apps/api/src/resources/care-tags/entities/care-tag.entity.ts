import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'care_tags', schema: 'taxonomy' })
export class CareTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ type: 'text', nullable: true, name: 'icon_url' })
  iconUrl: string | null;

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
