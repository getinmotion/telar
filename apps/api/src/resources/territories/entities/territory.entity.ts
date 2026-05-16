import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'territories', schema: 'taxonomy' })
export class Territory extends BaseEntity {
  @ApiProperty({ description: 'ID único del territorio' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Nombre del territorio' })
  @Column({ type: 'text', nullable: false })
  name!: string;

  @ApiProperty({
    description: 'Indica si es un territorio',
    default: true,
  })
  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'is_territory',
  })
  isTerritory!: boolean;

  @ApiPropertyOptional({ description: 'Nombre de la región' })
  @Column({ type: 'text', nullable: true, name: 'region_name' })
  regionName: string | null;

  @ApiPropertyOptional({ description: 'Código SKU del territorio (ej: ANT, GUA)' })
  @Column({ type: 'varchar', length: 5, nullable: true, name: 'sku_code' })
  skuCode: string | null;

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
