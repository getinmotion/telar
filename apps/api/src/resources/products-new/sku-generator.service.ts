import { Injectable, Inject, Logger } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { ProductCore } from './entities/product-core.entity';
import { ProductArtisanalIdentity } from './entities/product-artisanal-identity.entity';
import { ProductProduction } from './entities/product-production.entity';
import { Category } from '../categories/entities/category.entity';
import { Technique } from '../techniques/entities/technique.entity';
import { Territory } from '../territories/entities/territory.entity';
import { ArtisanShop } from '../stores/entities/artisan-shop.entity';

export interface SkuSegment {
  code: string;
  name: string;
}

export interface SkuBreakdown {
  sku: string;
  breakdown: {
    category: SkuSegment;
    territory: SkuSegment;
    technique: SkuSegment;
    production: SkuSegment;
    consecutive: string;
  };
}

const PRODUCTION_CODE_MAP: Record<string, { code: string; name: string }> = {
  en_stock: { code: 'CNT', name: 'Producción continua' },
  bajo_pedido: { code: 'BOP', name: 'Bajo pedido' },
  edicion_limitada: { code: 'LTD', name: 'Edición limitada' },
  pieza_unica: { code: 'UNI', name: 'Pieza única' },
};

const FALLBACK: SkuSegment = { code: 'GEN', name: 'General' };

@Injectable()
export class SkuGeneratorService {
  private readonly logger = new Logger(SkuGeneratorService.name);

  constructor(
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    @Inject('PRODUCTS_CORE_REPOSITORY')
    private readonly productCoreRepository: Repository<ProductCore>,
    @Inject('PRODUCT_ARTISANAL_IDENTITY_REPOSITORY')
    private readonly artisanalIdentityRepository: Repository<ProductArtisanalIdentity>,
    @Inject('PRODUCT_PRODUCTION_REPOSITORY')
    private readonly productionRepository: Repository<ProductProduction>,
    @Inject('SKU_CATEGORY_REPOSITORY')
    private readonly categoryRepository: Repository<Category>,
    @Inject('SKU_TECHNIQUE_REPOSITORY')
    private readonly techniqueRepository: Repository<Technique>,
    @Inject('SKU_TERRITORY_REPOSITORY')
    private readonly territoryRepository: Repository<Territory>,
    @Inject('SKU_ARTISAN_SHOP_REPOSITORY')
    private readonly artisanShopRepository: Repository<ArtisanShop>,
  ) {}

  async generateForProduct(productId: string): Promise<SkuBreakdown> {
    const [categorySegment, territorySegment, techniqueSegment, productionSegment] =
      await Promise.all([
        this.resolveCategorySegment(productId),
        this.resolveTerritorySegment(productId),
        this.resolveTechniqueSegment(productId),
        this.resolveProductionSegment(productId),
      ]);

    const consecutive = await this.nextConsecutive();
    const consecutiveStr = consecutive.toString().padStart(6, '0');

    const sku = [
      categorySegment.code,
      territorySegment.code,
      techniqueSegment.code,
      productionSegment.code,
      consecutiveStr,
    ].join('-');

    return {
      sku,
      breakdown: {
        category: categorySegment,
        territory: territorySegment,
        technique: techniqueSegment,
        production: productionSegment,
        consecutive: consecutiveStr,
      },
    };
  }

  explainSku(sku: string): Omit<SkuBreakdown, 'sku'> | null {
    const parts = sku.split('-');
    if (parts.length !== 5) return null;

    const [categoryCode, territoryCode, techniqueCode, productionCode, consecutive] = parts;

    const productionEntry = Object.values(PRODUCTION_CODE_MAP).find(
      (v) => v.code === productionCode,
    );

    return {
      breakdown: {
        category: { code: categoryCode, name: '' },
        territory: { code: territoryCode, name: '' },
        technique: { code: techniqueCode, name: '' },
        production: productionEntry ?? { code: productionCode, name: '' },
        consecutive,
      },
    };
  }

  private async resolveCategorySegment(productId: string): Promise<SkuSegment> {
    const product = await this.productCoreRepository.findOne({
      where: { id: productId },
      select: ['categoryId'],
    });

    if (!product?.categoryId) return FALLBACK;

    const category = await this.categoryRepository.findOne({
      where: { id: product.categoryId },
      select: ['skuCode', 'name'],
    });

    if (!category?.skuCode) return FALLBACK;
    return { code: category.skuCode, name: category.name };
  }

  private async resolveTerritorySegment(productId: string): Promise<SkuSegment> {
    const product = await this.productCoreRepository.findOne({
      where: { id: productId },
      select: ['storeId'],
    });

    if (!product?.storeId) return FALLBACK;

    const shop = await this.artisanShopRepository.findOne({
      where: { id: product.storeId },
      select: ['department'],
    });

    if (!shop?.department) return FALLBACK;

    const territory = await this.territoryRepository
      .createQueryBuilder('t')
      .where('LOWER(t.name) = LOWER(:dept)', { dept: shop.department })
      .select(['t.skuCode', 't.name'])
      .getOne();

    if (!territory?.skuCode) return FALLBACK;
    return { code: territory.skuCode, name: territory.name };
  }

  private async resolveTechniqueSegment(productId: string): Promise<SkuSegment> {
    const identity = await this.artisanalIdentityRepository.findOne({
      where: { productId },
      select: ['primaryTechniqueId'],
    });

    if (!identity?.primaryTechniqueId) return FALLBACK;

    const technique = await this.techniqueRepository.findOne({
      where: { id: identity.primaryTechniqueId },
      select: ['skuCode', 'name'],
    });

    if (!technique?.skuCode) return FALLBACK;
    return { code: technique.skuCode, name: technique.name };
  }

  private async resolveProductionSegment(productId: string): Promise<SkuSegment> {
    const production = await this.productionRepository.findOne({
      where: { productId },
      select: ['availabilityType'],
    });

    if (!production?.availabilityType) return { code: 'CNT', name: 'Producción continua' };

    const mapped = PRODUCTION_CODE_MAP[production.availabilityType];
    return mapped ?? { code: 'CNT', name: 'Producción continua' };
  }

  private async nextConsecutive(): Promise<number> {
    const result = await this.dataSource.query(
      `SELECT nextval('shop.sku_consecutive_seq') AS val`,
    );
    return Number(result[0].val);
  }
}
