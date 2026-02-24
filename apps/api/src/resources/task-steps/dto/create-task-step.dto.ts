import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsObject,
  IsArray,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CompletionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export class CreateTaskStepDto {
  @ApiProperty({
    description: 'ID de la tarea padre',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El taskId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de la tarea es obligatorio' })
  taskId: string;

  @ApiProperty({
    description: 'Número del paso en la secuencia',
    example: 1,
  })
  @IsNumber({}, { message: 'El número de paso debe ser un número' })
  @IsNotEmpty({ message: 'El número de paso es obligatorio' })
  @Min(1, { message: 'El número de paso debe ser mayor o igual a 1' })
  stepNumber: number;

  @ApiProperty({
    description: 'Título del paso',
    example: 'Recopilar información de tu negocio',
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title: string;

  @ApiProperty({
    description: 'Descripción detallada del paso',
    example: 'Proporciona información básica sobre tu emprendimiento artesanal',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description: string;

  @ApiProperty({
    description: 'Tipo de entrada esperada',
    example: 'text',
    default: 'text',
  })
  @IsString({ message: 'El tipo de entrada debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo de entrada es obligatorio' })
  inputType: string;

  @ApiPropertyOptional({
    description: 'Criterios de validación para la entrada del usuario',
    example: { minLength: 10, required: true },
  })
  @IsOptional()
  @IsObject({ message: 'Los criterios de validación deben ser un objeto' })
  validationCriteria?: object;

  @ApiPropertyOptional({
    description: 'Prompt de contexto para asistencia de IA',
    example: 'Ayuda al usuario a describir su negocio artesanal de forma clara',
  })
  @IsOptional()
  @IsString({ message: 'El prompt de IA debe ser una cadena de texto' })
  aiContextPrompt?: string;

  @ApiPropertyOptional({
    description: 'Estado de completitud del paso',
    example: 'pending',
    default: 'pending',
    enum: CompletionStatus,
  })
  @IsOptional()
  @IsEnum(CompletionStatus, {
    message: 'El estado de completitud debe ser un valor válido',
  })
  completionStatus?: CompletionStatus;

  @ApiPropertyOptional({
    description: 'Datos de entrada del usuario',
    example: { businessName: 'Artesanías Don Juan', location: 'Ráquira' },
  })
  @IsOptional()
  @IsObject({ message: 'Los datos de entrada deben ser un objeto' })
  userInputData?: object;

  @ApiPropertyOptional({
    description: 'Log de asistencia de IA para este paso',
    example: [
      { timestamp: '2026-01-27T15:30:00Z', message: 'Usuario solicitó ayuda' },
    ],
    type: [Object],
  })
  @IsOptional()
  @IsArray({ message: 'El log de asistencia debe ser un array' })
  aiAssistanceLog?: object[];
}
