import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateArtisanOriginDto {
  @ApiPropertyOptional({
    description: 'Historia de origen del artesano',
    type: String,
  })
  @IsOptional()
  @IsString()
  originStory?: string;

  @ApiPropertyOptional({
    description: 'Historia cultural del artesano',
    type: String,
  })
  @IsOptional()
  @IsString()
  culturalStory?: string;

  @ApiPropertyOptional({
    description: 'Historia principal del artesano',
    type: String,
  })
  @IsOptional()
  @IsString()
  mainStory?: string;

  @ApiPropertyOptional({
    description: 'Significado cultural de la artesanía',
    type: String,
  })
  @IsOptional()
  @IsString()
  culturalMeaning?: string;

  @ApiPropertyOptional({
    description: 'Detalle de quién aprendió el oficio',
    type: String,
  })
  @IsOptional()
  @IsString()
  learnedFromDetail?: string;

  @ApiPropertyOptional({
    description: 'Conocimiento ancestral transmitido',
    type: String,
  })
  @IsOptional()
  @IsString()
  ancestralKnowledge?: string;

  @ApiPropertyOptional({
    description: 'De quién aprendió el oficio',
    type: String,
  })
  @IsOptional()
  @IsString()
  learnedFrom?: string;

  @ApiPropertyOptional({
    description: 'Edad a la que comenzó en la artesanía',
    type: Number,
    example: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  startAge?: number;

  @ApiPropertyOptional({
    description: 'Relación con grupo étnico',
    type: String,
  })
  @IsOptional()
  @IsString()
  ethnicRelation?: string;

  @ApiPropertyOptional({
    description: 'Cita o frase representativa del artesano',
    type: String,
  })
  @IsOptional()
  @IsString()
  artisanQuote?: string;
}
