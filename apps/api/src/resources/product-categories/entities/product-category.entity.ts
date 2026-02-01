import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'product_categories', schema: 'shop' })
export class ProductCategory extends BaseEntity {
  @ApiProperty({ description: 'ID único de la categoría' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Cerámica',
  })
  @Column({ type: 'text' })
  name: string;

  @ApiProperty({
    description: 'Slug único de la categoría (URL amigable)',
    example: 'ceramica',
  })
  @Column({ type: 'text', unique: true })
  slug: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Productos de cerámica artesanal hechos a mano',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    description: 'ID de la categoría padre (para jerarquía)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  parentId: string | null;

  @ApiPropertyOptional({
    description: 'Orden de visualización',
    example: 1,
    default: 0,
  })
  @Column({ type: 'integer', name: 'display_order', nullable: true, default: 0 })
  displayOrder: number | null;

  @ApiProperty({
    description: 'Indica si la categoría está activa',
    default: true,
  })
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'URL de imagen de la categoría',
    example: 'https://example.com/category-image.jpg',
  })
  @Column({ type: 'text', name: 'image_url', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  // Relación self-referencial: Categoría padre (N:1)
  @ApiPropertyOptional({ description: 'Categoría padre' })
  @ManyToOne(() => ProductCategory, (category) => category.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: ProductCategory | null;

  // Relación self-referencial: Subcategorías (1:N)
  @ApiPropertyOptional({
    description: 'Subcategorías hijas',
    type: () => [ProductCategory],
  })
  @OneToMany(() => ProductCategory, (category) => category.parent)
  children: ProductCategory[];

  // Relación 1:N con Product (una categoría tiene muchos productos)
  @ApiPropertyOptional({
    description: 'Productos de esta categoría',
    type: () => [Product],
  })
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
