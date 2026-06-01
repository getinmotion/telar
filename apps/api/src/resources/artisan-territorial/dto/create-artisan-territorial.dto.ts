import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateArtisanTerritorialDto {
  @ApiProperty({
    description: 'ID del territorio',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El territorialId debe ser un UUID válido' })
  territorialId: string;

  @ApiPropertyOptional({
    description: 'Importancia territorial',
    example: 'Alta',
  })
  @IsOptional()
  @IsString({ message: 'La importancia territorial debe ser una cadena de texto' })
  territorialImportance?: string;
}
