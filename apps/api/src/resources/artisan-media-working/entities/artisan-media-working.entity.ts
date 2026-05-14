import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserProfile } from 'src/resources/user-profiles/entities/user-profile.entity';

@Entity({ name: 'artisan_media_working', schema: 'artesanos' })
export class ArtisanMediaWorking extends BaseEntity {
  @ApiProperty({ description: 'ID único del medio de trabajo' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del artesano',
    type: String,
  })
  @Column({ type: 'uuid', nullable: false, name: 'artisan_id' })
  artisanId: string;

  @ApiProperty({ description: 'Relación con el perfil del artesano' })
  @ManyToOne(() => UserProfile, { nullable: false })
  @JoinColumn({ name: 'artisan_id' })
  artisan: UserProfile;

  @ApiProperty({
    description: 'URL del medio (foto/video)',
    type: String,
  })
  @Column({ type: 'text', nullable: false, name: 'media_url' })
  mediaUrl: string;

  @ApiPropertyOptional({
    description: 'Tipo de medio (image, video, etc.)',
    type: String,
  })
  @Column({ type: 'text', nullable: true, name: 'media_type' })
  mediaType: string | null;

  @ApiPropertyOptional({
    description: 'Indica si es el medio principal',
    default: true,
  })
  @Column({ type: 'boolean', nullable: false, default: true, name: 'is_primary' })
  isPrimary: boolean;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del registro' })
  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'NOW()',
  })
  updatedAt: Date;
}
