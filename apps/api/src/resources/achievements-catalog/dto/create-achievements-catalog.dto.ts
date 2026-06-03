import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAchievementsCatalogDto {
  @ApiProperty({
    description: 'ID único del logro (texto descriptivo)',
    example: 'first_mission',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Título del logro',
    example: 'Primera Misión',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descripción del logro',
    example: 'Completaste tu primera misión empresarial',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Icono del logro',
    example: 'star',
    default: 'trophy',
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Criterios de desbloqueo',
    example: { type: 'missions_completed', count: 1 },
  })
  @IsObject()
  @IsOptional()
  unlockCriteria?: object;

  @ApiPropertyOptional({
    description: 'Categoría del logro',
    example: 'missions',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Nivel del logro',
    example: 'bronze',
    enum: ['bronze', 'silver', 'gold', 'platinum'],
  })
  @IsString()
  @IsOptional()
  tier?: string;
}
