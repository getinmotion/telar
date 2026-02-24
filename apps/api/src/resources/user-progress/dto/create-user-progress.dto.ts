import { IsUUID, IsInt, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserProgressDto {
  @ApiProperty({
    description: 'ID del usuario (relación con user_profiles)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  userId: string;

  @ApiPropertyOptional({
    description: 'Nivel del usuario',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El nivel debe ser un número entero' })
  @Min(1, { message: 'El nivel debe ser al menos 1' })
  level?: number;

  @ApiPropertyOptional({
    description: 'Puntos de experiencia',
    default: 0,
    example: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Los puntos de experiencia deben ser un número entero' })
  @Min(0, { message: 'Los puntos de experiencia no pueden ser negativos' })
  experiencePoints?: number;

  @ApiPropertyOptional({
    description: 'Puntos necesarios para el siguiente nivel',
    default: 100,
    example: 100,
  })
  @IsOptional()
  @IsInt({ message: 'nextLevelXp debe ser un número entero' })
  @Min(1, { message: 'nextLevelXp debe ser al menos 1' })
  nextLevelXp?: number;

  @ApiPropertyOptional({
    description: 'Misiones completadas',
    default: 0,
    example: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Las misiones completadas deben ser un número entero' })
  @Min(0, { message: 'Las misiones completadas no pueden ser negativas' })
  completedMissions?: number;

  @ApiPropertyOptional({
    description: 'Racha actual',
    default: 0,
    example: 0,
  })
  @IsOptional()
  @IsInt({ message: 'La racha actual debe ser un número entero' })
  @Min(0, { message: 'La racha actual no puede ser negativa' })
  currentStreak?: number;

  @ApiPropertyOptional({
    description: 'Racha más larga',
    default: 0,
    example: 0,
  })
  @IsOptional()
  @IsInt({ message: 'La racha más larga debe ser un número entero' })
  @Min(0, { message: 'La racha más larga no puede ser negativa' })
  longestStreak?: number;

  @ApiPropertyOptional({
    description: 'Fecha de última actividad',
    example: '2026-01-14',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha debe estar en formato válido (YYYY-MM-DD)' },
  )
  lastActivityDate?: string;

  @ApiPropertyOptional({
    description: 'Tiempo total invertido en minutos',
    default: 0,
    example: 0,
  })
  @IsOptional()
  @IsInt({ message: 'El tiempo total debe ser un número entero' })
  @Min(0, { message: 'El tiempo total no puede ser negativo' })
  totalTimeSpent?: number;
}
