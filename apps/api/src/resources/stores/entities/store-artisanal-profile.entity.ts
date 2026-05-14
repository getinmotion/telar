import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Store } from './store.entity';

@Entity({ schema: 'store', name: 'store_artisanal_profiles' })
export class StoreArtisanalProfile {
  @PrimaryColumn({ type: 'uuid', name: 'store_id' })
  storeId: string;

  @Column({ name: 'primary_craft_id', type: 'uuid', nullable: true })
  primaryCraftId: string;

  @Column({ name: 'is_collaboration_studio', type: 'boolean', default: false })
  isCollaborationStudio: boolean;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  // Relación
  @OneToOne(() => Store, (store) => store.artisanalProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
