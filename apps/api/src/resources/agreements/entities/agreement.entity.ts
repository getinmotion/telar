import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'agreements', schema: 'taxonomy' })
export class Agreement extends BaseEntity {
  @ApiProperty({ description: 'ID único del acuerdo' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Nombre del acuerdo' })
  @Column({ type: 'text', nullable: false })
  name!: string;

  @ApiPropertyOptional({ description: 'ID de permiso en MongoDB' })
  @Column({ type: 'text', nullable: true, name: 'permission_mongo_id' })
  permissionMongoId: string | null;

  @ApiProperty({
    description: 'Indica si la validación está habilitada',
    default: true,
  })
  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'is_enable_validate',
  })
  isEnableValidate!: boolean;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
  })
  updatedAt!: Date;
}
