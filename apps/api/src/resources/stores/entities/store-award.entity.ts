import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Store } from './store.entity';

@Entity({ schema: 'store', name: 'store_awards' })
export class StoreAward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id', type: 'uuid' })
  storeId: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ type: 'text', nullable: true })
  issuer: string;

  // Relación
  @ManyToOne(() => Store, (store) => store.awards)
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
