import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class TranscribeAudioDto {
  @ApiProperty({
    description: 'Audio en formato base64',
    example: 'UklGRiQAAABXQVZFZm10...',
  })
  @IsString()
  @IsNotEmpty()
  audio: string;

  @ApiPropertyOptional({
    description: 'Código de idioma ISO 639-1',
    example: 'es',
    default: 'es',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2)
  language?: string;
}

export interface TranscribeAudioResponse {
  text: string;
}
