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
import { User } from '../../users/entities/user.entity';
import { AgentTask } from '../../agent-tasks/entities/agent-task.entity';

@Entity({ name: 'agent_deliverables', schema: 'public' })
export class AgentDeliverable extends BaseEntity {
  @ApiProperty({ description: 'ID único del entregable' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del usuario propietario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ApiProperty({
    description: 'ID del agente que generó el entregable',
    example: 'ai-agent-001',
  })
  @Column({ type: 'text', name: 'agent_id' })
  agentId: string;

  @ApiPropertyOptional({
    description: 'ID de la conversación relacionada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'conversation_id', nullable: true })
  conversationId: string | null;

  @ApiPropertyOptional({
    description: 'ID de la tarea relacionada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'task_id', nullable: true })
  taskId: string | null;

  @ApiProperty({
    description: 'Título del entregable',
    example: 'Análisis de mercado completado',
  })
  @Column({ type: 'text' })
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción del entregable',
    example: 'Este documento contiene el análisis completo del mercado...',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Tipo de archivo del entregable',
    example: 'text',
    default: 'text',
  })
  @Column({ type: 'text', name: 'file_type', default: 'text' })
  fileType: string;

  @ApiPropertyOptional({
    description: 'Contenido del entregable (si es tipo texto)',
    example: 'Lorem ipsum dolor sit amet...',
  })
  @Column({ type: 'text', nullable: true })
  content: string | null;

  @ApiPropertyOptional({
    description: 'URL del archivo (si está almacenado externamente)',
    example: 'https://storage.example.com/file.pdf',
  })
  @Column({ type: 'text', name: 'file_url', nullable: true })
  fileUrl: string | null;

  @ApiProperty({
    description: 'Metadatos adicionales del entregable',
    example: { format: 'markdown', version: '1.0' },
  })
  @Column({ type: 'jsonb', default: '{}' })
  metadata: object;

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

  // Relación N:1 con User (muchos entregables pertenecen a un usuario)
  @ApiProperty({ description: 'Usuario propietario del entregable' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relación N:1 con AgentTask (muchos entregables pueden pertenecer a una tarea)
  @ApiPropertyOptional({ description: 'Tarea relacionada con el entregable' })
  @ManyToOne(() => AgentTask, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'task_id' })
  task: AgentTask | null;
}
