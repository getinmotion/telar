import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgentTask } from '../../agent-tasks/entities/agent-task.entity';

@Entity({ name: 'task_steps', schema: 'public' })
export class TaskStep extends BaseEntity {
  @ApiProperty({ description: 'ID único del paso de tarea' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID de la tarea padre',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'task_id' })
  taskId: string;

  @ApiProperty({
    description: 'Número del paso en la secuencia',
    example: 1,
  })
  @Column({ type: 'integer', name: 'step_number' })
  stepNumber: number;

  @ApiProperty({
    description: 'Título del paso',
    example: 'Recopilar información de tu negocio',
  })
  @Column({ type: 'text' })
  title: string;

  @ApiProperty({
    description: 'Descripción detallada del paso',
    example: 'Proporciona información básica sobre tu emprendimiento artesanal',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Tipo de entrada esperada',
    example: 'text',
    default: 'text',
  })
  @Column({ type: 'text', name: 'input_type', default: 'text' })
  inputType: string;

  @ApiProperty({
    description: 'Criterios de validación para la entrada del usuario',
    example: { minLength: 10, required: true },
  })
  @Column({ type: 'jsonb', name: 'validation_criteria', default: '{}' })
  validationCriteria: object;

  @ApiPropertyOptional({
    description: 'Prompt de contexto para asistencia de IA',
    example: 'Ayuda al usuario a describir su negocio artesanal de forma clara',
  })
  @Column({ type: 'text', name: 'ai_context_prompt', nullable: true })
  aiContextPrompt: string | null;

  @ApiProperty({
    description: 'Estado de completitud del paso',
    example: 'pending',
    default: 'pending',
    enum: ['pending', 'in_progress', 'completed', 'skipped'],
  })
  @Column({ type: 'text', name: 'completion_status', default: 'pending' })
  completionStatus: string;

  @ApiProperty({
    description: 'Datos de entrada del usuario',
    example: { businessName: 'Artesanías Don Juan', location: 'Ráquira' },
  })
  @Column({ type: 'jsonb', name: 'user_input_data', default: '{}' })
  userInputData: object;

  @ApiProperty({
    description: 'Log de asistencia de IA para este paso',
    example: [
      { timestamp: '2026-01-27T15:30:00Z', message: 'Usuario solicitó ayuda' },
    ],
    type: [Object],
  })
  @Column({ type: 'jsonb', name: 'ai_assistance_log', default: '[]' })
  aiAssistanceLog: object[];

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Fecha de eliminación (soft delete)' })
  @DeleteDateColumn({
    type: 'timestamp with time zone',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt: Date | null;

  // Relación N:1 con AgentTask (muchos pasos pertenecen a una tarea)
  @ApiProperty({ description: 'Tarea padre' })
  @ManyToOne(() => AgentTask, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: AgentTask;
}
