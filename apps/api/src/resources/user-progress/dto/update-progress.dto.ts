import { IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiProperty({
    description: 'Puntos de experiencia ganados',
    example: 50,
    minimum: 0,
  })
  @IsNumber({}, { message: 'xpGained debe ser un número' })
  @Min(0, { message: 'xpGained debe ser mayor o igual a 0' })
  xpGained: number;

  @ApiPropertyOptional({
    description: 'Indica si se completó una misión',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'missionCompleted debe ser un booleano' })
  missionCompleted?: boolean;

  @ApiPropertyOptional({
    description: 'Tiempo invertido en minutos',
    example: 15,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'timeSpent debe ser un número' })
  @Min(0, { message: 'timeSpent debe ser mayor o igual a 0' })
  timeSpent?: number;
}
