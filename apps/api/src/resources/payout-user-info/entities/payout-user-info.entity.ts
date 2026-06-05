import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'payout_user_info', schema: 'payments' })
export class PayoutUserInfo extends BaseEntity {
  @ApiProperty({ description: 'ID único del registro' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Nombre principal del payout' })
  @Column({ type: 'text', name: 'name_payout_main' })
  namePayoutMain!: string;

  @ApiProperty({ description: 'ID del usuario' })
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ApiProperty({ description: 'Tipo de cuenta' })
  @Column({ type: 'text', name: 'type_account' })
  typeAccount!: string;

  @ApiProperty({ description: 'Nombre del banco (encriptado)' })
  @Column({ type: 'text', name: 'bank_name' })
  bankName!: string;

  @ApiProperty({ description: 'Número de cuenta (encriptado)' })
  @Column({ type: 'text', name: 'num_account' })
  numAccount!: string;

  @ApiProperty({ description: 'ID del país' })
  @Column({ type: 'uuid', name: 'country_id' })
  countryId!: string;

  @ApiProperty({ description: 'Código de moneda', example: 'USD' })
  @Column({ type: 'varchar', length: 10 })
  currency!: string;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @ApiPropertyOptional({ description: 'ID del usuario que creó el registro' })
  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy!: string | null;

  @ApiPropertyOptional({
    description: 'ID del usuario que actualizó el registro',
  })
  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy!: string | null;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdByUser?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updatedByUser?: User;
}
