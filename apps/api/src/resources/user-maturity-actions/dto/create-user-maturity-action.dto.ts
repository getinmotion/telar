import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsObject,
  IsUUID,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ActionType,
  MaturityCategory,
} from '../entities/user-maturity-action.entity';

export class CreateUserMaturityActionDto {
  @ApiProperty({
    description: 'ID del usuario asociado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El userId es obligatorio' })
  userId: string;

  @ApiProperty({
    description: 'Tipo de acción realizada',
    enum: ActionType,
    example: ActionType.TASK_COMPLETED,
  })
  @IsEnum(ActionType, {
    message:
      'El tipo de acción debe ser: sale, agent_use, task_completed, customer_interaction, milestone o increment',
  })
  @IsNotEmpty({ message: 'El tipo de acción es obligatorio' })
  actionType: ActionType;

  @ApiProperty({
    description: 'Categoría de madurez',
    enum: MaturityCategory,
    example: MaturityCategory.USER_EXPERIENCE,
  })
  @IsEnum(MaturityCategory, {
    message:
      'La categoría debe ser: ideaValidation, userExperience, marketFit o monetization',
  })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  category: MaturityCategory;

  @ApiProperty({
    description: 'Puntos otorgados por la acción (0-100)',
    example: 25,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Los puntos deben ser un número' })
  @Min(0, { message: 'Los puntos no pueden ser negativos' })
  @Max(100, { message: 'Los puntos no pueden exceder 100' })
  @IsNotEmpty({ message: 'Los puntos son obligatorios' })
  points: number;

  @ApiProperty({
    description: 'Descripción de la acción',
    example: 'Usuario completó la configuración de su tienda',
    maxLength: 500,
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(500, {
    message: 'La descripción no puede exceder 500 caracteres',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Metadata adicional de la acción',
    example: {
      taskId: '123',
      completionTime: 300,
      difficulty: 'medium',
    },
  })
  @IsOptional()
  @IsObject({ message: 'La metadata debe ser un objeto' })
  metadata?: object;
}
