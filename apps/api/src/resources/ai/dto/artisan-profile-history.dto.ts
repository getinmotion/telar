import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
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

  @ApiProperty({ description: 'De quién aprendió el oficio' })
  @IsString()
  @IsNotEmpty()
  learnedFrom: string;

  @ApiProperty({ description: 'Edad en que comenzó' })
  @IsNumber()
  @Min(0)
  startAge: number;

  @ApiProperty({ description: 'Significado cultural del oficio' })
  @IsString()
  @IsNotEmpty()
  culturalMeaning: string;

  @ApiProperty({ description: 'Motivación del artesano' })
  @IsString()
  @IsNotEmpty()
  motivation: string;

  @ApiProperty({ description: 'Historia cultural de la región/etnia' })
  @IsString()
  @IsNotEmpty()
  culturalHistory: string;

  @ApiProperty({ description: 'Relación étnica' })
  @IsString()
  @IsNotEmpty()
  ethnicRelation: string;

  @ApiProperty({ description: 'Conocimiento ancestral' })
  @IsString()
  @IsNotEmpty()
  ancestralKnowledge: string;

  @ApiProperty({ description: 'Importancia territorial' })
  @IsString()
  @IsNotEmpty()
  territorialImportance: string;

  @ApiProperty({ description: 'Dirección del taller' })
  @IsString()
  @IsNotEmpty()
  workshopAddress: string;

  @ApiProperty({ description: 'Fotos del taller', type: [String] })
  @IsArray()
  @IsString({ each: true })
  workshopPhotos: string[];

  @ApiPropertyOptional({ description: 'Video del taller' })
  @IsString()
  @IsOptional()
  workshopVideo?: string;

  @ApiProperty({ description: 'Descripción del taller' })
  @IsString()
  @IsNotEmpty()
  workshopDescription: string;

  @ApiProperty({ description: 'Técnicas utilizadas', type: [String] })
  @IsArray()
  @IsString({ each: true })
  techniques: string[];

  @ApiProperty({ description: 'Materiales utilizados', type: [String] })
  @IsArray()
  @IsString({ each: true })
  materials: string[];

  @ApiProperty({ description: 'Tiempo promedio de elaboración' })
  @IsString()
  @IsNotEmpty()
  averageTime: string;

  @ApiProperty({ description: 'Lo que hace única su artesanía' })
  @IsString()
  @IsNotEmpty()
  uniqueness: string;

  @ApiProperty({ description: 'Mensaje del artesano sobre su oficio' })
  @IsString()
  @IsNotEmpty()
  craftMessage: string;

  @ApiProperty({ description: 'Fotos trabajando', type: [String] })
  @IsArray()
  @IsString({ each: true })
  workingPhotos: string[];

  @ApiProperty({ description: 'Fotos de la comunidad', type: [String] })
  @IsArray()
  @IsString({ each: true })
  communityPhotos: string[];

  @ApiProperty({ description: 'Fotos de la familia', type: [String] })
  @IsArray()
  @IsString({ each: true })
  familyPhotos: string[];
}

export class GenerateArtisanProfileHistoryDto {
  @ApiProperty({ description: 'Datos del perfil del artesano' })
  @IsNotEmpty()
  profile: ArtisanProfileDataDto;

  @ApiProperty({ description: 'Nombre de la tienda', example: 'Artesanías Wayuu' })
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @ApiProperty({ description: 'Tipo de artesanía', example: 'Cerámica' })
  @IsString()
  @IsNotEmpty()
  craftType: string;

  @ApiProperty({ description: 'Región del artesano', example: 'Caribe' })
  @IsString()
  @IsNotEmpty()
  region: string;
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
