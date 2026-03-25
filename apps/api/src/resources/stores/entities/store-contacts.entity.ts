import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Store } from './store.entity';

@Entity({ schema: 'shop', name: 'store_contacts' })
export class StoreContacts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id', type: 'uuid', unique: true })
  storeId: string;

  @Column({ type: 'text', nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  whatsapp: string;

  @Column({ name: 'address_line', type: 'text', nullable: true })
  addressLine: string;

  @Column({ type: 'text', nullable: true })
  department: string;

  @Column({ type: 'text', nullable: true })
  municipality: string;

  // Relación
  @OneToOne(() => Store, (store) => store.contacts)
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
