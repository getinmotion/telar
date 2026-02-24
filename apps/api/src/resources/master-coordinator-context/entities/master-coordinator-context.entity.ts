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
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'master_coordinator_context', schema: 'public' })
export class MasterCoordinatorContext extends BaseEntity {
  @ApiProperty({ description: 'ID único del contexto del coordinador' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID del usuario' })
  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId: string;

  @ApiProperty({ description: 'Usuario asociado' })
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Snapshot del contexto en formato JSON',
    example: {
      currentGoals: ['Registrar RUT', 'Crear tienda'],
      preferences: { language: 'es', notifications: true },
      businessStage: 'growth',
    },
    default: {},
  })
  @Column({ type: 'jsonb', name: 'context_snapshot', default: {} })
  contextSnapshot: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Última interacción del usuario',
    example: '2026-01-22T14:30:00Z',
  })
  @Column({
    type: 'timestamp with time zone',
    name: 'last_interaction',
    nullable: true,
    default: () => 'now()',
  })
  lastInteraction: Date | null;

  @ApiProperty({
    description: 'Memoria de IA en formato JSON (array de interacciones)',
    example: [
      {
        timestamp: '2026-01-22T10:00:00Z',
        message: 'Usuario preguntó sobre RUT',
        response: 'Le expliqué el proceso',
      },
    ],
    default: [],
  })
  @Column({ type: 'jsonb', name: 'ai_memory', default: [] })
  aiMemory: any[];

  @ApiProperty({
    description: 'Versión del contexto (se incrementa con cada actualización)',
    default: 1,
  })
  @Column({ type: 'integer', name: 'context_version', default: 1 })
  contextVersion: number;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
