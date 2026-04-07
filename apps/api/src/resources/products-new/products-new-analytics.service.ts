import { Injectable, Inject, Logger } from '@nestjs/common';
import { Repository, DataSource, IsNull, Not } from 'typeorm';
import {
  ProductCore,
  ProductArtisanalIdentity,
  ProductPhysicalSpecs,
  ProductLogistics,
  ProductMedia,
  ProductMaterialLink,
  ProductVariant,
} from './entities';

@Injectable()
export class ProductsNewAnalyticsService {
  private readonly logger = new Logger(ProductsNewAnalyticsService.name);

  constructor(
    @Inject('PRODUCTS_CORE_REPOSITORY')
    private readonly productCoreRepo: Repository<ProductCore>,
    @Inject('PRODUCT_ARTISANAL_IDENTITY_REPOSITORY')
    private readonly identityRepo: Repository<ProductArtisanalIdentity>,
    @Inject('PRODUCT_PHYSICAL_SPECS_REPOSITORY')
    private readonly specsRepo: Repository<ProductPhysicalSpecs>,
    @Inject('PRODUCT_LOGISTICS_REPOSITORY')
    private readonly logisticsRepo: Repository<ProductLogistics>,
    @Inject('PRODUCT_MEDIA_REPOSITORY')
    private readonly mediaRepo: Repository<ProductMedia>,
    @Inject('PRODUCT_MATERIALS_LINK_REPOSITORY')
    private readonly materialsRepo: Repository<ProductMaterialLink>,
    @Inject('PRODUCT_VARIANTS_REPOSITORY')
    private readonly variantsRepo: Repository<ProductVariant>,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
  ) {}

  /**
   * GET /products-new/analytics
   * Retorna todas las stats consolidadas para el panel de analytics
   */
  async getAnalytics() {
    const [
      topMetrics,
      taxonomyDistribution,
      physicalStats,
      completeness,
      storeQuality,
      priceDistribution,
      volumetricAnalysis,
    ] = await Promise.all([
      this.getTopMetrics(),
      this.getTaxonomyDistribution(),
      this.getPhysicalStats(),
      this.getCompleteness(),
      this.getStoreQuality(),
      this.getPriceDistribution(),
      this.getVolumetricAnalysis(),
    ]);

    return {
      topMetrics,
      taxonomyDistribution,
      physicalStats,
      completeness,
      storeQuality,
      priceDistribution,
      volumetricAnalysis,
    };
  }

  // ─── 1. TOP METRICS ─────────────────────────────────────────
  private async getTopMetrics() {
    const [totalProducts, totalStores, totalVariants, totalImages, totalMaterialLinks] =
      await Promise.all([
        this.productCoreRepo.count(),
        this.dataSource.query(
          `SELECT COUNT(DISTINCT store_id) as count FROM shop.products_core WHERE deleted_at IS NULL`,
        ),
        this.variantsRepo.count(),
        this.mediaRepo.count(),
        this.materialsRepo.count(),
      ]);

    return {
      totalProducts,
      totalStores: parseInt(totalStores[0]?.count || '0'),
      totalVariants,
      totalImages,
      totalMaterialLinks,
    };
  }

  // ─── 2. TAXONOMY DISTRIBUTION ───────────────────────────────
  private async getTaxonomyDistribution() {
    const [crafts, techniques, curatorialCategories, materials, pieceTypes, styles, processTypes] =
      await Promise.all([
        this.dataSource.query(`
          SELECT c.name, COUNT(pai.product_id) as count
          FROM shop.product_artisanal_identity pai
          JOIN taxonomy.crafts c ON c.id = pai.primary_craft_id
          WHERE pai.deleted_at IS NULL
          GROUP BY c.name
          ORDER BY count DESC
        `),
        this.dataSource.query(`
          SELECT t.name, COUNT(pai.product_id) as count
          FROM shop.product_artisanal_identity pai
          JOIN taxonomy.techniques t ON t.id = pai.primary_technique_id
          WHERE pai.deleted_at IS NULL
          GROUP BY t.name
          ORDER BY count DESC
        `),
        this.dataSource.query(`
          SELECT cc.name, COUNT(pai.product_id) as count
          FROM shop.product_artisanal_identity pai
          JOIN taxonomy.curatorial_categories cc ON cc.id = pai.curatorial_category_id
          WHERE pai.deleted_at IS NULL
          GROUP BY cc.name
          ORDER BY count DESC
        `),
        this.dataSource.query(`
          SELECT m.name, COUNT(pml.product_id) as count
          FROM shop.product_materials_link pml
          JOIN taxonomy.materials m ON m.id = pml.material_id
          WHERE pml.deleted_at IS NULL
          GROUP BY m.name
          ORDER BY count DESC
        `),
        this.dataSource.query(`
          SELECT piece_type as name, COUNT(product_id) as count
          FROM shop.product_artisanal_identity
          WHERE piece_type IS NOT NULL AND deleted_at IS NULL
          GROUP BY piece_type
        `),
        this.dataSource.query(`
          SELECT style as name, COUNT(product_id) as count
          FROM shop.product_artisanal_identity
          WHERE style IS NOT NULL AND deleted_at IS NULL
          GROUP BY style
        `),
        this.dataSource.query(`
          SELECT process_type as name, COUNT(product_id) as count
          FROM shop.product_artisanal_identity
          WHERE process_type IS NOT NULL AND deleted_at IS NULL
          GROUP BY process_type
        `),
      ]);

    // Count products without craft assigned
    const noCraft = await this.identityRepo.count({
      where: { primaryCraftId: IsNull() },
    });
    const noCuratorialCat = await this.identityRepo.count({
      where: { curatorialCategoryId: IsNull() },
    });

    return {
      crafts: this.parseCountRows(crafts),
      noCraft,
      techniques: this.parseCountRows(techniques),
      curatorialCategories: this.parseCountRows(curatorialCategories),
      noCuratorialCategory: noCuratorialCat,
      materials: this.parseCountRows(materials),
      pieceTypes: this.parseCountRows(pieceTypes),
      styles: this.parseCountRows(styles),
      processTypes: this.parseCountRows(processTypes),
    };
  }

  // ─── 3. PHYSICAL STATS ──────────────────────────────────────
  private async getPhysicalStats() {
    const [specsStats, logisticsStats, fragilityDist, packagingDist, outliers, defaults] =
      await Promise.all([
        this.dataSource.query(`
          SELECT
            COUNT(*) as total,
            ROUND(AVG(height_cm)::numeric, 2) as avg_height,
            ROUND(AVG(width_cm)::numeric, 2) as avg_width,
            ROUND(AVG(length_or_diameter_cm)::numeric, 2) as avg_length,
            ROUND(AVG(real_weight_kg)::numeric, 2) as avg_weight,
            ROUND(MIN(height_cm)::numeric, 2) as min_height,
            ROUND(MIN(width_cm)::numeric, 2) as min_width,
            ROUND(MIN(length_or_diameter_cm)::numeric, 2) as min_length,
            ROUND(MIN(real_weight_kg)::numeric, 2) as min_weight,
            ROUND(MAX(height_cm)::numeric, 2) as max_height,
            ROUND(MAX(width_cm)::numeric, 2) as max_width,
            ROUND(MAX(length_or_diameter_cm)::numeric, 2) as max_length,
            ROUND(MAX(real_weight_kg)::numeric, 2) as max_weight
          FROM shop.product_physical_specs
          WHERE deleted_at IS NULL
        `),
        this.dataSource.query(`
          SELECT
            COUNT(*) as total,
            ROUND(AVG(pack_height_cm)::numeric, 2) as avg_pack_height,
            ROUND(AVG(pack_width_cm)::numeric, 2) as avg_pack_width,
            ROUND(AVG(pack_length_cm)::numeric, 2) as avg_pack_length,
            ROUND(AVG(pack_weight_kg)::numeric, 2) as avg_pack_weight
          FROM shop.product_logistics
          WHERE deleted_at IS NULL
        `),
        this.dataSource.query(`
          SELECT fragility as name, COUNT(*) as count
          FROM shop.product_logistics
          WHERE deleted_at IS NULL
          GROUP BY fragility
        `),
        this.dataSource.query(`
          SELECT packaging_type as name, COUNT(*) as count
          FROM shop.product_logistics
          WHERE packaging_type IS NOT NULL AND deleted_at IS NULL
          GROUP BY packaging_type
        `),
        this.dataSource.query(`
          SELECT COUNT(*) as count
          FROM shop.product_physical_specs
          WHERE deleted_at IS NULL
            AND (real_weight_kg > 10 OR height_cm > 100 OR width_cm > 100 OR length_or_diameter_cm > 100)
        `),
        this.dataSource.query(`
          SELECT COUNT(*) as count
          FROM shop.product_physical_specs
          WHERE deleted_at IS NULL
            AND height_cm = 10 AND width_cm = 10 AND length_or_diameter_cm = 10
        `),
      ]);

    return {
      specs: specsStats[0] || {},
      logistics: logisticsStats[0] || {},
      fragilityDistribution: this.parseCountRows(fragilityDist),
      packagingDistribution: this.parseCountRows(packagingDist),
      outlierCount: parseInt(outliers[0]?.count || '0'),
      defaultDimensionsCount: parseInt(defaults[0]?.count || '0'),
    };
  }

  // ─── 4. COMPLETENESS ───────────────────────────────────────
  private async getCompleteness() {
    const totalProducts = await this.productCoreRepo.count();
    if (totalProducts === 0) return { totalProducts: 0, layers: [] };

    const [
      noHistory,
      noCareNotes,
      totalIdentity,
      noCraft,
      noTech,
      noCuratorialCat,
      prodsWithMats,
      prodsWithImgs,
    ] = await Promise.all([
      this.productCoreRepo
        .createQueryBuilder('pc')
        .where("pc.history IS NULL OR pc.history = ''")
        .getCount(),
      this.productCoreRepo
        .createQueryBuilder('pc')
        .where("pc.careNotes IS NULL OR pc.careNotes = ''")
        .getCount(),
      this.identityRepo.count(),
      this.identityRepo.count({ where: { primaryCraftId: IsNull() } }),
      this.identityRepo.count({ where: { primaryTechniqueId: IsNull() } }),
      this.identityRepo.count({ where: { curatorialCategoryId: IsNull() } }),
      this.dataSource.query(
        `SELECT COUNT(DISTINCT product_id) as count FROM shop.product_materials_link WHERE deleted_at IS NULL`,
      ),
      this.dataSource.query(
        `SELECT COUNT(DISTINCT product_id) as count FROM shop.product_media WHERE deleted_at IS NULL`,
      ),
    ]);

    const withMats = parseInt(prodsWithMats[0]?.count || '0');
    const withImgs = parseInt(prodsWithImgs[0]?.count || '0');

    const layers = [
      this.completenessRow('Core — Historia', totalProducts, totalProducts - noHistory),
      this.completenessRow('Core — Notas Cuidado', totalProducts, totalProducts - noCareNotes),
      this.completenessRow('Identidad — Oficio', totalIdentity || totalProducts, (totalIdentity || totalProducts) - noCraft),
      this.completenessRow('Identidad — Tecnica', totalIdentity || totalProducts, (totalIdentity || totalProducts) - noTech),
      this.completenessRow('Identidad — Cat. Curatorial', totalIdentity || totalProducts, (totalIdentity || totalProducts) - noCuratorialCat),
      this.completenessRow('Materiales (al menos 1)', totalProducts, withMats),
      this.completenessRow('Imagenes (al menos 1)', totalProducts, withImgs),
    ];

    const avgCompleteness = Math.round(
      layers.reduce((sum, l) => sum + l.percentage, 0) / layers.length,
    );

    return { totalProducts, layers, avgCompleteness };
  }

  // ─── 5. STORE QUALITY ──────────────────────────────────────
  private async getStoreQuality() {
    const rows = await this.dataSource.query(`
      SELECT
        s.shop_name as store_name,
        s.id as store_id,
        COUNT(DISTINCT pc.id) as total_products,
        COUNT(DISTINCT pm.product_id) as with_images,
        COUNT(DISTINCT pml.product_id) as with_materials
      FROM shop.artisan_shops s
      JOIN shop.products_core pc ON pc.store_id = s.id AND pc.deleted_at IS NULL
      LEFT JOIN shop.product_media pm ON pm.product_id = pc.id AND pm.deleted_at IS NULL
      LEFT JOIN shop.product_materials_link pml ON pml.product_id = pc.id AND pml.deleted_at IS NULL
      GROUP BY s.id, s.shop_name
      ORDER BY s.shop_name
    `);

    return rows.map((r: any) => ({
      storeName: r.store_name,
      storeId: r.store_id,
      totalProducts: parseInt(r.total_products),
      withImages: parseInt(r.with_images),
      withMaterials: parseInt(r.with_materials),
      pctImages: parseInt(r.total_products) > 0
        ? Math.round((parseInt(r.with_images) / parseInt(r.total_products)) * 100)
        : 0,
      pctMaterials: parseInt(r.total_products) > 0
        ? Math.round((parseInt(r.with_materials) / parseInt(r.total_products)) * 100)
        : 0,
    }));
  }

  // ─── 6. PRICE DISTRIBUTION ─────────────────────────────────
  private async getPriceDistribution() {
    const [stats, cheapCount] = await Promise.all([
      this.dataSource.query(`
        SELECT
          COUNT(*) as total,
          ROUND(AVG(base_price_minor / 100.0)::numeric, 0) as avg_price,
          ROUND(MIN(base_price_minor / 100.0)::numeric, 0) as min_price,
          ROUND(MAX(base_price_minor / 100.0)::numeric, 0) as max_price,
          ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY base_price_minor / 100.0)::numeric, 0) as median_price
        FROM shop.product_variants
        WHERE base_price_minor > 0 AND deleted_at IS NULL
      `),
      this.dataSource.query(`
        SELECT COUNT(*) as count
        FROM shop.product_variants
        WHERE base_price_minor > 0 AND base_price_minor <= 100 AND deleted_at IS NULL
      `),
    ]);

    // Price ranges for histogram
    const ranges = await this.dataSource.query(`
      SELECT
        CASE
          WHEN base_price_minor / 100 < 10000 THEN '< $10,000'
          WHEN base_price_minor / 100 < 50000 THEN '$10,000 - $50,000'
          WHEN base_price_minor / 100 < 100000 THEN '$50,000 - $100,000'
          WHEN base_price_minor / 100 < 200000 THEN '$100,000 - $200,000'
          WHEN base_price_minor / 100 < 500000 THEN '$200,000 - $500,000'
          ELSE '> $500,000'
        END as range,
        COUNT(*) as count
      FROM shop.product_variants
      WHERE base_price_minor > 0 AND deleted_at IS NULL
      GROUP BY range
      ORDER BY MIN(base_price_minor)
    `);

    return {
      stats: stats[0] || {},
      suspiciousCheapCount: parseInt(cheapCount[0]?.count || '0'),
      ranges: this.parseCountRows(ranges, 'range'),
    };
  }

  // ─── 7. VOLUMETRIC ANALYSIS ────────────────────────────────
  private async getVolumetricAnalysis() {
    const rows = await this.dataSource.query(`
      SELECT
        pc.id,
        pc.name as product_name,
        s.shop_name as store_name,
        pps.height_cm,
        pps.width_cm,
        pps.length_or_diameter_cm,
        pps.real_weight_kg,
        pl.pack_weight_kg
      FROM shop.products_core pc
      JOIN shop.product_physical_specs pps ON pps.product_id = pc.id AND pps.deleted_at IS NULL
      LEFT JOIN shop.product_logistics pl ON pl.product_id = pc.id AND pl.deleted_at IS NULL
      JOIN shop.artisan_shops s ON s.id = pc.store_id
      WHERE pc.deleted_at IS NULL
    `);

    let anomalies = 0;
    const anomalyProducts: any[] = [];

    for (const r of rows) {
      const h = parseFloat(r.height_cm || 0);
      const w = parseFloat(r.width_cm || 0);
      const l = parseFloat(r.length_or_diameter_cm || 0);
      const peso = parseFloat(r.real_weight_kg || 0);
      const pack = parseFloat(r.pack_weight_kg || 0);
      const pesoVol = (l * w * h) / 400 || 0.01;
      const isAnomaly = peso > pesoVol * 10 || peso > 50;

      if (isAnomaly) {
        anomalies++;
        anomalyProducts.push({
          id: r.id,
          productName: r.product_name,
          storeName: r.store_name,
          dims: `${h}x${w}x${l}`,
          realWeightKg: Math.round(peso * 1000) / 1000,
          volWeightKg: Math.round(pesoVol * 100) / 100,
          correctedWeightKg: Math.round((peso / 1000) * 1000) / 1000,
          packWeightKg: Math.round(pack * 100) / 100,
        });
      }
    }

    return {
      totalAnalyzed: rows.length,
      anomaliesDetected: anomalies,
      anomalyPercentage:
        rows.length > 0
          ? Math.round((anomalies / rows.length) * 1000) / 10
          : 0,
      anomalyProducts,
    };
  }

  // ─── HELPERS ───────────────────────────────────────────────
  private parseCountRows(rows: any[], nameKey = 'name'): { name: string; count: number }[] {
    return (rows || []).map((r: any) => ({
      name: r[nameKey] || 'Sin asignar',
      count: parseInt(r.count),
    }));
  }

  private completenessRow(layer: string, total: number, complete: number) {
    return {
      layer,
      complete,
      empty: total - complete,
      percentage: total > 0 ? Math.round((complete / total) * 100) : 0,
    };
  }
}
