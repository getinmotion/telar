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
  ) {}

  // Step 1: Crear Identity One
  async createIdentityOne(
    userId: string,
    dto: CreateArtisansIdentityOneDto,
  ): Promise<ArtisansIdentityProfile> {
    // Crear registro en artisans_identity_one
    const identityOne = this.identityOneRepo.create(dto);
    const savedIdentityOne = await this.identityOneRepo.save(identityOne);

    // Obtener o crear el profile
    let profile = await this.profileRepo.findOne({ where: { userId } });

    if (!profile) {
      // Crear nuevo profile
      profile = this.profileRepo.create({
        userId,
        artisansIdentityId: savedIdentityOne.id,
        createdBy: dto.createdBy,
      });
    } else {
      // Actualizar profile existente
      profile.artisansIdentityId = savedIdentityOne.id;
      profile.updatedBy = dto.createdBy;
    }

    return await this.profileRepo.save(profile);
  }

  // Step 2: Crear Commercial Two
  async createCommercialTwo(
    userId: string,
    dto: CreateArtisansCommercialTwoDto,
  ): Promise<ArtisansIdentityProfile> {
    // Crear registro en artisans_commercial_two
    const commercialTwo = this.commercialTwoRepo.create(dto);
    const savedCommercialTwo = await this.commercialTwoRepo.save(commercialTwo);

    // Obtener o crear el profile
    let profile = await this.profileRepo.findOne({ where: { userId } });

    if (!profile) {
      // Crear nuevo profile
      profile = this.profileRepo.create({
        userId,
        artisansCommercialId: savedCommercialTwo.id,
        createdBy: dto.createdBy,
      });
    } else {
      // Actualizar profile existente
      profile.artisansCommercialId = savedCommercialTwo.id;
      profile.updatedBy = dto.createdBy;
    }

    return await this.profileRepo.save(profile);
  }

  // Step 3: Crear Client Market Three
  async createClientMarketThree(
    userId: string,
    dto: CreateArtisansClientMarketThreeDto,
  ): Promise<ArtisansIdentityProfile> {
    // Crear registro en artisans_client_market_three
    const clientMarketThree = this.clientMarketThreeRepo.create(dto);
    const savedClientMarketThree =
      await this.clientMarketThreeRepo.save(clientMarketThree);

    // Obtener o crear el profile
    let profile = await this.profileRepo.findOne({ where: { userId } });

    if (!profile) {
      // Crear nuevo profile
      profile = this.profileRepo.create({
        userId,
        artisansClientMarketId: savedClientMarketThree.id,
        createdBy: dto.createdBy,
      });
    } else {
      // Actualizar profile existente
      profile.artisansClientMarketId = savedClientMarketThree.id;
      profile.updatedBy = dto.createdBy;
    }

    return await this.profileRepo.save(profile);
  }

  // Step 4: Crear Operation Growth Four
  async createOperationGrowthFour(
    userId: string,
    dto: CreateArtisansOperationGrowthFourDto,
  ): Promise<ArtisansIdentityProfile> {
    // Crear registro en artisans_operation_growth_four
    const operationGrowthFour = this.operationGrowthFourRepo.create(dto);
    const savedOperationGrowthFour =
      await this.operationGrowthFourRepo.save(operationGrowthFour);

    // Obtener o crear el profile
    let profile = await this.profileRepo.findOne({ where: { userId } });

    if (!profile) {
      // Crear nuevo profile
      profile = this.profileRepo.create({
        userId,
        artisansOperationGrowthId: savedOperationGrowthFour.id,
        createdBy: dto.createdBy,
      });
    } else {
      // Actualizar profile existente
      profile.artisansOperationGrowthId = savedOperationGrowthFour.id;
      profile.updatedBy = dto.createdBy;
    }

    return await this.profileRepo.save(profile);
  }

  // GET: Obtener perfil completo por userId
  async getByUserId(userId: string): Promise<ArtisansIdentityProfile> {
    const profile = await this.profileRepo.findOne({
      where: { userId },
      relations: [
        'identityOne',
        'identityOne.category',
        'commercialTwo',
        'clientMarketThree',
        'operationGrowthFour',
      ],
    });

    if (!profile) {
      throw new NotFoundException(
        `Profile not found for user ID: ${userId}`,
      );
    }

    return profile;
  }

  // GET ALL: Listar todos los profiles
  async findAll(): Promise<ArtisansIdentityProfile[]> {
    return await this.profileRepo.find({
      relations: [
        'identityOne',
        'identityOne.category',
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
        'identityOne.category',
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
