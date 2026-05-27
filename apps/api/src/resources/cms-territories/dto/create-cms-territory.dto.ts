import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ExtraSectionDto {
  @IsString()
  eyebrow!: string;

  @IsString()
  title!: string;

  @IsString()
  body!: string;
}

export class CreateCmsTerritoryDto {
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be kebab-case (lowercase, digits, hyphens only)',
  })
  slug!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() longDescription?: string;
  @IsOptional() @IsString() culturalTitle?: string;
  @IsOptional() @IsString() culturalQuote?: string;
  @IsOptional() @IsString() ctaHeadline?: string;

  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lng?: number;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsInt() markerSize?: number;
  @IsOptional() @IsString() techniques?: string;
  @IsOptional() @IsString() featuredProductId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExtraSectionDto)
  extraSections?: ExtraSectionDto[];

  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: 'draft' | 'published';

  @IsOptional() @IsString() publishedAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional() @IsInt() position?: number;
}
