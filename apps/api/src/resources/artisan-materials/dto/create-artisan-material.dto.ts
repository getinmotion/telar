import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateArtisanMaterialDto {
  @ApiProperty({
    description: 'ID del artesano',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El artisanId debe ser un UUID válido' })
  artisanId: string;

  @ApiProperty({
    description: 'ID del material',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El materialId debe ser un UUID válido' })
  materialId: string;

  @ApiPropertyOptional({
    description: 'Indica si es el material primario',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isPrimary debe ser un valor booleano' })
  isPrimary?: boolean;
}
