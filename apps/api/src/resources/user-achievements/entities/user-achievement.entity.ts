import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'user_achievements', schema: 'public' })
@Unique(['userId', 'achievementId'])
export class UserAchievement extends BaseEntity {
  @ApiProperty({ description: 'ID único del logro de usuario' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ApiProperty({
    description: 'ID del logro/achievement',
    example: 'first_product_created',
  })
  @Column({ type: 'text', name: 'achievement_id' })
  achievementId: string;

  @ApiProperty({
    description: 'Título del logro',
    example: 'Primer Producto Creado',
  })
  @Column({ type: 'text' })
  title: string;

  @ApiProperty({
    description: 'Descripción del logro',
    example: 'Has creado tu primer producto en la plataforma',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Icono del logro',
    example: 'trophy',
    default: 'trophy',
  })
  @Column({ type: 'text', default: 'trophy' })
  icon: string;

  @ApiPropertyOptional({
    description: 'Fecha y hora en que se desbloqueó el logro',
    example: '2026-01-27T15:30:00.000Z',
  })
  @Column({
    type: 'timestamp with time zone',
    name: 'unlocked_at',
    nullable: true,
    default: () => 'NOW()',
  })
  unlockedAt: Date | null;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Fecha de eliminación (soft delete)' })
  @DeleteDateColumn({
    type: 'timestamp with time zone',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt: Date | null;

  // Relación N:1 con User (muchos logros pertenecen a un usuario)
  @ApiProperty({ description: 'Usuario que obtuvo el logro' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
