import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsObject,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MasterCoordinatorAction {
  EVOLVE_TASKS = 'evolve_tasks',
  GET_COACHING_MESSAGE = 'get_coaching_message',
  ANALYZE_PROGRESS = 'analyze_progress',
  ANALYZE_AND_GENERATE_TASKS = 'analyze_and_generate_tasks',
  START_CONVERSATION = 'start_conversation',
  GENERATE_INTELLIGENT_QUESTIONS = 'generate_intelligent_questions',
  CREATE_TASK_STEPS = 'create_task_steps',
  COMPLETE_STEP = 'complete_step',
  GENERATE_DELIVERABLE = 'generate_deliverable',
  GENERATE_INTELLIGENT_RECOMMENDATIONS = 'generate_intelligent_recommendations',
  EVALUATE_BRAND_IDENTITY = 'evaluate_brand_identity',
}

export class MasterCoordinatorDto {
  @ApiProperty({
    description: 'Acción a ejecutar por el coordinador maestro',
    enum: MasterCoordinatorAction,
    example: MasterCoordinatorAction.ANALYZE_AND_GENERATE_TASKS,
  })
  @IsEnum(MasterCoordinatorAction, {
    message: 'La acción debe ser un valor válido',
  })
  @IsNotEmpty({ message: 'La acción es obligatoria' })
  action: MasterCoordinatorAction;

  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El userId es obligatorio' })
  userId: string;

  @ApiPropertyOptional({
    description: 'Tareas completadas del usuario',
    type: [Object],
  })
  @IsOptional()
  @IsArray({ message: 'Las tareas completadas deben ser un array' })
  completedTasks?: any[];

  @ApiPropertyOptional({
    description: 'Puntuaciones de madurez del usuario',
    example: {
      ideaValidation: 75,
      userExperience: 60,
      marketFit: 80,
      monetization: 55,
    },
  })
  @IsOptional()
  @IsObject({ message: 'Las puntuaciones de madurez deben ser un objeto' })
  maturityScores?: any;

  @ApiPropertyOptional({
    description: 'Perfil del usuario',
    type: Object,
  })
  @IsOptional()
  @IsObject({ message: 'El perfil del usuario debe ser un objeto' })
  userProfile?: any;

  @ApiPropertyOptional({
    description: 'Tareas actuales del usuario',
    type: [Object],
  })
  @IsOptional()
  @IsArray({ message: 'Las tareas actuales deben ser un array' })
  currentTasks?: any[];

  @ApiPropertyOptional({
    description: 'Descripción del negocio',
    example: 'Vendo muñecos tejidos personalizados',
  })
  @IsOptional()
  @IsString({ message: 'La descripción del negocio debe ser una cadena' })
  businessDescription?: string;

  @ApiPropertyOptional({
    description: 'Contexto de conversación',
  })
  @IsOptional()
  @IsString({ message: 'El contexto de conversación debe ser una cadena' })
  conversationContext?: string;

  @ApiPropertyOptional({
    description: 'ID de la tarea',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El taskId debe ser un UUID válido' })
  taskId?: string;

  @ApiPropertyOptional({
    description: 'Datos de la tarea',
    type: Object,
  })
  @IsOptional()
  @IsObject({ message: 'Los datos de la tarea deben ser un objeto' })
  taskData?: any;

  @ApiPropertyOptional({
    description: 'Contexto del perfil',
    type: Object,
  })
  @IsOptional()
  @IsObject({ message: 'El contexto del perfil debe ser un objeto' })
  profileContext?: any;

  @ApiPropertyOptional({
    description: 'ID del paso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El stepId debe ser un UUID válido' })
  stepId?: string;

  @ApiPropertyOptional({
    description: 'Datos del paso',
    type: Object,
  })
  @IsOptional()
  @IsObject({ message: 'Los datos del paso deben ser un objeto' })
  stepData?: any;

  @ApiPropertyOptional({
    description: 'Idioma de respuesta',
    example: 'es',
    enum: ['es', 'en'],
  })
  @IsOptional()
  @IsString({ message: 'El idioma debe ser una cadena' })
  language?: 'es' | 'en';

  @ApiPropertyOptional({
    description: 'Datos del wizard de evaluación',
    type: Object,
  })
  @IsOptional()
  @IsObject({ message: 'Los datos del wizard deben ser un objeto' })
  wizardData?: Record<string, any>;
}
