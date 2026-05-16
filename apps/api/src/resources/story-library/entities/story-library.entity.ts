import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserProfile } from 'src/resources/user-profiles/entities/user-profile.entity';

export enum StoryType {
  PROCESS = 'process',
  ORIGIN_STORY = 'origin_story',
  TECHNIQUE = 'technique',
  INSPIRATION = 'inspiration',
}

@Entity({ name: 'story_library', schema: 'artesanos' })
export class StoryLibrary extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'artisan_id' })
  artisanId: string;

  @ManyToOne(() => UserProfile, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artisan_id' })
  artisan: UserProfile;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 30, default: StoryType.PROCESS })
  type: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', name: 'is_public', default: false })
  isPublic: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', default: () => 'NOW()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', default: () => 'NOW()' })
  updatedAt: Date;
}
