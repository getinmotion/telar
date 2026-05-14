import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateArtisanMediaCommunityDto {
  @ApiProperty({
    description: 'ID del artesano',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El artisanId debe ser un UUID válido' })
  artisanId: string;

  @ApiProperty({
    description: 'URL del medio (foto/video)',
    example: '/community/photo1.jpg',
  })
  @IsString({ message: 'La URL del medio debe ser una cadena de texto' })
  mediaUrl: string;

  @ApiPropertyOptional({
    description: 'Tipo de medio (image, video, etc.)',
    example: 'image',
  })
  @IsOptional()
  @IsString({ message: 'El tipo de medio debe ser una cadena de texto' })
  mediaType?: string;

  @ApiPropertyOptional({
    description: 'Indica si es el medio principal',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isPrimary debe ser un valor booleano' })
  isPrimary?: boolean;
}
