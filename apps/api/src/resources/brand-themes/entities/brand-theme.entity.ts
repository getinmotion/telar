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
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'brand_themes', schema: 'public' })
export class BrandTheme extends BaseEntity {
  @ApiProperty({ description: 'ID único del tema' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiPropertyOptional({
    description: 'ID del usuario propietario del tema',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string | null;

  @ApiProperty({
    description: 'Identificador único del tema',
    example: 'theme-ocean-blue-2024',
  })
  @Column({ type: 'text', name: 'theme_id', unique: true })
  themeId: string;

  @ApiPropertyOptional({
    description: 'Versión del tema',
    example: 1,
    default: 1,
  })
  @Column({ type: 'integer', nullable: true, default: 1 })
  version: number | null;

  @ApiPropertyOptional({
    description: 'Indica si el tema está activo',
    default: true,
  })
  @Column({ type: 'boolean', name: 'is_active', nullable: true, default: true })
  isActive: boolean | null;

  @ApiProperty({
    description: 'Paleta de colores del tema en formato JSON',
    example: {
      primary: '#007BFF',
      secondary: '#6C757D',
      accent: '#FFC107',
    },
  })
  @Column({ type: 'jsonb' })
  palette: object;

  @ApiPropertyOptional({
    description: 'Contexto de estilos del tema',
    example: {
      typography: 'Roboto',
      borderRadius: '8px',
    },
  })
  @Column({ type: 'jsonb', name: 'style_context', nullable: true })
  styleContext: object | null;

  @ApiPropertyOptional({
    description: 'Reglas de uso del tema',
    example: {
      allowCustomization: true,
      restrictedColors: [],
    },
  })
  @Column({ type: 'jsonb', name: 'usage_rules', nullable: true })
  usageRules: object | null;

  @ApiPropertyOptional({
    description: 'Descripción para previsualización',
    example: 'Tema moderno con colores oceánicos',
  })
  @Column({ type: 'text', name: 'preview_description', nullable: true })
  previewDescription: string | null;

  @ApiProperty({ description: 'Fecha de creación del tema' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  // Relación N:1 con User (muchos temas pueden pertenecer a un usuario)
  @ApiPropertyOptional({ description: 'Usuario propietario del tema' })
  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}
