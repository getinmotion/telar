import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserProfile } from 'src/resources/user-profiles/entities/user-profile.entity';

@Entity({ name: 'user_progress', schema: 'artesanos' })
export class UserProgress extends BaseEntity {
  @ApiProperty({ description: 'ID único del progreso del usuario' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del usuario (relación 1 a 1 con user_profiles)',
  })
  @Column({ type: 'uuid', unique: true, name: 'user_id' })
  userId: string;

  @ApiProperty({ description: 'Relación con el perfil de usuario' })
  @OneToOne(() => UserProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  userProfile: UserProfile;

  @ApiProperty({ description: 'Nivel actual del usuario', default: 1 })
  @Column({ type: 'integer', nullable: false, default: 1 })
  level: number;

  @ApiProperty({
    description: 'Puntos de experiencia actuales',
    default: 0,
  })
  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
    name: 'experience_points',
  })
  experiencePoints: number;

  @ApiProperty({
    description: 'Puntos de experiencia necesarios para el próximo nivel',
    default: 100,
  })
  @Column({
    type: 'integer',
    nullable: false,
    default: 100,
    name: 'next_level_xp',
  })
  nextLevelXp: number;

  @ApiProperty({
    description: 'Número de misiones completadas',
    default: 0,
  })
  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
    name: 'completed_missions',
  })
  completedMissions: number;

  @ApiProperty({
    description: 'Racha actual de días consecutivos',
    default: 0,
  })
  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
    name: 'current_streak',
  })
  currentStreak: number;

  @ApiProperty({
    description: 'Racha más larga alcanzada',
    default: 0,
  })
  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
    name: 'longest_streak',
  })
  longestStreak: number;

  @ApiPropertyOptional({
    description: 'Fecha de la última actividad',
    default: 'CURRENT_DATE',
  })
  @Column({
    type: 'date',
    nullable: true,
    default: () => 'CURRENT_DATE',
    name: 'last_activity_date',
  })
  lastActivityDate: Date | null;

  @ApiProperty({
    description: 'Tiempo total invertido (en minutos)',
    default: 0,
  })
  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
    name: 'total_time_spent',
  })
  totalTimeSpent: number;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @ApiProperty({
    description:
      'Fecha de última actualización (actualizada automáticamente por trigger)',
  })
  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
    default: () => 'NOW()',
  })
  updatedAt: Date;
}
