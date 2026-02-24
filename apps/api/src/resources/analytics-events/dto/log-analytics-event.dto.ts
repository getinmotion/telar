import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogAnalyticsEventDto {
  @ApiProperty({
    description: 'Tipo de evento analítico',
    example: 'page_view',
  })
  @IsString({ message: 'El tipo de evento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo de evento es obligatorio' })
  event_type: string;

  @ApiPropertyOptional({
    description: 'Datos adicionales del evento en formato JSON',
    example: { page: '/home', referrer: 'google', duration: 1500 },
  })
  @IsOptional()
  @IsObject({ message: 'Los datos del evento deben ser un objeto' })
  event_data?: object;

  @ApiPropertyOptional({
    description: 'ID de la sesión del usuario',
    example: 'sess_abc123xyz',
  })
  @IsOptional()
  @IsString({ message: 'El ID de sesión debe ser una cadena de texto' })
  session_id?: string;

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
  duration_ms?: number;
}
