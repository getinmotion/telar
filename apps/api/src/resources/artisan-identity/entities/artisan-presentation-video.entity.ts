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

@Entity({ name: 'artisan_presentation_video', schema: 'artesanos' })
export class ArtisanPresentationVideo extends BaseEntity {
  @ApiProperty({ description: 'ID de la identidad artesanal (FK y PK)' })
  @PrimaryColumn({ type: 'uuid', name: 'artisan_identity_id' })
  artisanIdentityId: string;

  @ApiPropertyOptional({ description: 'Identidad artesanal asociada' })
  @OneToOne(() => ArtisanIdentity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artisan_identity_id' })
  artisanIdentity: ArtisanIdentity;

  @ApiPropertyOptional({ description: 'URL del video de presentación' })
  @Column({ type: 'text', nullable: true, name: 'url' })
  url: string | null;

  @ApiPropertyOptional({ description: 'Proveedor del video (youtube, vimeo, cloudinary, etc.)' })
  @Column({ type: 'text', nullable: true, name: 'provider' })
  provider: string | null;

  @ApiPropertyOptional({ description: 'URL de la miniatura del video' })
  @Column({ type: 'text', nullable: true, name: 'thumbnail_url' })
  thumbnailUrl: string | null;

  @ApiPropertyOptional({ description: 'Duración del video en segundos' })
  @Column({ type: 'int', nullable: true, name: 'duration_seconds' })
  durationSeconds: number | null;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ type: 'timestamp', name: 'created_at', default: () => 'NOW()' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del registro' })
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', default: () => 'NOW()' })
  updatedAt: Date;
}
