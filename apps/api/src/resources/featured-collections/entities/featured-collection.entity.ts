import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MarketplaceKey } from '../../marketplace-assignments/entities/marketplace-assignment.entity';

@Entity({ name: 'featured_collections', schema: 'marketplace' })
export class FeaturedCollection extends BaseEntity {
  @ApiProperty({ description: 'ID único de la colección' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Título editorial de la colección' })
  @Column({ type: 'text' })
  title!: string;

  @ApiPropertyOptional({ description: 'Descripción editorial', nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ApiProperty({
    description: 'Marketplace al que pertenece',
    enum: ['premium', 'regional', 'sponsor', 'hotel', 'design'],
  })
  @Column({ type: 'text', name: 'marketplace_key' })
  marketplaceKey!: MarketplaceKey;

  @ApiProperty({ description: 'Array de IDs de productos curados (orden editorial)' })
  @Column({ type: 'jsonb', name: 'product_ids', default: [] })
  productIds!: string[];

  @ApiProperty({ description: 'Si la colección está activa en el marketplace' })
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Orden de visualización' })
  @Column({ type: 'int', name: 'display_order', default: 0 })
  displayOrder!: number;

  @ApiPropertyOptional({ description: 'ID del curador', nullable: true })
  @Column({ type: 'uuid', name: 'curated_by', nullable: true })
  curatedBy?: string | null;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
