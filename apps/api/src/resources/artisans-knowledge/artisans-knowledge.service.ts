import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtisansIdentityOne } from './entities/artisans-identity-one.entity';
import { ArtisansCommercialTwo } from './entities/artisans-commercial-two.entity';
import { ArtisansClientMarketThree } from './entities/artisans-client-market-three.entity';
import { ArtisansOperationGrowthFour } from './entities/artisans-operation-growth-four.entity';
import { ArtisansIdentityProfile } from './entities/artisans-identity-profile.entity';
import { CreateArtisansIdentityOneDto } from './dto/create-artisans-identity-one.dto';
import { CreateArtisansCommercialTwoDto } from './dto/create-artisans-commercial-two.dto';
import { CreateArtisansClientMarketThreeDto } from './dto/create-artisans-client-market-three.dto';
import { CreateArtisansOperationGrowthFourDto } from './dto/create-artisans-operation-growth-four.dto';
import { ArtisansKnowledgeSyncService } from './artisans-knowledge-sync.service';

// Extends the entity shape with a prefill flag for the GET endpoint
export type ArtisansKnowledgeProfileResponse = ArtisansIdentityProfile & {
  prefilled?: boolean;
};

@Injectable()
export class ArtisansKnowledgeService {
  constructor(
    @Inject('ARTISANS_IDENTITY_ONE_REPOSITORY')
    private identityOneRepo: Repository<ArtisansIdentityOne>,
    @Inject('ARTISANS_COMMERCIAL_TWO_REPOSITORY')
    private commercialTwoRepo: Repository<ArtisansCommercialTwo>,
    @Inject('ARTISANS_CLIENT_MARKET_THREE_REPOSITORY')
    private clientMarketThreeRepo: Repository<ArtisansClientMarketThree>,
    @Inject('ARTISANS_OPERATION_GROWTH_FOUR_REPOSITORY')
    private operationGrowthFourRepo: Repository<ArtisansOperationGrowthFour>,
    @Inject('ARTISANS_IDENTITY_PROFILE_REPOSITORY')
    private profileRepo: Repository<ArtisansIdentityProfile>,
    private readonly syncService: ArtisansKnowledgeSyncService,
  ) {}

  // Step 1: Upsert Identity One
  async createIdentityOne(
    userId: string,
    dto: CreateArtisansIdentityOneDto,
  ): Promise<ArtisansIdentityProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });

    if (profile?.artisansIdentityId) {
      await this.identityOneRepo.update(profile.artisansIdentityId, { ...dto, updatedBy: dto.createdBy });
      profile.updatedBy = dto.createdBy;
      await this.profileRepo.save(profile);
    } else {
      const identityOne = this.identityOneRepo.create(dto);
      const savedIdentityOne = await this.identityOneRepo.save(identityOne);

      if (!profile) {
        profile = this.profileRepo.create({
          userId,
          artisansIdentityId: savedIdentityOne.id,
          createdBy: dto.createdBy,
        });
      } else {
        profile.artisansIdentityId = savedIdentityOne.id;
        profile.updatedBy = dto.createdBy;
      }
      await this.profileRepo.save(profile);
    }

    const full = await this.getByUserId(userId);

    // Fire-and-forget sync to Identidad Artesanal
    this.syncService.syncToIdentidad(userId, full).catch(() => {});

    return full;
  }

  // Step 2: Upsert Commercial Two
  async createCommercialTwo(
    userId: string,
    dto: CreateArtisansCommercialTwoDto,
  ): Promise<ArtisansIdentityProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });

    if (profile?.artisansCommercialId) {
      await this.commercialTwoRepo.update(profile.artisansCommercialId, { ...dto, updatedBy: dto.createdBy });
      profile.updatedBy = dto.createdBy;
      await this.profileRepo.save(profile);
    } else {
      const commercialTwo = this.commercialTwoRepo.create(dto);
      const savedCommercialTwo = await this.commercialTwoRepo.save(commercialTwo);

      if (!profile) {
        profile = this.profileRepo.create({
          userId,
          artisansCommercialId: savedCommercialTwo.id,
          createdBy: dto.createdBy,
        });
      } else {
        profile.artisansCommercialId = savedCommercialTwo.id;
        profile.updatedBy = dto.createdBy;
      }
      await this.profileRepo.save(profile);
    }

    const full = await this.getByUserId(userId);

    this.syncService.syncToIdentidad(userId, full).catch(() => {});

    return full;
  }

  // Step 3: Upsert Client Market Three
  async createClientMarketThree(
    userId: string,
    dto: CreateArtisansClientMarketThreeDto,
  ): Promise<ArtisansIdentityProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });

    if (profile?.artisansClientMarketId) {
      await this.clientMarketThreeRepo.update(profile.artisansClientMarketId, { ...dto, updatedBy: dto.createdBy });
      profile.updatedBy = dto.createdBy;
      await this.profileRepo.save(profile);
    } else {
      const clientMarketThree = this.clientMarketThreeRepo.create(dto);
      const savedClientMarketThree = await this.clientMarketThreeRepo.save(clientMarketThree);

      if (!profile) {
        profile = this.profileRepo.create({
          userId,
          artisansClientMarketId: savedClientMarketThree.id,
          createdBy: dto.createdBy,
        });
      } else {
        profile.artisansClientMarketId = savedClientMarketThree.id;
        profile.updatedBy = dto.createdBy;
      }
      await this.profileRepo.save(profile);
    }

    const full = await this.getByUserId(userId);

    this.syncService.syncToIdentidad(userId, full).catch(() => {});

    return full;
  }

  // Step 4: Upsert Operation Growth Four
  async createOperationGrowthFour(
    userId: string,
    dto: CreateArtisansOperationGrowthFourDto,
  ): Promise<ArtisansIdentityProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });

    if (profile?.artisansOperationGrowthId) {
      await this.operationGrowthFourRepo.update(profile.artisansOperationGrowthId, { ...dto, updatedBy: dto.createdBy });
      profile.updatedBy = dto.createdBy;
      await this.profileRepo.save(profile);
    } else {
      const operationGrowthFour = this.operationGrowthFourRepo.create(dto);
      const savedOperationGrowthFour = await this.operationGrowthFourRepo.save(operationGrowthFour);

      if (!profile) {
        profile = this.profileRepo.create({
          userId,
          artisansOperationGrowthId: savedOperationGrowthFour.id,
          createdBy: dto.createdBy,
        });
      } else {
        profile.artisansOperationGrowthId = savedOperationGrowthFour.id;
        profile.updatedBy = dto.createdBy;
      }
      await this.profileRepo.save(profile);
    }

    const full = await this.getByUserId(userId);

    this.syncService.syncToIdentidad(userId, full).catch(() => {});

    return full;
  }

  // GET: Obtener perfil completo por userId
  // Siempre refresca los campos que provienen de Identidad Artesanal (nameShop,
  // artisanHistory, ageExperience, shopCategoriesId, shopBornSpecialDefinitionOne)
  // para garantizar que el growth form nunca muestre datos obsoletos de IA.
  // Los campos propios del knowledge form (shopHistory, shopDescription, shopDefinition,
  // shopSpecialDefinition*) se mantienen tal como el usuario los guardó.
  async getByUserId(userId: string): Promise<ArtisansKnowledgeProfileResponse> {
    const [profile, prefill] = await Promise.all([
      this.profileRepo.findOne({
        where: { userId },
        relations: [
          'identityOne',
          'commercialTwo',
          'clientMarketThree',
          'operationGrowthFour',
        ],
      }),
      this.syncService.prefillFromIdentidad(userId),
    ]);

    if (profile) {
      const merged = Object.assign(profile, { prefilled: false }) as ArtisansKnowledgeProfileResponse;

      if (prefill.prefilled && prefill.step1) {
        if (profile.identityOne) {
          // Sobrescribir SOLO los campos que vienen de Identidad Artesanal
          // (nunca sobreescribir los campos que el usuario edita exclusivamente aquí)
          merged.identityOne = {
            ...profile.identityOne,
            nameShop:                    prefill.step1.nameShop                    ?? profile.identityOne.nameShop,
            artisanHistory:              prefill.step1.artisanHistory              ?? profile.identityOne.artisanHistory,
            ageExperience:               prefill.step1.ageExperience               ?? profile.identityOne.ageExperience,
            shopCategoriesId:            prefill.step1.shopCategoriesId            ?? profile.identityOne.shopCategoriesId,
            shopBornSpecialDefinitionOne: prefill.step1.shopBornSpecialDefinitionOne ?? profile.identityOne.shopBornSpecialDefinitionOne,
          };
          merged.prefilled = true;
        } else {
          merged.identityOne = prefill.step1 as ArtisansIdentityOne;
          merged.prefilled = true;
        }
      }

      // Pasos 2-4: refrescar solo si el paso aún no está guardado
      if (!profile.commercialTwo && prefill.step2) {
        merged.commercialTwo = prefill.step2 as ArtisansCommercialTwo;
        merged.prefilled = true;
      }
      if (!profile.clientMarketThree && prefill.step3) {
        merged.clientMarketThree = prefill.step3 as ArtisansClientMarketThree;
        merged.prefilled = true;
      }
      if (!profile.operationGrowthFour && prefill.step4) {
        merged.operationGrowthFour = prefill.step4 as ArtisansOperationGrowthFour;
        merged.prefilled = true;
      }

      return merged;
    }

    // Sin perfil guardado — devolver datos de Identidad Artesanal como prefill virtual
    if (!prefill.prefilled) {
      throw new NotFoundException(`Profile not found for user ID: ${userId}`);
    }

    const virtual = {
      id: '',
      userId,
      prefilled: true,
      identityOne:          (prefill.step1 ?? null) as ArtisansIdentityOne | null,
      commercialTwo:        (prefill.step2 ?? null) as ArtisansCommercialTwo | null,
      clientMarketThree:    (prefill.step3 ?? null) as ArtisansClientMarketThree | null,
      operationGrowthFour:  (prefill.step4 ?? null) as ArtisansOperationGrowthFour | null,
    } as unknown as ArtisansKnowledgeProfileResponse;

    return virtual;
  }

  // GET ALL: Listar todos los profiles
  async findAll(): Promise<ArtisansIdentityProfile[]> {
    return await this.profileRepo.find({
      relations: [
        'identityOne',
        'commercialTwo',
        'clientMarketThree',
        'operationGrowthFour',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  // GET BY ID: Obtener perfil por ID
  async findOne(id: string): Promise<ArtisansIdentityProfile> {
    const profile = await this.profileRepo.findOne({
      where: { id },
      relations: [
        'identityOne',
        'commercialTwo',
        'clientMarketThree',
        'operationGrowthFour',
      ],
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found with ID: ${id}`);
    }

    return profile;
  }
}
