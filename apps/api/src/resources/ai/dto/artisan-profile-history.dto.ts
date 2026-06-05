import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class ArtisanProfileDataDto {
  @ApiProperty({ description: 'Nombre del artesano' })
  @IsString()
  @IsNotEmpty()
  artisanName: string;

  @ApiProperty({ description: 'Nombre artístico' })
  @IsString()
  @IsNotEmpty()
  artisticName: string;

  @ApiPropertyOptional({ description: 'URL de foto del artesano' })
  @IsString()
  @IsOptional()
  artisanPhoto?: string;

  @ApiPropertyOptional({ description: 'URL de video del artesano' })
  @IsString()
  @IsOptional()
  artisanVideo?: string;

  @ApiPropertyOptional({ description: 'De quién aprendió el oficio' })
  @IsString()
  @IsOptional()
  learnedFrom?: string;

  @ApiPropertyOptional({ description: 'Edad en que comenzó' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  startAge?: number;

  @ApiPropertyOptional({ description: 'Significado cultural del oficio' })
  @IsString()
  @IsOptional()
  culturalMeaning?: string;

  @ApiPropertyOptional({ description: 'Motivación del artesano' })
  @IsString()
  @IsOptional()
  motivation?: string;

  @ApiPropertyOptional({ description: 'Historia cultural de la región/etnia' })
  @IsString()
  @IsOptional()
  culturalHistory?: string;

  @ApiPropertyOptional({ description: 'Relación étnica' })
  @IsString()
  @IsOptional()
  ethnicRelation?: string;

  @ApiPropertyOptional({ description: 'Conocimiento ancestral' })
  @IsString()
  @IsOptional()
  ancestralKnowledge?: string;

  @ApiPropertyOptional({ description: 'Importancia territorial' })
  @IsString()
  @IsOptional()
  territorialImportance?: string;

  @ApiPropertyOptional({ description: 'Dirección del taller' })
  @IsString()
  @IsOptional()
  workshopAddress?: string;

  @ApiPropertyOptional({ description: 'Fotos del taller', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  workshopPhotos?: string[];

  @ApiPropertyOptional({ description: 'Video del taller' })
  @IsString()
  @IsOptional()
  workshopVideo?: string;

  @ApiPropertyOptional({ description: 'Descripción del taller' })
  @IsString()
  @IsOptional()
  workshopDescription?: string;

  @ApiPropertyOptional({ description: 'Técnicas utilizadas (nombres legacy)', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  techniques?: string[];

  @ApiPropertyOptional({ description: 'Materiales utilizados (nombres legacy)', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  materials?: string[];

  @ApiPropertyOptional({ description: 'Tiempo promedio de elaboración' })
  @IsString()
  @IsOptional()
  averageTime?: string;

  @ApiPropertyOptional({ description: 'Lo que hace única su artesanía' })
  @IsString()
  @IsOptional()
  uniqueness?: string;

  @ApiPropertyOptional({ description: 'Mensaje del artesano sobre su oficio' })
  @IsString()
  @IsOptional()
  craftMessage?: string;
}

export class GenerateArtisanProfileHistoryDto {
  @ApiProperty({ description: 'Datos del perfil del artesano' })
  @IsNotEmpty()
  profile: ArtisanProfileDataDto;

  @ApiProperty({ description: 'Nombre de la tienda', example: 'Artesanías Wayuu' })
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @ApiPropertyOptional({ description: 'Tipo de artesanía', example: 'Cerámica' })
  @IsString()
  @IsOptional()
  craftType?: string;

  @ApiPropertyOptional({ description: 'Región del artesano', example: 'Caribe' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({ description: 'ID del artesano para guardar la historia generada' })
  @IsUUID()
  @IsOptional()
  artisanId?: string;
}

export interface TimelineEvent {
  year: string;
  event: string;
}

export interface ArtisanProfileHistoryResponse {
  heroTitle: string;
  heroSubtitle: string;
  claim: string;
  timeline: TimelineEvent[];
  originStory: string;
  culturalStory: string;
  craftStory: string;
  workshopStory: string;
  artisanQuote: string;
  closingMessage: string;
}
