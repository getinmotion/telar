import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductCore } from './product-core.entity';

/**
 * PRODUCT_MEDIA - Imágenes y videos del producto
 * Relación 1:N con products_core
 */
@Entity({ schema: 'shop', name: 'product_media' })
export class ProductMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'media_url', type: 'text' })
  mediaUrl: string;

  @Column({ name: 'media_type', type: 'text', default: 'image' })
  mediaType: string; // 'image', 'video'

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  // Relación
  @ManyToOne(() => ProductCore, (product) => product.media)
  @JoinColumn({ name: 'product_id' })
  product: ProductCore;
}
