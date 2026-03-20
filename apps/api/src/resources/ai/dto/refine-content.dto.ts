import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type ContentContext =
  | 'product_name'
  | 'product_description'
  | 'shop_story'
  | 'shop_mission'
  | 'shop_vision'
  | 'shop_description'
  | 'shop_name';

export class RefineContentDto {
  @ApiProperty({
    description: 'Contexto del contenido a refinar',
    enum: [
      'product_name',
      'product_description',
      'shop_story',
      'shop_mission',
      'shop_vision',
      'shop_description',
      'shop_name',
    ],
    example: 'product_description',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'product_name',
    'product_description',
    'shop_story',
    'shop_mission',
    'shop_vision',
    'shop_description',
    'shop_name',
  ])
  context: ContentContext;

  @ApiProperty({
    description: 'Valor actual del contenido a refinar',
    example:
      'Mochila tejida a mano con lana de oveja, muy bonita y resistente',
  })
  @IsString()
  @IsNotEmpty()
  currentValue: string;

  @ApiProperty({
    description: 'Instrucción específica para el refinamiento',
    example: 'Hazlo más comercial y atractivo para clientes potenciales',
  })
  @IsString()
  @IsNotEmpty()
  userPrompt: string;

  @ApiPropertyOptional({
    description: 'Contexto adicional (nombre del producto, cantidad de imágenes, etc.)',
    example: {
      productName: 'Mochila Wayuu',
      hasImages: true,
      imageCount: 3,
    },
  })
  @IsOptional()
  additionalContext?: {
    productName?: string;
    hasImages?: boolean;
    imageCount?: number;
    [key: string]: any;
  };
}

export interface RefineContentResponse {
  refinedContent: string;
}
