import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsArray,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMasterCoordinatorContextDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El userId es obligatorio' })
  userId: string;

  @ApiPropertyOptional({
    description: 'Snapshot del contexto en formato JSON',
    example: {
      currentGoals: ['Registrar RUT', 'Crear tienda'],
      preferences: { language: 'es', notifications: true },
      businessStage: 'growth',
    },
    default: {},
  })
  @IsOptional()
  @IsObject({ message: 'contextSnapshot debe ser un objeto JSON' })
  contextSnapshot?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Última interacción del usuario',
    example: '2026-01-22T14:30:00Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'lastInteraction debe ser una fecha válida en formato ISO' },
  )
  lastInteraction?: string;

  @ApiPropertyOptional({
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
  @IsOptional()
  @IsArray({ message: 'aiMemory debe ser un array' })
  aiMemory?: any[];

  @ApiPropertyOptional({
    description: 'Versión del contexto',
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: 'contextVersion debe ser un número entero' })
  @Min(1, { message: 'contextVersion debe ser al menos 1' })
  contextVersion?: number;
}
