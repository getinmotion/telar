import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgentDeliverableDto {
  @ApiProperty({
    description: 'ID del usuario propietario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  userId: string;

  @ApiProperty({
    description: 'ID del agente que generó el entregable',
    example: 'ai-agent-001',
    maxLength: 255,
  })
  @IsString({ message: 'El agentId debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del agente es obligatorio' })
  @MaxLength(255, { message: 'El agentId no puede exceder 255 caracteres' })
  agentId: string;

  @ApiPropertyOptional({
    description: 'ID de la conversación relacionada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El conversationId debe ser un UUID válido' })
  conversationId?: string;

  @ApiPropertyOptional({
    description: 'ID de la tarea relacionada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El taskId debe ser un UUID válido' })
  taskId?: string;

  @ApiProperty({
    description: 'Título del entregable',
    example: 'Análisis de mercado completado',
    maxLength: 500,
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(500, { message: 'El título no puede exceder 500 caracteres' })
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción del entregable',
    example: 'Este documento contiene el análisis completo del mercado...',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiProperty({
    description: 'Tipo de archivo del entregable',
    example: 'text',
    default: 'text',
  })
  @IsString({ message: 'El tipo de archivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo de archivo es obligatorio' })
  fileType: string;

  @ApiPropertyOptional({
    description: 'Contenido del entregable (si es tipo texto)',
    example: 'Lorem ipsum dolor sit amet...',
  })
  @IsOptional()
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  content?: string;

  @ApiPropertyOptional({
    description: 'URL del archivo (si está almacenado externamente)',
    example: 'https://storage.example.com/file.pdf',
  })
  @IsOptional()
  @IsString({ message: 'La URL del archivo debe ser una cadena de texto' })
  fileUrl?: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales del entregable',
    example: { format: 'markdown', version: '1.0' },
  })
  @IsOptional()
  @IsObject({ message: 'Los metadatos deben ser un objeto' })
  metadata?: object;
}
