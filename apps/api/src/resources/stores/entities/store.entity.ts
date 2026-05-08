import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { StoreArtisanalProfile } from './store-artisanal-profile.entity';
import { StoreContacts } from './store-contacts.entity';
import { StoreAward } from './store-award.entity';
import { StoreBadge } from './store-badge.entity';
import { ArtisanShop } from './artisan-shop.entity';

@Entity({ schema: 'store', name: 'stores' })
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  story: string;

  @Column({ name: 'legacy_id', type: 'uuid', nullable: true })
  legacyId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  // Relaciones
  @OneToOne(() => StoreArtisanalProfile, (profile) => profile.store, {
    cascade: true,
  })
  artisanalProfile: StoreArtisanalProfile;

  @OneToOne(() => StoreContacts, (contacts) => contacts.store, {
    cascade: true,
  })
  contacts: StoreContacts;

  @OneToMany(() => StoreAward, (award) => award.store, { cascade: true })
  awards: StoreAward[];

  @OneToMany(() => StoreBadge, (badge) => badge.store, { cascade: true })
  badges: StoreBadge[];

  // Relación virtual con legacy (no es FK en BD, se resuelve en service)
  legacyShop?: ArtisanShop;
}
