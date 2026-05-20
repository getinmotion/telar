import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArtisanIdentity } from './artisan-identity.entity';

@Entity({ name: 'artisan_bio_config', schema: 'artesanos' })
export class ArtisanBioConfig extends BaseEntity {
  @ApiProperty({ description: 'ID de la identidad artesanal (FK y PK)' })
  @PrimaryColumn({ type: 'uuid', name: 'artisan_identity_id' })
  artisanIdentityId: string;

  @ApiPropertyOptional({ description: 'Identidad artesanal asociada' })
  @OneToOne(() => ArtisanIdentity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artisan_identity_id' })
  artisanIdentity: ArtisanIdentity;

  @ApiPropertyOptional({ description: 'Mostrar enlace a la tienda en la página bio link' })
  @Column({ type: 'boolean', name: 'show_shop_link', default: true })
  showShopLink: boolean;

  @ApiPropertyOptional({ description: 'Mostrar enlace al perfil en la página bio link' })
  @Column({ type: 'boolean', name: 'show_profile_link', default: true })
  showProfileLink: boolean;

  @ApiPropertyOptional({ description: 'ID del producto destacado en la página bio link' })
  @Column({ type: 'uuid', nullable: true, name: 'featured_product_id' })
  featuredProductId: string | null;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ type: 'timestamp', name: 'created_at', default: () => 'NOW()' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del registro' })
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', default: () => 'NOW()' })
  updatedAt: Date;
}
