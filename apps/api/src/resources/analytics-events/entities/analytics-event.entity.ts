import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'analytics_events', schema: 'public' })
export class AnalyticsEvent extends BaseEntity {
  @ApiProperty({ description: 'ID único del evento' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiPropertyOptional({
    description: 'ID del usuario que generó el evento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string | null;

  @ApiProperty({
    description: 'Tipo de evento analítico',
    example: 'page_view',
  })
  @Column({ type: 'text', name: 'event_type' })
  eventType: string;

  @ApiPropertyOptional({
    description: 'Datos adicionales del evento en formato JSON',
    example: { page: '/home', referrer: 'google' },
    default: {},
  })
  @Column({ type: 'jsonb', name: 'event_data', nullable: true, default: '{}' })
  eventData: object | null;

  @ApiPropertyOptional({
    description: 'ID de la sesión del usuario',
    example: 'sess_abc123xyz',
  })
  @Column({ type: 'text', name: 'session_id', nullable: true })
  sessionId: string | null;

  @ApiPropertyOptional({
    description: 'Indica si el evento fue exitoso',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', nullable: true, default: true })
  success: boolean | null;

  @ApiPropertyOptional({
    description: 'Duración del evento en milisegundos',
    example: 1500,
  })
  @Column({ type: 'integer', name: 'duration_ms', nullable: true })
  durationMs: number | null;

  @ApiProperty({ description: 'Fecha de creación del evento' })
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt: Date;

  // Relación con User
  @ApiPropertyOptional({ description: 'Usuario asociado al evento' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
