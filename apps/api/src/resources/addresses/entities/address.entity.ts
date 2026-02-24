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
import { ApiProperty } from '@nestjs/swagger';
import { UserProfile } from '../../user-profiles/entities/user-profile.entity';

@Entity({ name: 'addresses', schema: 'shop' })
export class Address extends BaseEntity {
  @ApiProperty({ description: 'ID único de la dirección' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ApiProperty({
    description: 'Etiqueta de la dirección',
    example: 'Casa',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  label!: string;

  @ApiProperty({
    description: 'Dirección de la calle',
    example: 'Calle 123 #45-67',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255, name: 'street_address' })
  streetAddress!: string;

  @ApiProperty({
    description: 'Ciudad',
    example: 'Bogotá',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @ApiProperty({
    description: 'Departamento o estado',
    example: 'Cundinamarca',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  state!: string;

  @ApiProperty({
    description: 'Código postal',
    example: '110111',
    maxLength: 20,
  })
  @Column({ type: 'varchar', length: 20, name: 'postal_code' })
  postalCode!: string;

  @ApiProperty({
    description: 'País',
    example: 'Colombia',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  country!: string;

  @ApiProperty({
    description: 'Indica si es la dirección por defecto',
    example: true,
  })
  @Column({ type: 'boolean', name: 'is_default', default: false })
  isDefault!: boolean;

  @ApiProperty({
    description: 'Código DANE de la ubicación',
    example: '11001',
    required: false,
    nullable: true,
    maxLength: 20,
  })
  @Column({ type: 'varchar', length: 20, name: 'dane_code', nullable: true })
  daneCode?: string | null;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  // Relación N:1 con UserProfile (muchas direcciones pertenecen a un usuario)
  @ApiProperty({ description: 'Usuario propietario de la dirección' })
  @ManyToOne(() => UserProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserProfile;
}
