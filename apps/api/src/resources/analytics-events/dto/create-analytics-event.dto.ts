import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnalyticsEventDto {
  @ApiPropertyOptional({
    description: 'ID del usuario que generó el evento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  userId?: string;

  @ApiProperty({
    description: 'Tipo de evento analítico',
    example: 'page_view',
  })
  @IsString({ message: 'El tipo de evento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo de evento es obligatorio' })
  eventType: string;

  @ApiPropertyOptional({
    description: 'Datos adicionales del evento en formato JSON',
    example: { page: '/home', referrer: 'google', duration: 1500 },
  })
  @IsOptional()
  @IsObject({ message: 'Los datos del evento deben ser un objeto' })
  eventData?: object;

  @ApiPropertyOptional({
    description: 'ID de la sesión del usuario',
    example: 'sess_abc123xyz',
  })
  @IsOptional()
  @IsString({ message: 'El ID de sesión debe ser una cadena de texto' })
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'Indica si el evento fue exitoso',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo success debe ser un booleano' })
  success?: boolean;

  @ApiPropertyOptional({
    description: 'Duración del evento en milisegundos',
    example: 1500,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La duración debe ser un número' })
  durationMs?: number;
}
