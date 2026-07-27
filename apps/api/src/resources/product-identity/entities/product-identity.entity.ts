import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCore } from '../../products-new/entities/product-core.entity';
import { PassportUser } from '../../passport-user/entities/passport-user.entity';

@Entity({ name: 'product_identity', schema: 'digital_identity' })
export class ProductIdentity extends BaseEntity {
  @ApiProperty({
    description: 'ID único de la identidad del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description:
      'Clave única generada para identificar el producto (usada en QR)',
    example: 'TELAR-CERT-2026-ABC123XYZ',
  })
  @Column({ type: 'varchar', length: 255, unique: true, name: 'identity_key' })
  identityKey: string;

  @ApiProperty({
    description: 'ID del producto core',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @ApiProperty({
    description: 'ID de la tienda',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string;

  @ApiProperty({
    description: 'ID del perfil del artesano',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'artisan_id' })
  artisanId: string;

  @ApiProperty({
    description: 'Indica si la identidad está activa',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2026-01-26T10:30:00Z',
  })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2026-01-26T10:30:00Z',
  })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  // ==========================================
  // RELACIONES
  // ==========================================

  @ApiPropertyOptional({
    description: 'Información del producto relacionado',
    type: () => ProductCore,
  })
  @ManyToOne(() => ProductCore, { eager: false })
  @JoinColumn({ name: 'product_id' })
  product?: ProductCore;

  @ApiPropertyOptional({
    description: 'Relaciones con usuarios compradores (tabla pivot)',
    type: () => PassportUser,
    isArray: true,
  })
  @OneToMany(() => PassportUser, (passportUser) => passportUser.productIdentity)
  passportUsers?: PassportUser[];
}
