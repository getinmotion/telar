import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserProfile } from 'src/resources/user-profiles/entities/user-profile.entity';
import { ArtisanProfileHistoryTimeline } from './artisan-profile-history-timeline.entity';

@Entity({ name: 'artisan_profile_history', schema: 'artesanos' })
export class ArtisanProfileHistory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'artisan_id' })
  artisanId: string;

  @ManyToOne(() => UserProfile, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artisan_id' })
  artisan: UserProfile;

  @Column({ type: 'varchar', length: 200, name: 'shop_name' })
  shopName: string;

  @Column({ type: 'varchar', length: 100, name: 'craft_type' })
  craftType: string;

  @Column({ type: 'varchar', length: 100 })
  region: string;

  @Column({ type: 'text', name: 'hero_title' })
  heroTitle: string;

  @Column({ type: 'text', name: 'hero_subtitle' })
  heroSubtitle: string;

  @Column({ type: 'text' })
  claim: string;

  @Column({ type: 'text', name: 'origin_story' })
  originStory: string;

  @Column({ type: 'text', name: 'cultural_story' })
  culturalStory: string;

  @Column({ type: 'text', name: 'craft_story' })
  craftStory: string;

  @Column({ type: 'text', name: 'workshop_story' })
  workshopStory: string;

  @Column({ type: 'text', name: 'artisan_quote' })
  artisanQuote: string;

  @Column({ type: 'text', name: 'closing_message' })
  closingMessage: string;

  @OneToMany(() => ArtisanProfileHistoryTimeline, (t) => t.history, {
    cascade: true,
  })
  timeline: ArtisanProfileHistoryTimeline[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', default: () => 'NOW()' })
  updatedAt: Date;
}
