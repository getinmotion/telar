import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type TaxonomyAliasType = 'material' | 'craft' | 'technique' | 'style';

@Entity({ name: 'taxonomy_aliases', schema: 'taxonomy' })
export class TaxonomyAlias extends BaseEntity {
  @ApiProperty({ description: 'ID único del alias' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'ID del término canónico (el correcto)' })
  @Column({ type: 'uuid', name: 'canonical_id' })
  canonicalId!: string;

  @ApiProperty({
    description: 'Tipo de taxonomía',
    enum: ['material', 'craft', 'technique', 'style'],
  })
  @Column({ type: 'text', name: 'canonical_type' })
  canonicalType!: TaxonomyAliasType;

  @ApiProperty({ description: 'Nombre alternativo / alias fusionado' })
  @Column({ type: 'text', name: 'alias_name' })
  aliasName!: string;

  @ApiPropertyOptional({ description: 'ID del moderador que creó el alias', nullable: true })
  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy?: string | null;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt!: Date;
}
