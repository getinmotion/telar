import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateArtisanIdentityDto {
  @ApiPropertyOptional({
    description: 'ID de la técnica primaria',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El techniquePrimaryId debe ser un UUID válido' })
  techniquePrimaryId?: string;

  @ApiPropertyOptional({
    description: 'ID de la técnica secundaria',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El techniqueSecondaryId debe ser un UUID válido' })
  techniqueSecondaryId?: string;

  @ApiPropertyOptional({
    description: 'Mensaje del oficio artesanal',
    type: String,
  })
  @IsOptional()
  @IsString()
  craftMessage?: string;

  @ApiPropertyOptional({
    description: 'Motivación del artesano',
    type: String,
  })
  @IsOptional()
  @IsString()
  motivation?: string;

  @ApiPropertyOptional({
    description: 'Aspectos únicos del trabajo artesanal',
    type: String,
  })
  @IsOptional()
  @IsString()
  uniqueness?: string;

  @ApiPropertyOptional({
    description: 'Tiempo promedio de producción',
    type: String,
  })
  @IsOptional()
  @IsString()
  averageTime?: string;
}
