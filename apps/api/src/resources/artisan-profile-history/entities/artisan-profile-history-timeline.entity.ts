import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ArtisanProfileHistory } from './artisan-profile-history.entity';

@Entity({ name: 'artisan_profile_history_timeline', schema: 'artesanos' })
export class ArtisanProfileHistoryTimeline extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'history_id' })
  historyId: string;

  @ManyToOne(() => ArtisanProfileHistory, (h) => h.timeline, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'history_id' })
  history: ArtisanProfileHistory;

  @Column({ type: 'varchar', length: 50 })
  year: string;

  @Column({ type: 'text' })
  event: string;

  @Column({ type: 'integer', name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', default: () => 'NOW()' })
  createdAt: Date;
}
