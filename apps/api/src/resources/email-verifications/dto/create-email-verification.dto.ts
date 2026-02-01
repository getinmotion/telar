import { IsUUID, IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmailVerificationDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  userId: string;

  @ApiProperty({
    description: 'Token de verificación único',
    example: 'abc123def456ghi789',
  })
  @IsString({ message: 'El token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token: string;

  @ApiProperty({
    description: 'Fecha de expiración del token',
    example: '2026-01-15T10:00:00.000Z',
  })
  @IsDateString(
    {},
    { message: 'La fecha de expiración debe ser válida (ISO 8601)' },
  )
  expiresAt: string;
}
