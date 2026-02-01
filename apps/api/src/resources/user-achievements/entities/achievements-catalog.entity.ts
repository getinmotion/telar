import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'achievements_catalog', schema: 'artesanos' })
export class AchievementsCatalog extends BaseEntity {
  @ApiProperty({
    description: 'ID único del logro (texto descriptivo)',
    example: 'first_mission',
  })
  @PrimaryColumn({ type: 'text' })
  id: string;

  @ApiProperty({
    description: 'Título del logro',
    example: 'Primera Misión',
  })
  @Column({ type: 'text' })
  title: string;

  @ApiProperty({
    description: 'Descripción del logro',
    example: 'Completaste tu primera misión empresarial',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Icono del logro',
    example: 'star',
    default: 'trophy',
  })
  @Column({ type: 'text', default: 'trophy' })
  icon: string;

  @ApiProperty({
    description: 'Criterios de desbloqueo',
    example: { type: 'missions_completed', count: 1 },
  })
  @Column({ type: 'jsonb', name: 'unlock_criteria', default: '{}' })
  unlockCriteria: object;

  @ApiPropertyOptional({
    description: 'Categoría del logro',
    example: 'missions',
  })
  @Column({ type: 'text', nullable: true })
  category: string | null;

  @ApiPropertyOptional({
    description: 'Nivel del logro',
    example: 'bronze',
    default: 'bronze',
    enum: ['bronze', 'silver', 'gold', 'platinum'],
  })
  @Column({ type: 'text', default: 'bronze' })
  tier: string;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;
}
