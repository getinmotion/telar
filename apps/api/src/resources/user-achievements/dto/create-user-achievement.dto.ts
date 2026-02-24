import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserAchievementDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  userId: string;

  @ApiProperty({
    description: 'ID del logro/achievement',
    example: 'first_product_created',
    maxLength: 255,
  })
  @IsString({ message: 'El achievementId debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del logro es obligatorio' })
  @MaxLength(255, {
    message: 'El achievementId no puede exceder 255 caracteres',
  })
  achievementId: string;

  @ApiProperty({
    description: 'Título del logro',
    example: 'Primer Producto Creado',
    maxLength: 255,
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Descripción del logro',
    example: 'Has creado tu primer producto en la plataforma',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description: string;

  @ApiProperty({
    description: 'Icono del logro',
    example: 'trophy',
    default: 'trophy',
  })
  @IsString({ message: 'El icono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El icono es obligatorio' })
  icon: string;

  @ApiPropertyOptional({
    description: 'Fecha y hora en que se desbloqueó el logro',
    example: '2026-01-27T15:30:00.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'unlockedAt debe ser una fecha válida en formato ISO 8601' },
  )
  unlockedAt?: string;
}
