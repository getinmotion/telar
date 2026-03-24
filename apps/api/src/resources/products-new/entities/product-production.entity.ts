import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ProductCore } from './product-core.entity';

/**
 * PRODUCT_PRODUCTION - Información de producción
 * Disponibilidad, tiempos, capacidad
 */
@Entity({ schema: 'shop', name: 'product_production' })
export class ProductProduction {
  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'availability_type', type: 'varchar' })
  availabilityType: string; // 'en_stock', 'bajo_pedido', 'edicion_limitada'

  @Column({ name: 'production_time_days', type: 'int', nullable: true })
  productionTimeDays: number;

  @Column({ name: 'monthly_capacity', type: 'int', nullable: true })
  monthlyCapacity: number;

  @Column({ name: 'requirements_to_start', type: 'text', nullable: true })
  requirementsToStart: string;

  // Relación
  @OneToOne(() => ProductCore, (product) => product.production)
  @JoinColumn({ name: 'product_id' })
  product: ProductCore;
}
