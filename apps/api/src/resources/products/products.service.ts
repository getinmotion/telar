import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { Repository, SelectQueryBuilder, Not, In, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import {
  ProductCore,
  ProductArtisanalIdentity,
  ProductMaterialLink,
  ProductPhysicalSpecs,
  ProductProduction,
  ProductMedia,
  ProductVariantV2,
} from './entities/v2/product-core.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductV2Dto } from './dto/create-product-v2.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsQueryDto } from './dto/products-query.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @Inject('PRODUCTS_REPOSITORY')
    private readonly productsRepository: Repository<Product>,
    @Inject('PRODUCT_CORE_REPOSITORY')
    private readonly productCoreRepo: Repository<ProductCore>,
    @Inject('PRODUCT_ARTISANAL_IDENTITY_REPOSITORY')
    private readonly artisanalIdentityRepo: Repository<ProductArtisanalIdentity>,
    @Inject('PRODUCT_PHYSICAL_SPECS_REPOSITORY')
    private readonly physicalSpecsRepo: Repository<ProductPhysicalSpecs>,
    @Inject('PRODUCT_PRODUCTION_REPOSITORY')
    private readonly productionRepo: Repository<ProductProduction>,
    @Inject('PRODUCT_MEDIA_REPOSITORY')
    private readonly mediaRepo: Repository<ProductMedia>,
    @Inject('PRODUCT_VARIANT_V2_REPOSITORY')
    private readonly variantV2Repo: Repository<ProductVariantV2>,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crear un nuevo producto
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Validar SKU único si se proporciona
    if (createProductDto.sku) {
      const existingSku = await this.productsRepository.findOne({
        where: { sku: createProductDto.sku },
      });

      if (existingSku) {
        throw new ConflictException(
          `Ya existe un producto con el SKU ${createProductDto.sku}`,
        );
      }
    }

    const newProduct = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(newProduct);
  }

  /**
   * Crear producto v2 — escribe directamente en shop.products_core
   * y sus tablas relacionadas (identidad artesanal, materiales,
   * especificaciones, producción, media, variantes).
   *
   * Usa una transacción para garantizar consistencia.
   * Los campos que requieren UUIDs de catálogos (craft_id, technique_id,
   * material_id) se dejan null por ahora — el frontend envía strings
   * descriptivos que se almacenan de forma provisional.
   */
  async createV2(dto: CreateProductV2Dto): Promise<ProductCore> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Crear el producto core (con metadata provisional para care tags, proposals, curatorial)
      const metadata: Record<string, any> = {};
      if (dto.careTags?.length) {
        metadata.careTags = dto.careTags;
      }
      if (dto.taxonomyProposals?.length) {
        metadata.taxonomyProposals = dto.taxonomyProposals;
      }
      if (dto.curatorialRequest) {
        metadata.curatorialRequest = dto.curatorialRequest;
      }

      const core = manager.create(ProductCore, {
        storeId: dto.shopId,
        name: dto.name,
        shortDescription: dto.shortDescription,
        history: dto.history ?? null,
        careNotes: dto.careNotes ?? null,
        categoryId: dto.categoryId ?? null,
        status: 'draft',
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
      });
      const savedCore = await manager.save(ProductCore, core);
      const productId = savedCore.id;

      // 2. Identidad artesanal (provisional: craft/technique como texto en estimatedElaborationTime, ids null)
      if (dto.artisanalIdentity) {
        const ai = dto.artisanalIdentity;
        const identity = manager.create(ProductArtisanalIdentity, {
          productId,
          pieceType: ai.pieceType ?? null,
          style: ai.style ?? null,
          processType: ai.processType ?? null,
          estimatedElaborationTime: ai.estimatedElaborationTime ?? null,
          isCollaboration: ai.isCollaboration ?? false,
          // IDs de catálogo quedan null por ahora — provisional
          primaryCraftId: null,
          primaryTechniqueId: null,
          secondaryTechniqueId: null,
          curatorialCategoryId: null,
        });
        await manager.save(ProductArtisanalIdentity, identity);

        // Guardar los nombres de craft/technique como metadata en el core.history
        // para no perder la info hasta que se resuelvan los IDs
        if (ai.craft || ai.primaryTechnique) {
          const metaNote = [
            ai.craft && `[craft:${ai.craft}]`,
            ai.primaryTechnique && `[technique:${ai.primaryTechnique}]`,
            ai.secondaryTechnique && `[technique2:${ai.secondaryTechnique}]`,
          ]
            .filter(Boolean)
            .join(' ');

          savedCore.careNotes = savedCore.careNotes
            ? `${savedCore.careNotes}\n---\n${metaNote}`
            : metaNote;
          await manager.save(ProductCore, savedCore);
        }
      }

      // 3. Especificaciones físicas
      if (dto.physicalSpecs) {
        const ps = dto.physicalSpecs;
        if (ps.heightCm || ps.widthCm || ps.lengthOrDiameterCm || ps.realWeightKg) {
          const specs = manager.create(ProductPhysicalSpecs, {
            productId,
            heightCm: ps.heightCm ?? null,
            widthCm: ps.widthCm ?? null,
            lengthOrDiameterCm: ps.lengthOrDiameterCm ?? null,
            realWeightKg: ps.realWeightKg ?? null,
          });
          await manager.save(ProductPhysicalSpecs, specs);
        }
      }

      // 4. Producción
      if (dto.production) {
        const prod = manager.create(ProductProduction, {
          productId,
          availabilityType: dto.production.availabilityType,
          productionTimeDays: dto.production.productionTimeDays ?? null,
          monthlyCapacity: dto.production.monthlyCapacity ?? null,
          requirementsToStart: dto.production.requirementsToStart ?? null,
        });
        await manager.save(ProductProduction, prod);
      }

      // 5. Materiales (provisional: sin IDs, guardados en metadata)
      if (dto.materials?.length) {
        const existingMeta = savedCore.metadata ?? {};
        existingMeta.materials = dto.materials;
        savedCore.metadata = existingMeta;
        await manager.save(ProductCore, savedCore);
      }

      // 6. Imágenes (media)
      if (dto.images?.length) {
        const mediaEntities = dto.images.map((url, idx) =>
          manager.create(ProductMedia, {
            productId,
            mediaUrl: url,
            mediaType: 'image',
            isPrimary: idx === 0,
            displayOrder: idx,
          }),
        );
        await manager.save(ProductMedia, mediaEntities);
      }

      // 7. Variantes (o crear una variante default con el precio)
      const variantsToCreate =
        dto.variants?.length
          ? dto.variants
          : dto.price
          ? [{ basePriceMinor: Math.round(dto.price * 100), stockQuantity: 0 }]
          : [];

      if (variantsToCreate.length) {
        const variantEntities = variantsToCreate.map((v) =>
          manager.create(ProductVariantV2, {
            productId,
            sku: v.sku ?? null,
            basePriceMinor: v.basePriceMinor,
            stockQuantity: v.stockQuantity ?? 0,
            currency: 'COP',
            isActive: true,
          }),
        );
        await manager.save(ProductVariantV2, variantEntities);
      }

      this.logger.log(`Product v2 created: ${productId} (${dto.name})`);
      return savedCore;
    });
  }

  /**
   * Obtener todos los productos con filtros y paginación
   */
  async getAll(
    query: ProductsQueryDto,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      order = 'DESC',
    } = query;

    const queryBuilder: SelectQueryBuilder<Product> = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.shop', 'shop')
      .leftJoinAndSelect('product.category', 'category');

    // Filtro: active — omitir cuando se especifica moderationStatus (vista de moderación admin)
    if (!query.moderationStatus) {
      queryBuilder.andWhere('product.active = :active', { active: true });
    }

    // Filtro: Estado de moderación (admin/moderación)
    if (query.moderationStatus) {
      queryBuilder.andWhere('product.moderationStatus = :moderationStatus', {
        moderationStatus: query.moderationStatus,
      });
    }

    // Filtro: Shop ID directo
    if (query.shopId) {
      queryBuilder.andWhere('product.shopId = :shopId', {
        shopId: query.shopId,
      });
    }

    // Filtro: Solo productos cuya tienda NO tiene aprobación marketplace
    if (query.onlyNonMarketplace) {
      queryBuilder.andWhere('shop.marketplace_approved IS DISTINCT FROM true');
    }

    // Filtro: Categoría única
    if (query.category) {
      queryBuilder.andWhere('LOWER(product.subcategory) = LOWER(:category)', {
        category: query.category,
      });
    }

    // Filtro: Múltiples categorías (OR)
    if (query.categories) {
      const categoryList = query.categories.split(',').map((c) => c.trim());
      queryBuilder.andWhere('LOWER(product.subcategory) IN (:...categories)', {
        categories: categoryList.map((c) => c.toLowerCase()),
      });
    }

    // Filtro: Tipos de artesanía (crafts) - busca en shop.craftType
    if (query.crafts) {
      const craftList = query.crafts.split(',').map((c) => c.trim());
      queryBuilder.andWhere('LOWER(shop.craftType) IN (:...crafts)', {
        crafts: craftList.map((c) => c.toLowerCase()),
      });
    }

    // Filtro: Materiales (array JSONB)
    if (query.materials) {
      const materialList = query.materials.split(',').map((m) => m.trim());
      materialList.forEach((material, index) => {
        queryBuilder.andWhere(
          `EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(product.materials) AS material
          WHERE LOWER(material) = LOWER(:material${index})
        )`,
          { [`material${index}`]: material },
        );
      });
    }

    // Filtro: Técnicas (array JSONB)
    if (query.techniques) {
      const techniqueList = query.techniques.split(',').map((t) => t.trim());
      techniqueList.forEach((technique, index) => {
        queryBuilder.andWhere(
          `EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(product.techniques) AS technique
          WHERE LOWER(technique) = LOWER(:technique${index})
        )`,
          { [`technique${index}`]: technique },
        );
      });
    }

    // Filtro: Shop slug
    if (query.shopSlug) {
      queryBuilder.andWhere('shop.shopSlug = :shopSlug', {
        shopSlug: query.shopSlug,
      });
    }

    // Filtro: IDs específicos
    if (query.ids) {
      const idList = query.ids.split(',').map((id) => id.trim());
      queryBuilder.andWhere('product.id IN (:...ids)', { ids: idList });
    }

    // Filtro: Rango de precio
    if (query.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', {
        minPrice: query.minPrice,
      });
    }
    if (query.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }

    // Filtro: Rating mínimo (TODO: implementar cuando exista tabla de reviews)
    // if (query.minRating !== undefined) {
    //   queryBuilder.andWhere('product.averageRating >= :minRating', {
    //     minRating: query.minRating,
    //   });
    // }

    // Filtro: Envío gratis (TODO: implementar cuando exista campo)
    // if (query.freeShipping !== undefined) {
    //   queryBuilder.andWhere('product.freeShipping = :freeShipping', {
    //     freeShipping: query.freeShipping,
    //   });
    // }

    // Filtro: Featured
    if (query.featured !== undefined) {
      queryBuilder.andWhere('product.featured = :featured', {
        featured: query.featured,
      });
    }

    // Filtro: Nuevos (últimos 30 días)
    if (query.isNew) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      queryBuilder.andWhere('product.createdAt >= :thirtyDaysAgo', {
        thirtyDaysAgo,
      });
    }

    // Filtro: Puede comprarse (inventory > 0)
    if (query.canPurchase) {
      queryBuilder.andWhere('product.inventory > 0');
    }

    // Búsqueda por texto
    if (query.q) {
      const searchTerm = `%${query.q.toLowerCase()}%`;
      queryBuilder.andWhere(
        `(
        LOWER(product.name) LIKE :searchTerm OR
        LOWER(product.description) LIKE :searchTerm OR
        LOWER(product.shortDescription) LIKE :searchTerm OR
        EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(product.tags) AS tag
          WHERE LOWER(tag) LIKE :searchTerm
        )
      )`,
        { searchTerm },
      );
    }

    // Exclusión
    if (query.exclude) {
      queryBuilder.andWhere('product.id != :exclude', {
        exclude: query.exclude,
      });
    }

    // Ordenamiento
    const sortColumn = sortBy === 'created_at' ? 'createdAt' : sortBy;
    queryBuilder.orderBy(`product.${sortColumn}`, order);

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Ejecutar query
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Obtener un producto por ID
   */
  async getById(id: string): Promise<Product> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['shop', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  /**
   * Obtener productos por shop ID
   */
  async getByShopId(shopId: string): Promise<Product[]> {
    if (!shopId) {
      throw new BadRequestException('El ID de la tienda es requerido');
    }

    return await this.productsRepository.find({
      where: { shopId },
      order: { createdAt: 'DESC' },
      relations: ['shop', 'category'],
    });
  }

  /**
   * Obtener productos por user ID (del artisan shop)
   */
  async getByUserId(userId: string): Promise<Product[]> {
    if (!userId) {
      throw new BadRequestException('El ID del usuario es requerido');
    }

    // Hacer JOIN con artisan_shops para filtrar por userId
    const products = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.shop', 'shop')
      .leftJoinAndSelect('product.category', 'category')
      .where('shop.userId = :userId', { userId })
      .orderBy('product.createdAt', 'DESC')
      .getMany();

    return products;
  }

  /**
   * Obtener múltiples productos por sus IDs
   * Útil para operaciones en bulk como sync-guest-cart
   */
  async findByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    return await this.productsRepository.find({
      where: { id: In(ids) },
      relations: ['shop'],
    });
  }

  /**
   * Obtener productos activos
   */
  async getActiveProducts(): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { active: true },
      order: { createdAt: 'DESC' },
      relations: ['shop', 'category'],
    });
  }

  /**
   * Obtener productos destacados
   */
  async getFeaturedProducts(): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { featured: true, active: true },
      order: { createdAt: 'DESC' },
      relations: ['shop', 'category'],
    });
  }

  /**
   * Actualizar un producto
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    // Verificar que existe
    const product = await this.getById(id);

    // Validar SKU único si se está actualizando
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productsRepository.findOne({
        where: { sku: updateProductDto.sku },
      });

      if (existingSku) {
        throw new ConflictException(
          `Ya existe un producto con el SKU ${updateProductDto.sku}`,
        );
      }
    }

    // Actualizar
    await this.productsRepository.update(id, updateProductDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar un producto
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Hard delete
    await this.productsRepository.delete(id);

    return {
      message: `Producto con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Obtener productos para marketplace (replica marketplace_products view)
   * Incluye cálculos de stock, rating, reviews, y filtra solo productos aprobados
   */
  async getMarketplaceProducts(query: ProductsQueryDto): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 20,
      category,
      region,
      craftType,
      featured,
      ids,
      sortBy = 'created_at',
      order = 'DESC',
    } = query;

    // Query base con la relación a shop
    const queryBuilder = this.productsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.shop', 's')
      // Filtros automáticos (solo productos aprobados de tiendas publicadas)
      .where(`p.moderationStatus IN (:...statuses)`, {
        statuses: ['approved', 'approved_with_edits'],
      })
      .andWhere(`s.publishStatus = :publishStatus`, {
        publishStatus: 'published',
      })
      .andWhere(`s.marketplaceApproved = :approved`, { approved: true });

    // Filtros opcionales
    if (ids) {
      const idsArray = ids.split(',').map((id) => id.trim());
      queryBuilder.andWhere('p.id IN (:...ids)', { ids: idsArray });
    }

    if (category) {
      queryBuilder.andWhere('p.category = :category', { category });
    }

    if (region) {
      queryBuilder.andWhere('s.region = :region', { region });
    }

    if (craftType) {
      queryBuilder.andWhere('s.craftType = :craftType', { craftType });
    }

    if (featured !== undefined) {
      queryBuilder.andWhere('p.featured = :featured', { featured });
    }

    // Ordenamiento
    const orderByColumn = sortBy === 'name' ? 'p.name' : 'p.createdAt';
    queryBuilder.orderBy(orderByColumn, order);

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Ejecutar query
    const [rawResults, total] = await queryBuilder.getManyAndCount();

    // Mapear resultados a formato de marketplace_products
    const data = rawResults.map((product: any) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        imageUrl: product.images?.[0] || null,
        images: product.images || [],
        stock: parseInt(product.stock) || 0,
        inventory: parseInt(product.inventory) || 0,
        rating: parseFloat(product.rating) || 0,
        reviewsCount: parseInt(product.reviews_count) || 0,
        isNew: new Date(product.createdAt) > thirtyDaysAgo,
        freeShipping: false, // Por ahora siempre false
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        moderationStatus: product.moderationStatus,
        tags: product.tags || [],
        materials: product.materials || [],
        techniques: product.techniques || [],
        dimensions: product.dimensions || null,
        weight: product.weight || null,
        productionTime: product.productionTime || null,
        category: product.category,
        originalCategory: product.category,
        subcategory: product.subcategory,
        sku: product.sku,
        active: product.active,
        featured: product.featured,
        customizable: product.customizable,
        madeToOrder: product.madeToOrder,
        leadTimeDays: product.leadTimeDays,
        shippingDataComplete: product.shippingDataComplete || false,
        allowsLocalPickup: product.allowsLocalPickup || false,
        craft: product.tags?.[1] || null,
        material: product.tags?.[0] || null,
        // Datos de la tienda
        shopId: product.shop?.id,
        storeName: product.shop?.shopName,
        storeSlug: product.shop?.shopSlug,
        logoUrl: product.shop?.logoUrl,
        bannerUrl: product.shop?.bannerUrl,
        storeDescription: product.shop?.description,
        region: product.shop?.region,
        city: product.shop?.contactInfo?.city,
        department: product.shop?.contactInfo?.department,
        craftType: product.shop?.craftType,
        bankDataStatus: product.shop?.bankDataStatus,
        canPurchase:
          product.shop?.bankDataStatus === 'complete' &&
          (product.shippingDataComplete || false) === true,
      };
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Obtener un producto individual enriquecido para marketplace
   */
  async getMarketplaceProductById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const result = await this.getMarketplaceProducts({ ids: id, limit: 1 });

    if (!result.data || result.data.length === 0) {
      throw new NotFoundException(
        `Producto con ID ${id} no encontrado o no está disponible en marketplace`,
      );
    }

    return result.data[0];
  }

  /**
   * Obtener productos destacados enriquecidos para marketplace
   */
  async getMarketplaceFeaturedProducts(): Promise<any[]> {
    const result = await this.getMarketplaceProducts({
      featured: true,
      limit: 20,
    });

    return result.data;
  }

  /**
   * Obtener productos de una tienda enriquecidos para marketplace
   */
  async getMarketplaceProductsByShop(shopId: string): Promise<any[]> {
    if (!shopId) {
      throw new BadRequestException('El shopId es requerido');
    }

    // Reusar la lógica existente filtrando por shopId
    const queryBuilder = this.productsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.shop', 's')
      .where('p.shopId = :shopId', { shopId })
      .andWhere(`p.moderationStatus IN (:...statuses)`, {
        statuses: ['approved', 'approved_with_edits'],
      })
      .andWhere(`s.publishStatus = :publishStatus`, {
        publishStatus: 'published',
      })
      .andWhere(`s.marketplaceApproved = :approved`, { approved: true })
      .orderBy('p.createdAt', 'DESC');

    const products = await queryBuilder.getMany();

    // Aplicar el mismo mapeo que getMarketplaceProducts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return products.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      imageUrl: product.images?.[0] || null,
      images: product.images || [],
      stock: parseInt(product.inventory) || 0, // Simplificado
      rating: 0, // Simplificado, se puede mejorar
      reviewsCount: 0, // Simplificado, se puede mejorar
      isNew: new Date(product.createdAt) > thirtyDaysAgo,
      freeShipping: false,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      moderationStatus: product.moderationStatus,
      tags: product.tags || [],
      materials: product.materials || [],
      techniques: product.techniques || [],
      dimensions: product.dimensions || null,
      weight: product.weight || null,
      productionTime: product.productionTime || null,
      category: product.category,
      originalCategory: product.category,
      subcategory: product.subcategory,
      sku: product.sku,
      active: product.active,
      featured: product.featured,
      customizable: product.customizable,
      madeToOrder: product.madeToOrder,
      leadTimeDays: product.leadTimeDays,
      shippingDataComplete: product.shippingDataComplete || false,
      allowsLocalPickup: product.allowsLocalPickup || false,
      craft: product.tags?.[1] || null,
      material: product.tags?.[0] || null,
      shopId: product.shop?.id,
      storeName: product.shop?.shopName,
      storeSlug: product.shop?.shopSlug,
      logoUrl: product.shop?.logoUrl,
      bannerUrl: product.shop?.bannerUrl,
      storeDescription: product.shop?.description,
      region: product.shop?.region,
      city: product.shop?.contactInfo?.city,
      department: product.shop?.contactInfo?.department,
      craftType: product.shop?.craftType,
      bankDataStatus: product.shop?.bankDataStatus,
      canPurchase:
        product.shop?.bankDataStatus === 'complete' &&
        (product.shippingDataComplete || false) === true,
    }));
  }

  /**
   * Obtener productos de un usuario enriquecidos para marketplace
   * Busca productos a través de la tienda del usuario
   */
  async getMarketplaceProductsByUser(userId: string): Promise<any[]> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    // Buscar la tienda del usuario
    const queryBuilder = this.productsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.shop', 's')
      .where('s.userId = :userId', { userId })
      .andWhere(`p.moderationStatus IN (:...statuses)`, {
        statuses: ['approved', 'approved_with_edits'],
      })
      .andWhere(`s.publishStatus = :publishStatus`, {
        publishStatus: 'published',
      })
      .andWhere(`s.marketplaceApproved = :approved`, { approved: true })
      .orderBy('p.createdAt', 'DESC');

    const products = await queryBuilder.getMany();

    // Aplicar el mismo mapeo que getMarketplaceProducts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return products.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      imageUrl: product.images?.[0] || null,
      images: product.images || [],
      stock: parseInt(product.inventory) || 0,
      rating: 0,
      reviewsCount: 0,
      isNew: new Date(product.createdAt) > thirtyDaysAgo,
      freeShipping: false,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      moderationStatus: product.moderationStatus,
      tags: product.tags || [],
      materials: product.materials || [],
      techniques: product.techniques || [],
      dimensions: product.dimensions || null,
      weight: product.weight || null,
      productionTime: product.productionTime || null,
      category: product.category,
      originalCategory: product.category,
      subcategory: product.subcategory,
      sku: product.sku,
      active: product.active,
      featured: product.featured,
      customizable: product.customizable,
      madeToOrder: product.madeToOrder,
      leadTimeDays: product.leadTimeDays,
      shippingDataComplete: product.shippingDataComplete || false,
      allowsLocalPickup: product.allowsLocalPickup || false,
      craft: product.tags?.[1] || null,
      material: product.tags?.[0] || null,
      shopId: product.shop?.id,
      storeName: product.shop?.shopName,
      storeSlug: product.shop?.shopSlug,
      logoUrl: product.shop?.logoUrl,
      bannerUrl: product.shop?.bannerUrl,
      storeDescription: product.shop?.description,
      region: product.shop?.region,
      city: product.shop?.contactInfo?.city,
      department: product.shop?.contactInfo?.department,
      craftType: product.shop?.craftType,
      bankDataStatus: product.shop?.bankDataStatus,
      canPurchase:
        product.shop?.bankDataStatus === 'complete' &&
        (product.shippingDataComplete || false) === true,
    }));
  }

  /**
   * Contar productos aprobados de una tienda
   */
  async countApprovedByShopId(shopId: string): Promise<number> {
    if (!shopId) {
      throw new BadRequestException('El ID de la tienda es requerido');
    }

    return await this.productsRepository.count({
      where: {
        shopId,
        moderationStatus: In(['approved', 'approved_with_edits']),
      },
    });
  }
}
