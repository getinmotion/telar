import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductCore } from './product-core.entity';

/**
 * PRODUCT_BADGES - Badges asignados al producto
 * Relación N:M con taxonomy.badges
 */
@Entity({ schema: 'shop', name: 'product_badges' })
export class ProductBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'badge_id', type: 'uuid' })
  badgeId: string;

  @Column({ name: 'awarded_at', type: 'timestamptz', default: () => 'now()' })
  awardedAt: Date;

  @Column({ name: 'awarded_by', type: 'uuid', nullable: true })
  awardedBy: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ name: 'valid_until', type: 'timestamptz', nullable: true })
  validUntil: Date;

  // Relación
  @ManyToOne(() => ProductCore, (product) => product.badges)
  @JoinColumn({ name: 'product_id' })
  product: ProductCore;
}
