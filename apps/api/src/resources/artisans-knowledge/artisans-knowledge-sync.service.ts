import { Injectable, Inject, Logger } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { ArtisansIdentityOne } from './entities/artisans-identity-one.entity';
import { ArtisansCommercialTwo } from './entities/artisans-commercial-two.entity';
import { ArtisansClientMarketThree } from './entities/artisans-client-market-three.entity';
import { ArtisansOperationGrowthFour } from './entities/artisans-operation-growth-four.entity';
import { ArtisansIdentityProfile } from './entities/artisans-identity-profile.entity';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { ArtisanOrigin } from '../artisan-origin/entities/artisan-origin.entity';
import { ArtisanIdentity } from '../artisan-identity/entities/artisan-identity.entity';
import { UserMasterContext } from '../user-master-context/entities/user-master-context.entity';
import { ArtisanShop } from '../artisan-shops/entities/artisan-shop.entity';
import { Category } from '../categories/entities/category.entity';
import {
  OnboardingBusinessContext,
  OnboardingGoalsContext,
} from '../artisan-onboarding/interfaces/onboarding-business-context.interface';

export interface KnowledgePrefillResult {
  prefilled: boolean;
  step1: Partial<Omit<ArtisansIdentityOne, 'id' | 'createdAt' | 'updatedAt' | 'category'>> | null;
  step2: Partial<Omit<ArtisansCommercialTwo, 'id' | 'createdAt' | 'updatedAt'>> | null;
  step3: Partial<Omit<ArtisansClientMarketThree, 'id' | 'createdAt' | 'updatedAt'>> | null;
  step4: Partial<Omit<ArtisansOperationGrowthFour, 'id' | 'createdAt' | 'updatedAt'>> | null;
}

@Injectable()
export class ArtisansKnowledgeSyncService {
  private readonly logger = new Logger(ArtisansKnowledgeSyncService.name);

  constructor(
    // artisans_knowledge repos
    @Inject('ARTISANS_IDENTITY_ONE_REPOSITORY')
    private readonly identityOneRepo: Repository<ArtisansIdentityOne>,
    @Inject('ARTISANS_COMMERCIAL_TWO_REPOSITORY')
    private readonly commercialTwoRepo: Repository<ArtisansCommercialTwo>,
    @Inject('ARTISANS_CLIENT_MARKET_THREE_REPOSITORY')
    private readonly clientMarketThreeRepo: Repository<ArtisansClientMarketThree>,
    @Inject('ARTISANS_OPERATION_GROWTH_FOUR_REPOSITORY')
    private readonly operationGrowthFourRepo: Repository<ArtisansOperationGrowthFour>,
    @Inject('ARTISANS_IDENTITY_PROFILE_REPOSITORY')
    private readonly knowledgeProfileRepo: Repository<ArtisansIdentityProfile>,
    // artisan-onboarding repos
    @Inject('ARTISAN_PROFILE_REPOSITORY')
    private readonly artisanProfileRepo: Repository<UserProfile>,
    @Inject('ARTISAN_ORIGIN_REPOSITORY')
    private readonly artisanOriginRepo: Repository<ArtisanOrigin>,
    @Inject('ARTISAN_IDENTITY_REPOSITORY')
    private readonly artisanIdentityRepo: Repository<ArtisanIdentity>,
    @Inject('USER_MASTER_CONTEXT_REPOSITORY')
    private readonly contextRepo: Repository<UserMasterContext>,
    @Inject('ARTISAN_SHOP_REPOSITORY')
    private readonly artisanShopRepo: Repository<ArtisanShop>,
    @Inject('TAXONOMY_CATEGORIES_REPOSITORY')
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  // ─── Label maps: onboarding enum codes → Spanish form labels ────────────────

  private static readonly BORN_LABELS: Record<string, string> = {
    family:     'Lo heredé de mi familia o comunidad',
    community:  'Lo aprendí de mi comunidad',
    masters:    'Lo aprendí de maestros o procesos tradicionales',
    academic:   'Me formé de manera académica o técnica',
    autodidact: 'Lo desarrollé de forma autodidacta con los años',
    mixed:      'Mezclo tradición, exploración y práctica propia',
    other:      'Otro',
    // legacy values stored by ArtisanProfileWizard
    parents:      'Lo heredé de mi familia o comunidad',
    grandparents: 'Lo heredé de mi familia o comunidad',
    master:       'Lo aprendí de maestros o procesos tradicionales',
    school:       'Me formé de manera académica o técnica',
    'self-taught':'Lo desarrollé de forma autodidacta con los años',
  };

  private static readonly DIFFERENTIATOR_LABELS: Record<string, string> = {
    tecnica_unica:         'Técnica o tradición (cómo lo hago)',
    diseno_propio:         'Diseño o creatividad propia (qué hago)',
    materiales_especiales: 'Materiales únicos o sostenibles',
    raiz_cultural:         'Historia, cultura o territorio',
    precio_justo:          'Precio accesible',
    aun_no_lo_se:          'No lo tengo claro',
    // legacy keys (backwards compatibility)
    technique: 'Técnica o tradición (cómo lo hago)',
    design:    'Diseño o creatividad propia (qué hago)',
    materials: 'Materiales únicos o sostenibles',
    culture:   'Historia, cultura o territorio',
    price:     'Precio accesible',
    unclear:   'No lo tengo claro',
  };

  private static readonly PRICE_RANGE_LABELS: Record<string, string> = {
    '<20k':    'Menos de $20.000',
    '20-80k':  'Entre $20.000 y $80.000',
    '80-200k': 'Entre $80.000 y $200.000',
    '>200k':   'Más de $200.000',
    undefined: 'Varía según el producto',
  };

  private static readonly PRICING_METHOD_LABELS: Record<string, string> = {
    copy_others: 'Copio los precios de otros',
    gut_feeling: 'Cobro lo que me parece justo',
    unclear:     'No tengo claro cómo definirlos',
    other:       'Tengo mi propio método',
  };

  private static readonly TARGET_CUSTOMER_LABELS: Record<string, string> = {
    tourists:        'Turistas',
    handmade_lovers: 'Amantes de lo artesanal',
    gift_buyers:     'Compradores de regalos',
    designers:       'Diseñadores',
    unclear:         'No lo tengo claro',
  };

  private static readonly DIGITAL_PRESENCE_LABELS: Record<string, string> = {
    none:       'No tengo',
    inactive:   'Tengo pero no la uso',
    occasional: 'Estoy empezando',
    active:     'Sí, activa',
  };

  private static readonly CHANNEL_LABELS: Record<string, string> = {
    fairs:       'Ferias y mercados',
    social:      'Redes sociales',
    whatsapp:    'WhatsApp',
    own_store:   'Tienda propia',
    marketplace: 'Marketplace online',
  };

  private static readonly SALES_FREQUENCY_LABELS: Record<string, string> = {
    none:       'Casi no vendo',
    occasional: 'Solo en temporadas',
    irregular:  'Irregular',
    constant:   'Constante',
  };

  private static readonly MONTHLY_CAPACITY_LABELS: Record<string, string> = {
    '<10':    'Menos de 10',
    '10-30':  '10 – 30',
    '30-100': '30 – 100',
    '>100':   'Más de 100',
    unknown:  'Varía mucho',
  };

  private static readonly MAIN_LIMITATION_LABELS: Record<string, string> = {
    time:       'Falta de tiempo',
    money:      'Falta de dinero / capital',
    materials:  'Materiales o herramientas',
    sales:      'Pocos clientes o ventas',
    knowledge:  'Falta de conocimiento o apoyo',
    unclear:    'No lo sé',
  };

  private static readonly WORK_STRUCTURE_LABELS: Record<string, string> = {
    solo:       'Solo yo',
    family:     'Con mi familia',
    small_team: 'Pequeño equipo (2-5)',
    collective: 'Colectivo o taller',
  };

  private static readonly PRIMARY_GOAL_LABELS: Record<string, string> = {
    better_showcase: 'Mostrar mejor mis productos',
    pricing:         'Mejorar mi estrategia de precios',
    more_sales:      'Conseguir más ventas',
    organization:    'Organizar mejor mi negocio',
    lost:            'No sé por dónde empezar',
  };

  private label(map: Record<string, string>, value: string): string {
    return map[value] ?? value;
  }

  private reverseLabel(map: Record<string, string>, label: string): string | undefined {
    return Object.entries(map).find(([, v]) => v === label)?.[0];
  }

  // ─── Prefill knowledge form from existing Identidad Artesanal data ──────────

  async prefillFromIdentidad(userId: string): Promise<KnowledgePrefillResult> {
    try {
      const [profile, context, shop] = await Promise.all([
        this.artisanProfileRepo.findOne({
          where: { userId },
          relations: ['artisanOrigin', 'artisanIdentity'],
        }),
        this.contextRepo.findOne({ where: { userId } }),
        this.artisanShopRepo.findOne({ where: { userId } }),
      ]);

      if (!profile && !context && !shop) {
        return { prefilled: false, step1: null, step2: null, step3: null, step4: null };
      }

      const origin = profile?.artisanOrigin ?? null;
      const identity = profile?.artisanIdentity ?? null;
      const bc = ((context?.businessContext ?? {}) as OnboardingBusinessContext);
      const goals = ((context?.goalsAndObjectives ?? {}) as OnboardingGoalsContext);

      const channels: string[] = Array.isArray(bc.current_channels) ? bc.current_channels : [];

      // ── Step 1 ────────────────────────────────────────────────────────────
      const step1: Partial<Omit<ArtisansIdentityOne, 'id' | 'createdAt' | 'updatedAt' | 'category'>> = {};
      // nameShop ← artisan_shop.shop_name (columna real)
      if (shop?.shopName) step1.nameShop = shop.shopName;
      // artisanHistory ← artisan_shop.artisanProfile.shortBio (Presentación breve del wizard)
      // Fallback a artisan_origin.main_story si shortBio no existe
      const artisanProfileJson = (shop?.artisanProfile as any);
      if (artisanProfileJson?.shortBio) {
        step1.artisanHistory = artisanProfileJson.shortBio;
      } else if (origin?.mainStory) {
        step1.artisanHistory = origin.mainStory;
      }
      // shopHistory ← artisan_origin.cultural_meaning (Block1 "meaning")
      if (origin?.culturalMeaning) step1.shopHistory = origin.culturalMeaning;
      // shopCategoriesId ← business_context.product_category (slugs) → lookup UUIDs en taxonomy.categories
      const productCategorySlugs: string[] = Array.isArray(bc.product_category) ? bc.product_category : [];
      if (productCategorySlugs.length > 0) {
        const cats = await this.categoriesRepo.find({ where: { slug: In(productCategorySlugs) } });
        if (cats.length > 0) step1.shopCategoriesId = cats.map(c => c.id).join(',');
      }
      if (bc.years_experience) {
        // Mapear a valores de WHEN_OPTIONS: 8=niño, 17=juventud, 30=hace algunos años, 40=recientemente
        step1.ageExperience = bc.years_experience === '0-2' ? '40' : bc.years_experience === '2-4' ? '30' : '17';
      }
      if (origin?.learnedFrom) {
        step1.shopBornSpecialDefinitionOne = this.label(ArtisansKnowledgeSyncService.BORN_LABELS, origin.learnedFrom);
      }
      if (identity?.uniqueness) {
        const uniquenessStr = identity.uniqueness as string;
        const diffLabel = ArtisansKnowledgeSyncService.DIFFERENTIATOR_LABELS[uniquenessStr];
        if (diffLabel) {
          // It's an onboarding enum code — map to shopSpecialDefinitionOne
          step1.shopSpecialDefinitionOne = diffLabel;
        } else {
          // It's free text from the profile wizard — use as shopDefinition
          step1.shopDefinition = uniquenessStr;
        }
      }

      // ── Step 2 ────────────────────────────────────────────────────────────
      const step2: Partial<Omit<ArtisansCommercialTwo, 'id' | 'createdAt' | 'updatedAt'>> = {};
      if (bc.price_range) {
        step2.shopRangePayment = this.label(ArtisansKnowledgeSyncService.PRICE_RANGE_LABELS, bc.price_range);
      }
      if (bc.knows_costs !== undefined) {
        step2.shopKnowledgeCost = bc.knows_costs ? 'Sí, los conozco bien' : 'No, no los tengo claros';
      }
      if (bc.pricing_method) {
        step2.shopKnowledgeDefineCost = this.label(ArtisansKnowledgeSyncService.PRICING_METHOD_LABELS, bc.pricing_method);
      }
      if (bc.feels_profitable !== undefined) {
        step2.shopKnowledgeIsProfitable = bc.feels_profitable ? 'Sí, es rentable' : 'No, no lo es';
      }

      // ── Step 3 ────────────────────────────────────────────────────────────
      const step3: Partial<Omit<ArtisansClientMarketThree, 'id' | 'createdAt' | 'updatedAt'>> = {};
      if (bc.target_customer) {
        step3.shopKnowledgeMainBuyerOne = this.label(ArtisansKnowledgeSyncService.TARGET_CUSTOMER_LABELS, bc.target_customer);
      }
      if (bc.digital_presence) {
        step3.shopKnowledgeDigitalPresence = this.label(ArtisansKnowledgeSyncService.DIGITAL_PRESENCE_LABELS, bc.digital_presence);
      }
      const mappedChannels = channels
        .map(c => ArtisansKnowledgeSyncService.CHANNEL_LABELS[c])
        .filter(Boolean) as string[];
      if (mappedChannels[0]) step3.shopKnowledgeWhereSaleOne = mappedChannels[0];
      if (mappedChannels[1]) step3.shopKnowledgeWhereSaleTwo = mappedChannels[1];
      if (mappedChannels[2]) step3.shopKnowledgeWhereSaleThree = mappedChannels[2];
      if (bc.sales_frequency) {
        step3.shopKnowledgeSalesActivity = this.label(ArtisansKnowledgeSyncService.SALES_FREQUENCY_LABELS, bc.sales_frequency);
      }

      // ── Step 4 ────────────────────────────────────────────────────────────
      const step4: Partial<Omit<ArtisansOperationGrowthFour, 'id' | 'createdAt' | 'updatedAt'>> = {};
      if (bc.monthly_capacity) {
        step4.shopKnowledgeProductsMakeMonth = this.label(ArtisansKnowledgeSyncService.MONTHLY_CAPACITY_LABELS, bc.monthly_capacity);
      }
      if (bc.main_limitation) {
        step4.shopKnowledgeLimitTodayOne = this.label(ArtisansKnowledgeSyncService.MAIN_LIMITATION_LABELS, bc.main_limitation);
      }
      if (bc.work_structure) {
        step4.shopManyWorkers = this.label(ArtisansKnowledgeSyncService.WORK_STRUCTURE_LABELS, bc.work_structure);
      }
      if (goals.primary_goal) {
        step4.shopFirstSolvingTelar = this.label(ArtisansKnowledgeSyncService.PRIMARY_GOAL_LABELS, goals.primary_goal);
      }

      const hasData = Object.keys(step1).length > 0 || Object.keys(step2).length > 0
        || Object.keys(step3).length > 0 || Object.keys(step4).length > 0;

      return {
        prefilled: hasData,
        step1: hasData ? step1 : null,
        step2: hasData ? step2 : null,
        step3: hasData ? step3 : null,
        step4: hasData ? step4 : null,
      };
    } catch (err) {
      this.logger.warn(`prefillFromIdentidad failed for user ${userId}: ${err}`);
      return { prefilled: false, step1: null, step2: null, step3: null, step4: null };
    }
  }

  // ─── Sync artisans_knowledge → Identidad Artesanal ──────────────────────────

  async syncToIdentidad(userId: string, profile: ArtisansIdentityProfile): Promise<void> {
    try {
      const [artisanProfile, context] = await Promise.all([
        this.artisanProfileRepo.findOne({
          where: { userId },
          relations: ['artisanOrigin', 'artisanIdentity'],
        }),
        this.contextRepo.findOne({ where: { userId } }),
      ]);

      if (!artisanProfile) return;

      // ── Sync artisan_origin fields ────────────────────────────────────────
      if (profile.identityOne) {
        const originUpdates: Partial<ArtisanOrigin> = {};
        if (profile.identityOne.artisanHistory) originUpdates.mainStory = profile.identityOne.artisanHistory;
        if (profile.identityOne.shopHistory) originUpdates.culturalMeaning = profile.identityOne.shopHistory;
        if (profile.identityOne.shopBornSpecialDefinitionOne) {
          originUpdates.learnedFrom = this.reverseLabel(ArtisansKnowledgeSyncService.BORN_LABELS, profile.identityOne.shopBornSpecialDefinitionOne)
            ?? profile.identityOne.shopBornSpecialDefinitionOne;
        }

        if (Object.keys(originUpdates).length > 0) {
          if (artisanProfile.artisanOriginId) {
            await this.artisanOriginRepo.update(artisanProfile.artisanOriginId, originUpdates);
          } else {
            const newOrigin = this.artisanOriginRepo.create(originUpdates);
            const saved = await this.artisanOriginRepo.save(newOrigin);
            await this.artisanProfileRepo.update(artisanProfile.id, { artisanOriginId: saved.id });
          }
        }

        // ── Sync artisan_identity: shopSpecialDefinitionOne or shopDefinition → uniqueness ───
        const uniquenessValue = profile.identityOne.shopSpecialDefinitionOne
          ? (this.reverseLabel(ArtisansKnowledgeSyncService.DIFFERENTIATOR_LABELS, profile.identityOne.shopSpecialDefinitionOne) ?? profile.identityOne.shopSpecialDefinitionOne)
          : profile.identityOne.shopDefinition;
        if (uniquenessValue) {
          if (artisanProfile.artisanIdentityId) {
            await this.artisanIdentityRepo.update(artisanProfile.artisanIdentityId, {
              uniqueness: uniquenessValue,
            });
          } else {
            const newIdentity = this.artisanIdentityRepo.create({
              uniqueness: uniquenessValue,
            });
            const saved = await this.artisanIdentityRepo.save(newIdentity);
            await this.artisanProfileRepo.query(
              `UPDATE artesanos.artisan_profile SET artisan_identity_id = $1 WHERE id = $2`,
              [saved.id, artisanProfile.id],
            );
          }
        }
      }

      // ── Sync business_context JSONB ────────────────────────────────────────
      if (!context) return;

      const existingBc = (context.businessContext ?? {}) as OnboardingBusinessContext;
      const existingMeta = existingBc._meta ?? {};
      const now = new Date().toISOString();
      const source = 'onboarding' as const;

      const newValues: Partial<OnboardingBusinessContext> = {};
      const newMeta: typeof existingMeta = { ...existingMeta };

      if (profile.identityOne?.ageExperience) {
        const exp = profile.identityOne.ageExperience;
        // WHEN_OPTIONS: 8=niño(4+años exp), 17=juventud(4+), 30=hace algunos años(2-4), 40=recientemente(0-2)
        const expNum = Number(exp);
        const mapped = expNum >= 35 ? '0-2' : expNum >= 25 ? '2-4' : '4+';
        newValues.years_experience = mapped as OnboardingBusinessContext['years_experience'];
        newMeta['years_experience'] = { source, lastUpdated: now };
      }

      if (profile.commercialTwo) {
        if (profile.commercialTwo.shopRangePayment) {
          const code = this.reverseLabel(ArtisansKnowledgeSyncService.PRICE_RANGE_LABELS, profile.commercialTwo.shopRangePayment);
          if (code) {
            newValues.price_range = code as OnboardingBusinessContext['price_range'];
            newMeta['price_range'] = { source, lastUpdated: now };
          }
        }
        if (profile.commercialTwo.shopKnowledgeCost) {
          const v = profile.commercialTwo.shopKnowledgeCost.toLowerCase();
          newValues.knows_costs = v.startsWith('sí') || v.startsWith('si') || v.startsWith('yes');
          newMeta['knows_costs'] = { source, lastUpdated: now };
        }
        if (profile.commercialTwo.shopKnowledgeDefineCost) {
          const code = this.reverseLabel(ArtisansKnowledgeSyncService.PRICING_METHOD_LABELS, profile.commercialTwo.shopKnowledgeDefineCost);
          if (code) {
            newValues.pricing_method = code as OnboardingBusinessContext['pricing_method'];
            newMeta['pricing_method'] = { source, lastUpdated: now };
          }
        }
        if (profile.commercialTwo.shopKnowledgeIsProfitable) {
          const v = profile.commercialTwo.shopKnowledgeIsProfitable.toLowerCase();
          newValues.feels_profitable = v.startsWith('sí') || v.startsWith('si') || v.startsWith('yes');
          newMeta['feels_profitable'] = { source, lastUpdated: now };
        }
      }

      if (profile.clientMarketThree) {
        if (profile.clientMarketThree.shopKnowledgeMainBuyerOne) {
          const code = this.reverseLabel(ArtisansKnowledgeSyncService.TARGET_CUSTOMER_LABELS, profile.clientMarketThree.shopKnowledgeMainBuyerOne);
          if (code) {
            newValues.target_customer = code as OnboardingBusinessContext['target_customer'];
            newMeta['target_customer'] = { source, lastUpdated: now };
          }
        }
        if (profile.clientMarketThree.shopKnowledgeDigitalPresence) {
          const code = this.reverseLabel(ArtisansKnowledgeSyncService.DIGITAL_PRESENCE_LABELS, profile.clientMarketThree.shopKnowledgeDigitalPresence);
          if (code) {
            newValues.digital_presence = code as OnboardingBusinessContext['digital_presence'];
            newMeta['digital_presence'] = { source, lastUpdated: now };
          }
        }
        const channelLabels = [
          profile.clientMarketThree.shopKnowledgeWhereSaleOne,
          profile.clientMarketThree.shopKnowledgeWhereSaleTwo,
          profile.clientMarketThree.shopKnowledgeWhereSaleThree,
        ].filter(Boolean) as string[];
        const channelCodes = channelLabels
          .map(l => this.reverseLabel(ArtisansKnowledgeSyncService.CHANNEL_LABELS, l))
          .filter(Boolean) as string[];
        if (channelCodes.length) {
          newValues.current_channels = channelCodes;
          newMeta['current_channels'] = { source, lastUpdated: now };
        }
        if (profile.clientMarketThree.shopKnowledgeSalesActivity) {
          const code = this.reverseLabel(ArtisansKnowledgeSyncService.SALES_FREQUENCY_LABELS, profile.clientMarketThree.shopKnowledgeSalesActivity);
          if (code) {
            newValues.sales_frequency = code as OnboardingBusinessContext['sales_frequency'];
            newMeta['sales_frequency'] = { source, lastUpdated: now };
          }
        }
      }

      if (profile.operationGrowthFour) {
        if (profile.operationGrowthFour.shopKnowledgeProductsMakeMonth) {
          const code = this.reverseLabel(ArtisansKnowledgeSyncService.MONTHLY_CAPACITY_LABELS, profile.operationGrowthFour.shopKnowledgeProductsMakeMonth);
          if (code) {
            newValues.monthly_capacity = code as OnboardingBusinessContext['monthly_capacity'];
            newMeta['monthly_capacity'] = { source, lastUpdated: now };
          }
        }
        if (profile.operationGrowthFour.shopKnowledgeLimitTodayOne) {
          const code = this.reverseLabel(ArtisansKnowledgeSyncService.MAIN_LIMITATION_LABELS, profile.operationGrowthFour.shopKnowledgeLimitTodayOne);
          if (code) {
            newValues.main_limitation = code as OnboardingBusinessContext['main_limitation'];
            newMeta['main_limitation'] = { source, lastUpdated: now };
          }
        }
        if (profile.operationGrowthFour.shopManyWorkers) {
          const code = this.reverseLabel(ArtisansKnowledgeSyncService.WORK_STRUCTURE_LABELS, profile.operationGrowthFour.shopManyWorkers);
          if (code) {
            newValues.work_structure = code as OnboardingBusinessContext['work_structure'];
            newMeta['work_structure'] = { source, lastUpdated: now };
          }
        }
      }

      if (Object.keys(newValues).length > 0) {
        const mergedBc: OnboardingBusinessContext = { ...existingBc, ...newValues, _meta: newMeta };
        await this.contextRepo.update(context.id, { businessContext: mergedBc as object });
      }
    } catch (err) {
      this.logger.warn(`syncToIdentidad failed for user ${userId}: ${err}`);
    }
  }

  // ─── Sync Identidad Artesanal → artisans_knowledge ──────────────────────────

  async syncToKnowledge(userId: string): Promise<void> {
    try {
      const knowledgeProfile = await this.knowledgeProfileRepo.findOne({
        where: { userId },
        relations: ['identityOne', 'commercialTwo', 'clientMarketThree', 'operationGrowthFour'],
      });

      if (!knowledgeProfile) return; // Only sync if knowledge profile already exists

      const [artisanProfile, context, shop] = await Promise.all([
        this.artisanProfileRepo.findOne({
          where: { userId },
          relations: ['artisanOrigin', 'artisanIdentity'],
        }),
        this.contextRepo.findOne({ where: { userId } }),
        this.artisanShopRepo.findOne({ where: { userId } }),
      ]);

      if (!artisanProfile) return;

      const origin = artisanProfile.artisanOrigin;
      const identity = artisanProfile.artisanIdentity;
      const bc = ((context?.businessContext ?? {}) as OnboardingBusinessContext);
      const goals = ((context?.goalsAndObjectives ?? {}) as OnboardingGoalsContext);
      const channels: string[] = Array.isArray(bc.current_channels) ? bc.current_channels : [];

      // ── Update artisans_identity_one ─────────────────────────────────────
      if (knowledgeProfile.artisansIdentityId) {
        const updates: Partial<ArtisansIdentityOne> = {};
        // nameShop ← artisan_shop.shop_name
        if (shop?.shopName) updates.nameShop = shop.shopName;
        // artisanHistory ← artisan_shop.artisanProfile.shortBio; fallback a main_story
        const syncProfileJson = (shop?.artisanProfile as any);
        if (syncProfileJson?.shortBio) {
          updates.artisanHistory = syncProfileJson.shortBio;
        } else if (origin?.mainStory) {
          updates.artisanHistory = origin.mainStory;
        }
        // shopHistory ← artisan_origin.cultural_meaning
        if (origin?.culturalMeaning) updates.shopHistory = origin.culturalMeaning;
        // shopCategoriesId ← business_context.product_category → UUIDs
        const syncSlugs: string[] = Array.isArray(bc.product_category) ? bc.product_category : [];
        if (syncSlugs.length > 0) {
          const cats = await this.categoriesRepo.find({ where: { slug: In(syncSlugs) } });
          if (cats.length > 0) updates.shopCategoriesId = cats.map(c => c.id).join(',');
        }
        if (bc.years_experience) {
          updates.ageExperience = bc.years_experience === '0-2' ? '40' : bc.years_experience === '2-4' ? '30' : '17';
        }
        if (origin?.learnedFrom) {
          updates.shopBornSpecialDefinitionOne = this.label(ArtisansKnowledgeSyncService.BORN_LABELS, origin.learnedFrom);
        }
        if (identity?.uniqueness) {
          const uniquenessStr = identity.uniqueness as string;
          const diffLabel = ArtisansKnowledgeSyncService.DIFFERENTIATOR_LABELS[uniquenessStr];
          if (diffLabel) {
            updates.shopSpecialDefinitionOne = diffLabel;
          } else {
            updates.shopDefinition = uniquenessStr;
          }
        }
        if (Object.keys(updates).length) {
          await this.identityOneRepo.update(knowledgeProfile.artisansIdentityId, updates);
        }
      }

      // ── Update artisans_commercial_two ───────────────────────────────────
      if (knowledgeProfile.artisansCommercialId) {
        const updates: Partial<ArtisansCommercialTwo> = {};
        if (bc.price_range) {
          updates.shopRangePayment = this.label(ArtisansKnowledgeSyncService.PRICE_RANGE_LABELS, bc.price_range);
        }
        if (bc.knows_costs !== undefined) {
          updates.shopKnowledgeCost = bc.knows_costs ? 'Sí, los conozco bien' : 'No, no los tengo claros';
        }
        if (bc.pricing_method) {
          updates.shopKnowledgeDefineCost = this.label(ArtisansKnowledgeSyncService.PRICING_METHOD_LABELS, bc.pricing_method);
        }
        if (bc.feels_profitable !== undefined) {
          updates.shopKnowledgeIsProfitable = bc.feels_profitable ? 'Sí, es rentable' : 'No, no lo es';
        }
        if (Object.keys(updates).length) {
          await this.commercialTwoRepo.update(knowledgeProfile.artisansCommercialId, updates);
        }
      }

      // ── Update artisans_client_market_three ──────────────────────────────
      if (knowledgeProfile.artisansClientMarketId) {
        const updates: Partial<ArtisansClientMarketThree> = {};
        if (bc.target_customer) {
          updates.shopKnowledgeMainBuyerOne = this.label(ArtisansKnowledgeSyncService.TARGET_CUSTOMER_LABELS, bc.target_customer);
        }
        if (bc.digital_presence) {
          updates.shopKnowledgeDigitalPresence = this.label(ArtisansKnowledgeSyncService.DIGITAL_PRESENCE_LABELS, bc.digital_presence);
        }
        const mappedChannels = channels.map(c => ArtisansKnowledgeSyncService.CHANNEL_LABELS[c]).filter(Boolean) as string[];
        if (mappedChannels[0]) updates.shopKnowledgeWhereSaleOne = mappedChannels[0];
        if (mappedChannels[1]) updates.shopKnowledgeWhereSaleTwo = mappedChannels[1];
        if (mappedChannels[2]) updates.shopKnowledgeWhereSaleThree = mappedChannels[2];
        if (bc.sales_frequency) {
          updates.shopKnowledgeSalesActivity = this.label(ArtisansKnowledgeSyncService.SALES_FREQUENCY_LABELS, bc.sales_frequency);
        }
        if (Object.keys(updates).length) {
          await this.clientMarketThreeRepo.update(knowledgeProfile.artisansClientMarketId, updates);
        }
      }

      // ── Update artisans_operation_growth_four ────────────────────────────
      if (knowledgeProfile.artisansOperationGrowthId) {
        const updates: Partial<ArtisansOperationGrowthFour> = {};
        if (bc.monthly_capacity) {
          updates.shopKnowledgeProductsMakeMonth = this.label(ArtisansKnowledgeSyncService.MONTHLY_CAPACITY_LABELS, bc.monthly_capacity);
        }
        if (bc.main_limitation) {
          updates.shopKnowledgeLimitTodayOne = this.label(ArtisansKnowledgeSyncService.MAIN_LIMITATION_LABELS, bc.main_limitation);
        }
        if (bc.work_structure) {
          updates.shopManyWorkers = this.label(ArtisansKnowledgeSyncService.WORK_STRUCTURE_LABELS, bc.work_structure);
        }
        if (goals.primary_goal) {
          updates.shopFirstSolvingTelar = this.label(ArtisansKnowledgeSyncService.PRIMARY_GOAL_LABELS, goals.primary_goal);
        }
        if (Object.keys(updates).length) {
          await this.operationGrowthFourRepo.update(knowledgeProfile.artisansOperationGrowthId, updates);
        }
      }
    } catch (err) {
      this.logger.warn(`syncToKnowledge failed for user ${userId}: ${err}`);
    }
  }
}
