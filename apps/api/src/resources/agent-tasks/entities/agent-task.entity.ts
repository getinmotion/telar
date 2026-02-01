import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

// Enums
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskRelevance {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum TaskEnvironment {
  PRODUCTION = 'production',
  STAGING = 'staging',
}

export enum MilestoneCategory {
  FORMALIZATION = 'formalization',
  BRAND = 'brand',
  SHOP = 'shop',
  SALES = 'sales',
  COMMUNITY = 'community',
}

@Entity({ name: 'agent_tasks', schema: 'public' })
@Check(
  'agent_tasks_progress_percentage_check',
  '"progress_percentage" >= 0 AND "progress_percentage" <= 100',
)
@Check(
  'agent_tasks_priority_check',
  '"priority" >= 1 AND "priority" <= 5',
)
export class AgentTask extends BaseEntity {
  @ApiProperty({ description: 'ID único de la tarea' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID del usuario propietario de la tarea' })
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ApiProperty({ description: 'Usuario propietario de la tarea' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'ID del agente que creó la tarea' })
  @Column({ type: 'text', name: 'agent_id' })
  agentId: string;

  @ApiPropertyOptional({ description: 'ID de la conversación asociada' })
  @Column({ type: 'uuid', name: 'conversation_id', nullable: true })
  conversationId: string | null;

  @ApiProperty({ description: 'Título de la tarea', example: 'Completar registro RUT' })
  @Column({ type: 'text' })
  title: string;

  @ApiPropertyOptional({ description: 'Descripción detallada de la tarea' })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Relevancia de la tarea',
    enum: TaskRelevance,
    default: TaskRelevance.MEDIUM,
  })
  @Column({
    type: 'text',
    default: TaskRelevance.MEDIUM,
  })
  relevance: TaskRelevance;

  @ApiProperty({
    description: 'Porcentaje de progreso (0-100)',
    minimum: 0,
    maximum: 100,
    default: 0,
  })
  @Column({ type: 'integer', name: 'progress_percentage', default: 0 })
  progressPercentage: number;

  @ApiProperty({
    description: 'Estado de la tarea',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  @Column({
    type: 'text',
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'Prioridad de la tarea (1-5, siendo 1 la más alta)',
    minimum: 1,
    maximum: 5,
    default: 3,
  })
  @Column({ type: 'integer', default: 3 })
  priority: number;

  @ApiPropertyOptional({ description: 'Fecha límite de la tarea' })
  @Column({ type: 'timestamp with time zone', name: 'due_date', nullable: true })
  dueDate: Date | null;

  @ApiPropertyOptional({ description: 'Fecha de completación de la tarea' })
  @Column({
    type: 'timestamp with time zone',
    name: 'completed_at',
    nullable: true,
  })
  completedAt: Date | null;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Subtareas en formato JSON',
    example: [],
    default: [],
  })
  @Column({ type: 'jsonb', default: [] })
  subtasks: any[];

  @ApiProperty({ description: 'Notas adicionales', default: '' })
  @Column({ type: 'text', default: '' })
  notes: string;

  @ApiProperty({
    description: 'Pasos completados en formato JSON',
    example: {},
    default: {},
  })
  @Column({ type: 'jsonb', name: 'steps_completed', default: {} })
  stepsCompleted: Record<string, any>;

  @ApiProperty({
    description: 'Recursos asociados en formato JSON',
    example: [],
    default: [],
  })
  @Column({ type: 'jsonb', default: [] })
  resources: any[];

  @ApiProperty({
    description: 'Tiempo gastado en la tarea (en minutos)',
    default: 0,
  })
  @Column({ type: 'integer', name: 'time_spent', default: 0 })
  timeSpent: number;

  @ApiProperty({ description: 'Indica si la tarea está archivada', default: false })
  @Column({ type: 'boolean', name: 'is_archived', default: false })
  isArchived: boolean;

  @ApiProperty({
    description: 'Entorno de la tarea',
    enum: TaskEnvironment,
    default: TaskEnvironment.PRODUCTION,
  })
  @Column({
    type: 'text',
    default: TaskEnvironment.PRODUCTION,
  })
  environment: TaskEnvironment;

  @ApiPropertyOptional({ description: 'Tipo de entregable' })
  @Column({ type: 'text', name: 'deliverable_type', nullable: true })
  deliverableType: string | null;

  @ApiPropertyOptional({
    description: 'Categoría del milestone',
    enum: MilestoneCategory,
  })
  @Column({
    type: 'text',
    name: 'milestone_category',
    nullable: true,
  })
  milestoneCategory: MilestoneCategory | null;
}
