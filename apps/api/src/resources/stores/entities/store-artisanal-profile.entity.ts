import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Store } from './store.entity';

@Entity({ schema: 'store', name: 'store_artisanal_profiles' })
export class StoreArtisanalProfile {
  @PrimaryGeneratedColumn('uuid', { name: 'store_id' })
  storeId: string;

  @Column({ name: 'primary_craft_id', type: 'uuid', nullable: true })
  primaryCraftId: string;

  @Column({ name: 'is_collaboration_studio', type: 'boolean', default: false })
  isCollaborationStudio: boolean;

  // Relación
  @OneToOne(() => Store, (store) => store.artisanalProfile)
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
