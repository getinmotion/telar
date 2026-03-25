import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Store } from './store.entity';

@Entity({ schema: 'shop', name: 'store_badges' })
export class StoreBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id', type: 'uuid' })
  storeId: string;

  @Column({ name: 'badge_id', type: 'uuid' })
  badgeId: string;

  @Column({ name: 'awarded_at', type: 'timestamptz', default: () => 'now()' })
  awardedAt: Date;

  @Column({ name: 'awarded_by', type: 'uuid', nullable: true })
  awardedBy: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ name: 'valid_until', type: 'timestamptz', nullable: true })
  validUntil: Date;

  // Relación
  @ManyToOne(() => Store, (store) => store.badges)
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
