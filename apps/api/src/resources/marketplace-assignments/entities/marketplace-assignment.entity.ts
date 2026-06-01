import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type MarketplaceKey = 'premium' | 'regional' | 'sponsor' | 'hotel' | 'design';

@Entity({ name: 'marketplace_assignments', schema: 'marketplace' })
export class MarketplaceAssignment extends BaseEntity {
  @ApiProperty({ description: 'ID único de la asignación' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'ID del producto asignado' })
  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @ApiProperty({
    description: 'Marketplace destino',
    enum: ['premium', 'regional', 'sponsor', 'hotel', 'design'],
  })
  @Column({ type: 'text', name: 'marketplace_key' })
  marketplaceKey!: MarketplaceKey;

  @ApiPropertyOptional({ description: 'ID del curador que asignó', nullable: true })
  @Column({ type: 'uuid', name: 'assigned_by', nullable: true })
  assignedBy?: string | null;

  @ApiProperty({ description: 'Fecha de asignación' })
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'assigned_at',
  })
  assignedAt!: Date;

  @ApiPropertyOptional({ description: 'Fecha de remoción', nullable: true })
  @Column({ type: 'timestamp with time zone', name: 'removed_at', nullable: true })
  removedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Razón de remoción', nullable: true })
  @Column({ type: 'text', name: 'removal_reason', nullable: true })
  removalReason?: string | null;
}
