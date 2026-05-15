import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { ArtisanOrigin } from '../artisan-origin/entities/artisan-origin.entity';
import { ArtisanIdentity } from '../artisan-identity/entities/artisan-identity.entity';
import { UserMasterContext } from '../user-master-context/entities/user-master-context.entity';
import { UpsertOnboardingDto } from './dto/upsert-onboarding.dto';
import { OnboardingResponseDto, OnboardingFieldDto } from './dto/onboarding-response.dto';
import {
  OnboardingBusinessContext,
  OnboardingGoalsContext,
  OnboardingFieldMeta,
  OnboardingSource,
} from './interfaces/onboarding-business-context.interface';

@Injectable()
export class ArtisanOnboardingService {
  constructor(
    @Inject('ARTISAN_PROFILE_REPOSITORY')
    private readonly profileRepo: Repository<UserProfile>,

    @Inject('ARTISAN_ORIGIN_REPOSITORY')
    private readonly originRepo: Repository<ArtisanOrigin>,

    @Inject('ARTISAN_IDENTITY_REPOSITORY')
    private readonly identityRepo: Repository<ArtisanIdentity>,

    @Inject('USER_MASTER_CONTEXT_REPOSITORY')
    private readonly contextRepo: Repository<UserMasterContext>,
  ) {}

  // ─── Read ────────────────────────────────────────────────────────────────

  async getByUserId(userId: string): Promise<OnboardingResponseDto> {
    const [profile, context] = await Promise.all([
      this.profileRepo.findOne({ where: { userId }, relations: ['artisanOrigin'] }),
      this.contextRepo.findOne({ where: { userId } }),
    ]);

    const origin = profile?.artisanOrigin ?? null;
    const identity = profile?.artisanIdentityId
      ? await this.identityRepo.findOne({ where: { id: profile.artisanIdentityId } })
      : null;

    const bc = (context?.businessContext ?? {}) as OnboardingBusinessContext;
    const goals = (context?.goalsAndObjectives ?? {}) as OnboardingGoalsContext;
    const meta = bc._meta ?? {};

    const field = <T>(value: T | null | undefined, key: string): OnboardingFieldDto<T> => ({
      value: value ?? null,
      source: meta[key]?.source ?? null,
      lastUpdated: meta[key]?.lastUpdated ?? null,
    });

    return {
      name:             field(profile?.fullName, 'name'),
      story:            field(origin?.mainStory, 'story'),
      meaning:          field(origin?.culturalMeaning, 'meaning'),
      learning_origin:  field(origin?.learnedFrom, 'learning_origin'),
      differentiator:   field(identity?.uniqueness as string | null, 'differentiator'),
      years_experience: field(bc.years_experience, 'years_experience'),
      product_category: field(bc.product_category, 'product_category'),
      price_range:      field(bc.price_range, 'price_range'),
      knows_costs:      field(bc.knows_costs, 'knows_costs'),
      pricing_method:   field(bc.pricing_method, 'pricing_method'),
      feels_profitable: field(bc.feels_profitable, 'feels_profitable'),
      target_customer:  field(bc.target_customer, 'target_customer'),
      digital_presence: field(bc.digital_presence, 'digital_presence'),
      current_channels: field(bc.current_channels, 'current_channels'),
      sales_frequency:  field(bc.sales_frequency, 'sales_frequency'),
      monthly_capacity: field(bc.monthly_capacity, 'monthly_capacity'),
      main_limitation:  field(bc.main_limitation, 'main_limitation'),
      work_structure:   field(bc.work_structure, 'work_structure'),
      primary_goal:     field(goals.primary_goal, 'primary_goal'),
    };
  }

  // ─── Write ───────────────────────────────────────────────────────────────

  async upsertByUserId(userId: string, dto: UpsertOnboardingDto): Promise<OnboardingResponseDto> {
    const source: OnboardingSource = dto.source ?? 'onboarding';
    const now = new Date().toISOString();

    const profile = await this.profileRepo.findOne({
      where: { userId },
      relations: ['artisanOrigin'],
    });

    if (!profile) {
      throw new NotFoundException(`No artisan profile found for user ${userId}`);
    }

    await Promise.all([
      this.upsertProfileFields(profile, dto, source, now),
      this.upsertContextFields(userId, dto, source, now),
    ]);

    return this.getByUserId(userId);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private async upsertProfileFields(
    profile: UserProfile,
    dto: UpsertOnboardingDto,
    source: OnboardingSource,
    now: string,
  ): Promise<void> {
    const profileUpdates: Partial<UserProfile> = {};

    if (dto.name !== undefined) {
      profileUpdates.fullName = dto.name;
    }

    if (Object.keys(profileUpdates).length > 0) {
      await this.profileRepo.update(profile.id, profileUpdates);
    }

    // artisan_origin fields: story, meaning, learning_origin
    const hasOriginFields = dto.story !== undefined || dto.meaning !== undefined || dto.learning_origin !== undefined;

    if (hasOriginFields) {
      if (profile.artisanOriginId && profile.artisanOrigin) {
        const originUpdates: Partial<ArtisanOrigin> = {};
        if (dto.story !== undefined) originUpdates.mainStory = dto.story;
        if (dto.meaning !== undefined) originUpdates.culturalMeaning = dto.meaning;
        if (dto.learning_origin !== undefined) originUpdates.learnedFrom = dto.learning_origin;
        await this.originRepo.update(profile.artisanOriginId, originUpdates);
      } else {
        // Create new artisan_origin and link to artisan_profile
        const newOrigin = this.originRepo.create({
          mainStory: dto.story ?? null,
          culturalMeaning: dto.meaning ?? null,
          learnedFrom: dto.learning_origin ?? null,
        });
        const saved = await this.originRepo.save(newOrigin);
        await this.profileRepo.update(profile.id, { artisanOriginId: saved.id });
      }
    }

    // artisan_identity fields: differentiator
    if (dto.differentiator !== undefined) {
      if (profile.artisanIdentityId) {
        await this.identityRepo.update(profile.artisanIdentityId, {
          uniqueness: dto.differentiator,
        });
      } else {
        const newIdentity = this.identityRepo.create({
          uniqueness: dto.differentiator,
        });
        const saved = await this.identityRepo.save(newIdentity);
        // artisan_identity_id column exists in DB (via migration) but not in entity yet —
        // write via raw query to avoid TypeORM not knowing the column
        await this.profileRepo.query(
          `UPDATE artesanos.artisan_profile SET artisan_identity_id = $1 WHERE id = $2`,
          [saved.id, profile.id],
        );
      }
    }
  }

  private async upsertContextFields(
    userId: string,
    dto: UpsertOnboardingDto,
    source: OnboardingSource,
    now: string,
  ): Promise<void> {
    const context = await this.contextRepo.findOne({ where: { userId } });
    if (!context) return; // Context is created at registration; skip if missing

    // Merge business_context
    const existingBc = (context.businessContext ?? {}) as OnboardingBusinessContext;
    const existingMeta = existingBc._meta ?? {};

    const BC_FIELDS = [
      'years_experience', 'product_category', 'price_range', 'knows_costs',
      'pricing_method', 'feels_profitable', 'target_customer', 'digital_presence',
      'current_channels', 'sales_frequency', 'monthly_capacity', 'main_limitation',
      'work_structure',
    ] as const;

    const newBcValues: Partial<OnboardingBusinessContext> = {};
    const newMeta: Record<string, OnboardingFieldMeta> = { ...existingMeta };

    for (const key of BC_FIELDS) {
      const val = (dto as Record<string, unknown>)[key];
      if (val !== undefined) {
        (newBcValues as Record<string, unknown>)[key] = val;
        newMeta[key] = { source, lastUpdated: now };
      }
    }

    // Track metadata for non-bc fields too (name, story, meaning, etc.)
    const ORIGIN_FIELDS = ['name', 'story', 'meaning', 'learning_origin', 'differentiator'] as const;
    for (const key of ORIGIN_FIELDS) {
      if ((dto as Record<string, unknown>)[key] !== undefined) {
        newMeta[key] = { source, lastUpdated: now };
      }
    }

    const mergedBc: OnboardingBusinessContext = {
      ...existingBc,
      ...newBcValues,
      _meta: newMeta,
    };

    // Merge goals_and_objectives
    const existingGoals = (context.goalsAndObjectives ?? {}) as OnboardingGoalsContext;
    const mergedGoals: OnboardingGoalsContext =
      dto.primary_goal !== undefined
        ? { ...existingGoals, primary_goal: dto.primary_goal as OnboardingGoalsContext['primary_goal'] }
        : existingGoals;

    await this.contextRepo.update(context.id, {
      businessContext: mergedBc as object,
      ...(dto.primary_goal !== undefined ? { goalsAndObjectives: mergedGoals as object } : {}),
    });
  }
}
