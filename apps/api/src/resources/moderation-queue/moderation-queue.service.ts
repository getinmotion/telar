import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { QueueScore, QueueItemType } from './entities/queue-score.entity';
import { UpsertQueueScoreDto } from './dto/upsert-queue-score.dto';

@Injectable()
export class ModerationQueueService {
  constructor(
    @Inject('QUEUE_SCORE_REPOSITORY')
    private readonly queueScoreRepository: Repository<QueueScore>,
  ) {}

  async upsertScore(dto: UpsertQueueScoreDto): Promise<QueueScore> {
    const existing = await this.queueScoreRepository.findOne({
      where: { itemId: dto.itemId, itemType: dto.itemType as QueueItemType },
    });

    if (existing) {
      Object.assign(existing, dto);
      return this.queueScoreRepository.save(existing);
    }

    const score = this.queueScoreRepository.create({
      ...dto,
      itemType: dto.itemType as QueueItemType,
      priorityScore: dto.priorityScore ?? 0,
      riskScore: dto.riskScore ?? 0,
      commercialScore: dto.commercialScore ?? 0,
      scoreReasons: dto.scoreReasons ?? {},
    });
    return this.queueScoreRepository.save(score);
  }

  async findByItemId(itemId: string): Promise<QueueScore | null> {
    return this.queueScoreRepository.findOne({ where: { itemId } });
  }

  async findByItemIds(itemIds: string[]): Promise<QueueScore[]> {
    if (itemIds.length === 0) return [];
    return this.queueScoreRepository
      .createQueryBuilder('qs')
      .where('qs.item_id = ANY(:ids)', { ids: itemIds })
      .getMany();
  }

  async deleteByItemId(itemId: string): Promise<void> {
    await this.queueScoreRepository.delete({ itemId });
  }

  /**
   * Calcula y persiste los scores para un producto.
   * Reglas deterministas basadas en completitud y estado.
   */
  async computeAndSaveProductScore(product: {
    id: string;
    status: string;
    name: string;
    shortDescription?: string | null;
    history?: string | null;
    media?: { mediaUrl: string; mediaType: string }[];
    materials?: unknown[];
    artisanalIdentity?: { primaryCraftId?: string; primaryTechniqueId?: string } | null;
    physicalSpecs?: unknown | null;
    categoryId?: string | null;
    createdAt: string;
  }): Promise<QueueScore> {
    let priorityScore = 0;
    let riskScore = 0;
    const reasons: Record<string, string[]> = { priority: [], risk: [], commercial: [] };

    // Priority: estado
    if (product.status === 'pending_moderation') {
      priorityScore += 30;
      reasons.priority.push('pending_moderation +30');
    }
    if (product.status === 'changes_requested') {
      priorityScore += 25;
      reasons.priority.push('changes_requested resubmit +25');
    }

    // Risk: completitud
    const images = product.media?.filter((m) => m.mediaType === 'image') ?? [];
    if (images.length === 0) {
      riskScore += 25;
      reasons.risk.push('sin_imagenes +25');
    } else if (images.length < 3) {
      riskScore += 10;
      reasons.risk.push('pocas_imagenes +10');
    }

    if (!product.categoryId) {
      riskScore += 20;
      reasons.risk.push('sin_categoria +20');
    }

    const descLen = (product.shortDescription ?? '').trim().length;
    if (descLen === 0) {
      riskScore += 15;
      reasons.risk.push('sin_descripcion +15');
    } else if (descLen < 50) {
      riskScore += 8;
      reasons.risk.push('descripcion_corta +8');
    }

    if (!product.materials || product.materials.length === 0) {
      riskScore += 10;
      reasons.risk.push('sin_materiales +10');
    }

    if (!product.artisanalIdentity?.primaryCraftId) {
      riskScore += 10;
      reasons.risk.push('sin_oficio +10');
    }

    if (!product.physicalSpecs) {
      riskScore += 10;
      reasons.risk.push('sin_dimensiones +10');
    }

    // Commercial: antigüedad favorece a productos más recientes
    const ageHours = (Date.now() - new Date(product.createdAt).getTime()) / 3600000;
    if (ageHours < 48) {
      priorityScore += 15;
      reasons.priority.push('recien_creado +15');
    }

    return this.upsertScore({
      itemId: product.id,
      itemType: 'product',
      priorityScore: Math.min(priorityScore, 100),
      riskScore: Math.min(riskScore, 100),
      commercialScore: 0,
      scoreReasons: reasons,
    });
  }

  /**
   * Calcula y persiste los scores para una tienda.
   */
  async computeAndSaveShopScore(shop: {
    id: string;
    marketplaceApproved: boolean | null;
    publishStatus: string | null;
    description: string | null;
    logoUrl: string | null;
    idContraparty: string | null;
    createdAt: string;
    approvedProductCount?: number;
  }): Promise<QueueScore> {
    let priorityScore = 0;
    let riskScore = 0;
    let commercialScore = 0;
    const reasons: Record<string, string[]> = { priority: [], risk: [], commercial: [] };

    // Priority: lista para publicar
    if (shop.approvedProductCount && shop.approvedProductCount >= 5 && !shop.marketplaceApproved) {
      priorityScore += 40;
      reasons.priority.push('lista_para_publicar +40');
    }

    if (!shop.idContraparty) {
      riskScore += 20;
      reasons.risk.push('sin_datos_bancarios +20');
    } else {
      commercialScore += 30;
      reasons.commercial.push('tiene_datos_bancarios +30');
    }

    if (!shop.logoUrl) {
      riskScore += 15;
      reasons.risk.push('sin_logo +15');
    }

    if (!shop.description || shop.description.trim().length < 50) {
      riskScore += 15;
      reasons.risk.push('descripcion_insuficiente +15');
    }

    if (shop.approvedProductCount && shop.approvedProductCount > 0) {
      commercialScore += Math.min(shop.approvedProductCount * 5, 30);
      reasons.commercial.push(`${shop.approvedProductCount}_productos_aprobados`);
    }

    return this.upsertScore({
      itemId: shop.id,
      itemType: 'shop',
      priorityScore: Math.min(priorityScore, 100),
      riskScore: Math.min(riskScore, 100),
      commercialScore: Math.min(commercialScore, 100),
      scoreReasons: reasons,
    });
  }
}
