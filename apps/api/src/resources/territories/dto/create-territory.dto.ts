import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTerritoryDto {
  @ApiProperty({
    description: 'Nombre del territorio',
    example: 'Amazonas',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiPropertyOptional({
    description: 'Indica si es un territorio',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isTerritory debe ser un valor booleano' })
  isTerritory?: boolean;

  @ApiPropertyOptional({
    description: 'Nombre de la región',
    example: 'Región Andina',
  })
  @IsOptional()
  @IsString({ message: 'El nombre de la región debe ser una cadena de texto' })
  regionName?: string;
}
