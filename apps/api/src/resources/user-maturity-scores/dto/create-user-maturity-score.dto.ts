import {
  IsUUID,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserMaturityScoreDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El userId es obligatorio' })
  userId: string;

  @ApiProperty({
    description: 'Puntuación de validación de idea (0-100)',
    minimum: 0,
    maximum: 100,
    example: 75,
  })
  @IsInt({ message: 'ideaValidation debe ser un número entero' })
  @Min(0, { message: 'ideaValidation debe ser al menos 0' })
  @Max(100, { message: 'ideaValidation no puede exceder 100' })
  @IsNotEmpty({ message: 'ideaValidation es obligatorio' })
  ideaValidation: number;

  @ApiProperty({
    description: 'Puntuación de experiencia de usuario (0-100)',
    minimum: 0,
    maximum: 100,
    example: 80,
  })
  @IsInt({ message: 'userExperience debe ser un número entero' })
  @Min(0, { message: 'userExperience debe ser al menos 0' })
  @Max(100, { message: 'userExperience no puede exceder 100' })
  @IsNotEmpty({ message: 'userExperience es obligatorio' })
  userExperience: number;

  @ApiProperty({
    description: 'Puntuación de ajuste de mercado (0-100)',
    minimum: 0,
    maximum: 100,
    example: 65,
  })
  @IsInt({ message: 'marketFit debe ser un número entero' })
  @Min(0, { message: 'marketFit debe ser al menos 0' })
  @Max(100, { message: 'marketFit no puede exceder 100' })
  @IsNotEmpty({ message: 'marketFit es obligatorio' })
  marketFit: number;

  @ApiProperty({
    description: 'Puntuación de monetización (0-100)',
    minimum: 0,
    maximum: 100,
    example: 50,
  })
  @IsInt({ message: 'monetization debe ser un número entero' })
  @Min(0, { message: 'monetization debe ser al menos 0' })
  @Max(100, { message: 'monetization no puede exceder 100' })
  @IsNotEmpty({ message: 'monetization es obligatorio' })
  monetization: number;

  @ApiPropertyOptional({
    description: 'Datos del perfil en formato JSON',
    example: { stage: 'growth', industry: 'crafts', notes: 'En expansión' },
  })
  @IsOptional()
  @IsObject({ message: 'profileData debe ser un objeto JSON' })
  profileData?: Record<string, any>;
}
