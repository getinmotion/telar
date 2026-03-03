import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Acciones disponibles del CMS
 */
export enum CmsAction {
  HERO_SLIDES = 'hero-slides',
  EDITORIAL_STORIES = 'editorial-stories',
  STATS = 'stats',
  NEWSLETTER = 'newsletter',
  CATEGORIES = 'categories',
  BLOG_ARTICLES = 'blog-articles',
  BLOG_ARTICLE = 'blog-article',
  LEGAL_PAGE = 'legal-page',
  PAGE_HEADER = 'page-header',
}

export class CmsRequestDto {
  @ApiProperty({
    description: 'Acción a ejecutar en el CMS',
    enum: CmsAction,
    example: CmsAction.HERO_SLIDES,
  })
  @IsEnum(CmsAction)
  action: CmsAction;

  @ApiPropertyOptional({
    description: 'Slug del contenido (requerido para algunas acciones)',
    example: 'terminos',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 10,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  per_page?: number = 10;
}
