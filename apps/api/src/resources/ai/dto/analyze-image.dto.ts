import { IsArray, IsString, IsUrl, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeImageDto {
  @ApiProperty({
    description: 'Array de URLs de imágenes a analizar (máximo 3)',
    example: [
      'https://telar-stg-bucket.s3.us-east-1.amazonaws.com/images/product1.jpg',
      'https://telar-stg-bucket.s3.us-east-1.amazonaws.com/images/product2.jpg',
    ],
    type: [String],
    maxItems: 3,
  })
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  @ArrayMaxSize(3, {
    message: 'Se pueden analizar máximo 3 imágenes a la vez',
  })
  images: string[];
}

export interface AnalyzeImageResponse {
  suggestedName: string;
  suggestedDescription: string;
  detectedCategory: string;
  suggestedTags: string[];
}
