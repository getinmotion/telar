import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsIn,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

// ─── Block 1 — Artisan knowledge ────────────────────────────────────────────

export class UpsertOnboardingDto {
  @ApiPropertyOptional({ example: 'María Eugenia López' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ['0-2', '2-4', '4+'] })
  @IsOptional()
  @IsIn(['0-2', '2-4', '4+'])
  years_experience?: '0-2' | '2-4' | '4+';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  story?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  meaning?: string;

  @ApiPropertyOptional({
    isArray: true,
    enum: [
      'textiles', 'jewelry', 'home_decor', 'furniture',
      'tableware', 'art', 'toys', 'bags', 'personal_care',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsIn(
    ['textiles', 'jewelry', 'home_decor', 'furniture', 'tableware', 'art', 'toys', 'bags', 'personal_care'],
    { each: true },
  )
  product_category?: string[];

  @ApiPropertyOptional({ enum: ['technique', 'design', 'materials', 'culture', 'price', 'unclear'] })
  @IsOptional()
  @IsIn(['technique', 'design', 'materials', 'culture', 'price', 'unclear'])
  differentiator?: string;

  @ApiPropertyOptional({ enum: ['family', 'masters', 'academic', 'autodidact', 'mixed'] })
  @IsOptional()
  @IsIn(['family', 'masters', 'academic', 'autodidact', 'mixed'])
  learning_origin?: string;

  // ─── Block 2 — Commercial reality ─────────────────────────────────────────

  @ApiPropertyOptional({ enum: ['<20k', '20-80k', '80-200k', '>200k', 'undefined'] })
  @IsOptional()
  @IsIn(['<20k', '20-80k', '80-200k', '>200k', 'undefined'])
  price_range?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  knows_costs?: boolean;

  @ApiPropertyOptional({ enum: ['copy_others', 'gut_feeling', 'unclear', 'other'] })
  @IsOptional()
  @IsIn(['copy_others', 'gut_feeling', 'unclear', 'other'])
  pricing_method?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  feels_profitable?: boolean;

  // ─── Block 3 — Clients & market ───────────────────────────────────────────

  @ApiPropertyOptional({ enum: ['tourists', 'handmade_lovers', 'gift_buyers', 'designers', 'unclear'] })
  @IsOptional()
  @IsIn(['tourists', 'handmade_lovers', 'gift_buyers', 'designers', 'unclear'])
  target_customer?: string;

  @ApiPropertyOptional({ enum: ['none', 'inactive', 'occasional', 'active'] })
  @IsOptional()
  @IsIn(['none', 'inactive', 'occasional', 'active'])
  digital_presence?: string;

  @ApiPropertyOptional({
    isArray: true,
    enum: ['none', 'social', 'whatsapp', 'fairs', 'own_store', 'marketplace'],
  })
  @IsOptional()
  @IsArray()
  @IsIn(['none', 'social', 'whatsapp', 'fairs', 'own_store', 'marketplace'], { each: true })
  current_channels?: string[];

  @ApiPropertyOptional({ enum: ['none', 'occasional', 'irregular', 'constant'] })
  @IsOptional()
  @IsIn(['none', 'occasional', 'irregular', 'constant'])
  sales_frequency?: string;

  // ─── Block 4 — Operations ─────────────────────────────────────────────────

  @ApiPropertyOptional({ enum: ['<10', '10-30', '30-100', '>100', 'unknown'] })
  @IsOptional()
  @IsIn(['<10', '10-30', '30-100', '>100', 'unknown'])
  monthly_capacity?: string;

  @ApiPropertyOptional({ enum: ['time', 'money', 'materials', 'sales', 'knowledge', 'unclear'] })
  @IsOptional()
  @IsIn(['time', 'money', 'materials', 'sales', 'knowledge', 'unclear'])
  main_limitation?: string;

  @ApiPropertyOptional({ enum: ['solo', 'family', 'small_team', 'collective'] })
  @IsOptional()
  @IsIn(['solo', 'family', 'small_team', 'collective'])
  work_structure?: string;

  @ApiPropertyOptional({ enum: ['better_showcase', 'pricing', 'more_sales', 'organization', 'lost'] })
  @IsOptional()
  @IsIn(['better_showcase', 'pricing', 'more_sales', 'organization', 'lost'])
  primary_goal?: string;

  // ─── Provenance metadata ──────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Source of each field change',
    enum: ['onboarding', 'profile', 'product', 'manual'],
  })
  @IsOptional()
  @IsIn(['onboarding', 'profile', 'product', 'manual'])
  source?: 'onboarding' | 'profile' | 'product' | 'manual';
}
