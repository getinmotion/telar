import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { StoreHealthScore } from './entities/store-health-score.entity';
import { UpsertStoreHealthScoreDto } from './dto/upsert-store-health-score.dto';

@Injectable()
export class StoreHealthScoresService {
  constructor(
    @Inject('STORE_HEALTH_SCORES_REPOSITORY')
    private readonly repo: Repository<StoreHealthScore>,
  ) {}

  async findByStore(storeId: string): Promise<StoreHealthScore | null> {
    if (!storeId) throw new BadRequestException('storeId es requerido');
    return this.repo.findOne({ where: { storeId } });
  }

  async upsert(dto: UpsertStoreHealthScoreDto): Promise<StoreHealthScore> {
    const existing = await this.repo.findOne({ where: { storeId: dto.storeId } });
    if (existing) {
      Object.assign(existing, dto);
      return this.repo.save(existing);
    }
    const score = this.repo.create(dto);
    return this.repo.save(score);
  }

  /**
   * Recalcula el score determinísticamente a partir de datos del store.
   * Los datos provienen del frontend o del servicio de stores cuando se llama al endpoint.
   */
  async computeAndSave(storeId: string, storeData: Record<string, any>): Promise<StoreHealthScore> {
    if (!storeId) throw new BadRequestException('storeId es requerido');

    const branding = this.computeBranding(storeData);
    const catalog = this.computeCatalog(storeData);
    const narrative = this.computeNarrative(storeData);
    const consistency = this.computeConsistency(storeData);
    const total = branding + catalog + narrative + consistency;

    return this.upsert({
      storeId,
      scoreTotal: total,
      scoreBranding: branding,
      scoreCatalog: catalog,
      scoreNarrative: narrative,
      scoreConsistency: consistency,
    });
  }

  private computeBranding(data: Record<string, any>): number {
    let score = 0;
    if (data.logoUrl) score += 10;
    if (data.coverImageUrl) score += 8;
    if (data.brandName && data.brandName.length > 3) score += 7;
    return Math.min(score, 25);
  }

  private computeCatalog(data: Record<string, any>): number {
    let score = 0;
    const productCount = data.productCount ?? 0;
    if (productCount >= 1) score += 5;
    if (productCount >= 5) score += 5;
    if (productCount >= 10) score += 5;
    if (data.hasApprovedProducts) score += 10;
    return Math.min(score, 25);
  }

  private computeNarrative(data: Record<string, any>): number {
    let score = 0;
    const descLength = (data.description ?? '').length;
    if (descLength > 50) score += 8;
    if (descLength > 200) score += 7;
    if (data.storyText && data.storyText.length > 50) score += 10;
    return Math.min(score, 25);
  }

  private computeConsistency(data: Record<string, any>): number {
    let score = 0;
    if (data.primaryCraftId) score += 8;
    if (data.locationCity) score += 7;
    if (data.contactEmail || data.contactPhone) score += 5;
    if (data.policiesConfigured) score += 5;
    return Math.min(score, 25);
  }

  async findAll(): Promise<StoreHealthScore[]> {
    return this.repo.find({ order: { lastComputedAt: 'DESC' } });
  }

  async findOne(storeId: string): Promise<StoreHealthScore> {
    const score = await this.findByStore(storeId);
    if (!score) throw new NotFoundException(`Score para tienda ${storeId} no encontrado`);
    return score;
  }
}
