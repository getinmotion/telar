import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'product_moderation_history', schema: 'public' })
export class ProductModerationHistory extends BaseEntity {
  @ApiProperty({ description: 'ID único del historial de moderación' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @ApiPropertyOptional({
    description: 'Estado anterior del producto',
    example: 'pending',
    nullable: true,
  })
  @Column({ type: 'text', name: 'previous_status', nullable: true })
  previousStatus?: string | null;

  @ApiProperty({
    description: 'Nuevo estado del producto',
    example: 'approved',
  })
  @Column({ type: 'text', name: 'new_status' })
  newStatus!: string;

  @ApiPropertyOptional({
    description: 'ID del moderador que realizó el cambio',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  @Column({ type: 'uuid', name: 'moderator_id', nullable: true })
  moderatorId?: string | null;

  @ApiPropertyOptional({
    description: 'ID del artesano propietario del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  @Column({ type: 'uuid', name: 'artisan_id', nullable: true })
  artisanId?: string | null;

  @ApiPropertyOptional({
    description: 'Comentario del moderador',
    example: 'Producto aprobado, cumple con todos los requisitos',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @ApiPropertyOptional({
    description: 'Ediciones realizadas en formato JSON',
    example: { title: 'before', description: 'after' },
    nullable: true,
  })
  @Column({ type: 'jsonb', name: 'edits_made', default: {} })
  editsMade!: Record<string, any>;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt!: Date;

  // Relaciones
  @ApiProperty({ description: 'Producto relacionado' })
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
