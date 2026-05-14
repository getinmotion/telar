import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'id_type_user', schema: 'taxonomy' })
export class IdTypeUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 4, unique: true, name: 'id_type_value' })
  idTypeValue: string;

  @Column({ type: 'text', name: 'type_name' })
  typeName: string;

  @Column({ type: 'uuid', name: 'countries_id' })
  countriesId: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'NOW()',
  })
  updatedAt: Date;

  // Note: Relationship with Country entity can be added when Country entity is available
  // @ManyToOne(() => Country, (country) => country.idTypes)
  // @JoinColumn({ name: 'countries_id' })
  // country: Country;
}
