import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OnboardingFieldDto<T = unknown> {
  @ApiPropertyOptional()
  value: T | null;

  @ApiPropertyOptional({ enum: ['onboarding', 'profile', 'product', 'manual'] })
  source: string | null;

  @ApiPropertyOptional()
  lastUpdated: string | null;
}

export class OnboardingResponseDto {
  @ApiProperty({ type: () => OnboardingFieldDto })
  name: OnboardingFieldDto<string>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  years_experience: OnboardingFieldDto<string>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  story: OnboardingFieldDto<string>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  meaning: OnboardingFieldDto<string>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  product_category: OnboardingFieldDto<string[]>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  differentiator: OnboardingFieldDto<string>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  learning_origin: OnboardingFieldDto<string>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  price_range: OnboardingFieldDto<string>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  knows_costs: OnboardingFieldDto<boolean>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  pricing_method: OnboardingFieldDto<string>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  feels_profitable: OnboardingFieldDto<boolean>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  target_customer: OnboardingFieldDto<string>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  digital_presence: OnboardingFieldDto<string>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  current_channels: OnboardingFieldDto<string[]>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  sales_frequency: OnboardingFieldDto<string>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  monthly_capacity: OnboardingFieldDto<string>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  main_limitation: OnboardingFieldDto<string>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  work_structure: OnboardingFieldDto<string>;

  @ApiProperty({ type: () => OnboardingFieldDto })
  primary_goal: OnboardingFieldDto<string>;
}
