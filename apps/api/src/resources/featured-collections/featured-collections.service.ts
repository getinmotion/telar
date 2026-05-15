import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { FeaturedCollection } from './entities/featured-collection.entity';
import { MarketplaceKey } from '../marketplace-assignments/entities/marketplace-assignment.entity';
import {
  CreateFeaturedCollectionDto,
  UpdateFeaturedCollectionDto,
} from './dto/create-featured-collection.dto';

@Injectable()
export class FeaturedCollectionsService {
  constructor(
    @Inject('FEATURED_COLLECTIONS_REPOSITORY')
    private readonly repo: Repository<FeaturedCollection>,
  ) {}

  async create(dto: CreateFeaturedCollectionDto): Promise<FeaturedCollection> {
    const collection = this.repo.create({
      ...dto,
      productIds: dto.productIds ?? [],
    });
    return this.repo.save(collection);
  }

  async update(id: string, dto: UpdateFeaturedCollectionDto): Promise<FeaturedCollection> {
    const collection = await this.findOne(id);
    Object.assign(collection, dto);
    return this.repo.save(collection);
  }

  async findAll(marketplaceKey?: MarketplaceKey): Promise<FeaturedCollection[]> {
    const where = marketplaceKey ? { marketplaceKey } : {};
    return this.repo.find({ where, order: { displayOrder: 'ASC', createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<FeaturedCollection> {
    if (!id) throw new BadRequestException('El ID es requerido');
    const collection = await this.repo.findOne({ where: { id } });
    if (!collection) throw new NotFoundException(`Colección con ID ${id} no encontrada`);
    return collection;
  }

  async remove(id: string): Promise<void> {
    const collection = await this.findOne(id);
    await this.repo.remove(collection);
  }

  async reorderProducts(id: string, productIds: string[]): Promise<FeaturedCollection> {
    const collection = await this.findOne(id);
    collection.productIds = productIds;
    return this.repo.save(collection);
  }
}
