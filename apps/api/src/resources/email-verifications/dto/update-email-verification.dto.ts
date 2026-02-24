import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateEmailVerificationDto {
  @ApiPropertyOptional({
    description: 'Fecha en que se usó el token',
    example: '2026-01-14T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de uso debe ser válida (ISO 8601)' },
  )
  usedAt?: string;
}
