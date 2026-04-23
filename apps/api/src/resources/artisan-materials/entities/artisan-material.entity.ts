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
import { Material } from 'src/resources/materials/entities/material.entity';

@Entity({ name: 'artisan_materials', schema: 'artesanos' })
export class ArtisanMaterial extends BaseEntity {
  @ApiProperty({ description: 'ID único de la relación artesano-material' })
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
    description: 'ID del material',
    type: String,
  })
  @Column({ type: 'uuid', nullable: false, name: 'material_id' })
  materialId: string;

  @ApiProperty({ description: 'Relación con el material' })
  @ManyToOne(() => Material, { nullable: false })
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @ApiPropertyOptional({
    description: 'Indica si es el material primario del artesano',
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
