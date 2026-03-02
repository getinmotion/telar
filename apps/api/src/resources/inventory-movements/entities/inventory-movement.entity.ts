import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Enum para tipos de movimiento de inventario
 */
export enum MovementType {
  IN = 'IN',         // Entrada de inventario (compras, devoluciones de clientes)
  OUT = 'OUT',       // Salida de inventario (ventas, devoluciones a proveedores)
  ADJUST = 'ADJUST', // Ajuste manual (correcciones, pérdidas, daños)
}

/**
 * Entidad InventoryMovement
 *
 * Representa movimientos de inventario para variantes de productos.
 * Cada movimiento registra cambios en el stock con su razón y referencia.
 */
@Entity({ name: 'inventory_movements', schema: 'public' })
@Check(
  'inventory_movements_type_check',
  "type = ANY (ARRAY['IN'::text, 'OUT'::text, 'ADJUST'::text])",
)
export class InventoryMovement {
  @ApiProperty({
    description: 'ID único del movimiento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID de la variante de producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'product_variant_id' })
  @Index('idx_inventory_movements_variant_id')
  productVariantId: string;

  @ApiProperty({
    description: 'Tipo de movimiento',
    enum: MovementType,
    example: MovementType.IN,
  })
  @Column({ type: 'text' })
  @Index('idx_inventory_movements_type')
  type: MovementType;

  @ApiProperty({
    description: 'Cantidad del movimiento (siempre positivo, el tipo indica dirección)',
    example: 10,
  })
  @Column({ type: 'integer' })
  qty: number;

  @ApiPropertyOptional({
    description: 'Razón del movimiento',
    example: 'Compra de inventario',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  reason?: string | null;

  @ApiPropertyOptional({
    description: 'ID de referencia (order_id, return_id, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  @Column({ type: 'uuid', name: 'ref_id', nullable: true })
  refId?: string | null;

  @ApiPropertyOptional({
    description: 'ID del usuario que creó el movimiento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy?: string | null;

  @ApiProperty({
    description: 'Fecha de creación del movimiento',
    example: '2024-01-01T00:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  @Index('idx_inventory_movements_created_at')
  createdAt: Date;

  // ========== Relaciones ==========

  @ApiPropertyOptional({
    description: 'Variante de producto asociada',
    type: () => ProductVariant,
  })
  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant?: ProductVariant;

  @ApiPropertyOptional({
    description: 'Usuario que creó el movimiento',
    type: () => User,
  })
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: User | null;
}
