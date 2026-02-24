import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsArray,
  IsObject,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TaskStatus,
  TaskRelevance,
  TaskEnvironment,
  MilestoneCategory,
} from '../entities/agent-task.entity';

export class CreateAgentTaskDto {
  @ApiProperty({
    description: 'ID del usuario propietario de la tarea',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El userId es obligatorio' })
  userId: string;

  @ApiProperty({
    description: 'ID del agente que crea la tarea',
    example: 'agent_formalization',
  })
  @IsString({ message: 'El agentId debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El agentId es obligatorio' })
  agentId: string;

  @ApiPropertyOptional({
    description: 'ID de la conversación asociada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El conversationId debe ser un UUID válido' })
  conversationId?: string;

  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Completar registro RUT',
    maxLength: 500,
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la tarea',
    example: 'Registrar el RUT en el sistema para activar funcionalidades de facturación',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Relevancia de la tarea',
    enum: TaskRelevance,
    default: TaskRelevance.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TaskRelevance, {
    message: 'La relevancia debe ser: low, medium o high',
  })
  relevance?: TaskRelevance;

  @ApiPropertyOptional({
    description: 'Porcentaje de progreso (0-100)',
    minimum: 0,
    maximum: 100,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'El progreso debe ser un número entero' })
  @Min(0, { message: 'El progreso mínimo es 0' })
  @Max(100, { message: 'El progreso máximo es 100' })
  progressPercentage?: number;

  @ApiPropertyOptional({
    description: 'Estado de la tarea',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'El estado debe ser: pending, in_progress, completed o cancelled',
  })
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Prioridad de la tarea (1-5, siendo 1 la más alta)',
    minimum: 1,
    maximum: 5,
    default: 3,
  })
  @IsOptional()
  @IsInt({ message: 'La prioridad debe ser un número entero' })
  @Min(1, { message: 'La prioridad mínima es 1' })
  @Max(5, { message: 'La prioridad máxima es 5' })
  priority?: number;

  @ApiPropertyOptional({
    description: 'Fecha límite de la tarea',
    example: '2026-02-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha límite debe ser una fecha válida en formato ISO' },
  )
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Subtareas en formato JSON',
    example: [{ id: 1, title: 'Subtarea 1', completed: false }],
    default: [],
  })
  @IsOptional()
  @IsArray({ message: 'Las subtareas deben ser un array' })
  subtasks?: any[];

  @ApiPropertyOptional({
    description: 'Notas adicionales',
    default: '',
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Pasos completados en formato JSON',
    example: { step1: true, step2: false },
    default: {},
  })
  @IsOptional()
  @IsObject({ message: 'Los pasos completados deben ser un objeto' })
  stepsCompleted?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Recursos asociados en formato JSON',
    example: [{ type: 'url', value: 'https://example.com' }],
    default: [],
  })
  @IsOptional()
  @IsArray({ message: 'Los recursos deben ser un array' })
  resources?: any[];

  @ApiPropertyOptional({
    description: 'Tiempo gastado en la tarea (en minutos)',
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'El tiempo gastado debe ser un número entero' })
  @Min(0, { message: 'El tiempo gastado no puede ser negativo' })
  timeSpent?: number;

  @ApiPropertyOptional({
    description: 'Indica si la tarea está archivada',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isArchived debe ser un booleano' })
  isArchived?: boolean;

  @ApiPropertyOptional({
    description: 'Entorno de la tarea',
    enum: TaskEnvironment,
    default: TaskEnvironment.PRODUCTION,
  })
  @IsOptional()
  @IsEnum(TaskEnvironment, {
    message: 'El entorno debe ser: production o staging',
  })
  environment?: TaskEnvironment;

  @ApiPropertyOptional({
    description: 'Tipo de entregable',
    example: 'document',
  })
  @IsOptional()
  @IsString({ message: 'El tipo de entregable debe ser una cadena de texto' })
  deliverableType?: string;

  @ApiPropertyOptional({
    description: 'Categoría del milestone',
    enum: MilestoneCategory,
  })
  @IsOptional()
  @IsEnum(MilestoneCategory, {
    message:
      'La categoría debe ser: formalization, brand, shop, sales o community',
  })
  milestoneCategory?: MilestoneCategory;
}
