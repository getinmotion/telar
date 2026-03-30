import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Repository, IsNull } from 'typeorm';
import { CreateProductsNewDto } from './dto/create-products-new.dto';
import { UpdateProductsNewDto } from './dto/update-products-new.dto';
import {
  ProductCore,
  ProductArtisanalIdentity,
  ProductPhysicalSpecs,
  ProductLogistics,
  ProductProduction,
  ProductMedia,
  ProductBadge,
  ProductMaterialLink,
  ProductVariant,
} from './entities';

@Injectable()
export class ProductsNewService {
  constructor(
    @Inject('PRODUCTS_CORE_REPOSITORY')
    private readonly productCoreRepository: Repository<ProductCore>,
    @Inject('PRODUCT_MEDIA_REPOSITORY')
    private readonly productMediaRepository: Repository<ProductMedia>,
    @Inject('PRODUCT_ARTISANAL_IDENTITY_REPOSITORY')
    private readonly artisanalIdentityRepository: Repository<ProductArtisanalIdentity>,
    @Inject('PRODUCT_PHYSICAL_SPECS_REPOSITORY')
    private readonly physicalSpecsRepository: Repository<ProductPhysicalSpecs>,
    @Inject('PRODUCT_LOGISTICS_REPOSITORY')
    private readonly logisticsRepository: Repository<ProductLogistics>,
    @Inject('PRODUCT_PRODUCTION_REPOSITORY')
    private readonly productionRepository: Repository<ProductProduction>,
    @Inject('PRODUCT_BADGES_REPOSITORY')
    private readonly badgesRepository: Repository<ProductBadge>,
    @Inject('PRODUCT_MATERIALS_LINK_REPOSITORY')
    private readonly materialsRepository: Repository<ProductMaterialLink>,
    @Inject('PRODUCT_VARIANTS_REPOSITORY')
    private readonly variantsRepository: Repository<ProductVariant>,
  ) {}

  /**
   * Crear o actualizar producto (Upsert inteligente)
   *
   * Lógica:
   * 1. Si viene productId -> busca el producto y actualiza solo las entidades enviadas
   * 2. Si no viene productId -> crea nuevo ProductCore con las entidades enviadas
   *
   * Para cada entidad relacionada enviada en el DTO:
   * - OneToOne (artisanalIdentity, physicalSpecs, logistics, production):
   *   - Si existe -> actualiza
   *   - Si no existe -> crea
   * - OneToMany (media, badges, materials, variants):
   *   - Elimina existentes y crea nuevos
   *
   * Permite creación incremental: el frontend envía solo lo que tiene en cada step
   */
  async create(createProductsNewDto: CreateProductsNewDto): Promise<ProductCore> {
    const {
      productId,
      storeId,
      categoryId,
      legacyProductId,
      name,
      shortDescription,
      history,
      careNotes,
      status,
      artisanalIdentity,
      physicalSpecs,
      logistics,
      production,
      media,
      badges,
      materials,
      variants,
    } = createProductsNewDto;

    let product: ProductCore;

    if (productId) {
      // ============= UPDATE MODE =============
      // Buscar producto existente
      const existingProduct = await this.productCoreRepository.findOne({
        where: { id: productId, deletedAt: IsNull() },
        relations: [
          'artisanalIdentity',
          'physicalSpecs',
          'logistics',
          'production',
          'media',
          'badges',
          'materials',
          'variants',
        ],
      });

      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      product = existingProduct;

      // Actualizar campos de ProductCore solo si vienen en el DTO
      if (name !== undefined) product.name = name;
      if (shortDescription !== undefined)
        product.shortDescription = shortDescription;
      if (history !== undefined) product.history = history;
      if (careNotes !== undefined) product.careNotes = careNotes;
      if (status !== undefined) product.status = status;
      if (categoryId !== undefined) product.categoryId = categoryId;
      if (legacyProductId !== undefined)
        product.legacyProductId = legacyProductId;

      await this.productCoreRepository.save(product);
    } else {
      // ============= CREATE MODE =============
      // Crear nuevo ProductCore
      product = this.productCoreRepository.create({
        storeId,
        categoryId,
        legacyProductId,
        name,
        shortDescription,
        history,
        careNotes,
        status: status || 'draft',
      });

      product = await this.productCoreRepository.save(product);
    }

    // ============= MANEJAR ENTIDADES RELACIONADAS =============

    // 1. ArtisanalIdentity (OneToOne) - Upsert
    if (artisanalIdentity) {
      await this.upsertArtisanalIdentity(product.id, artisanalIdentity);
    }

    // 2. PhysicalSpecs (OneToOne) - Upsert
    if (physicalSpecs) {
      await this.upsertPhysicalSpecs(product.id, physicalSpecs);
    }

    // 3. Logistics (OneToOne) - Upsert
    if (logistics) {
      await this.upsertLogistics(product.id, logistics);
    }

    // 4. Production (OneToOne) - Upsert
    if (production) {
      await this.upsertProduction(product.id, production);
    }

    // 5. Media (OneToMany) - Replace
    if (media && media.length > 0) {
      await this.replaceMedia(product.id, media);
    }

    // 6. Badges (OneToMany) - Replace
    if (badges && badges.length > 0) {
      await this.replaceBadges(product.id, badges);
    }

    // 7. Materials (OneToMany) - Replace
    if (materials && materials.length > 0) {
      await this.replaceMaterials(product.id, materials);
    }

    // 8. Variants (OneToMany) - Replace
    if (variants && variants.length > 0) {
      await this.replaceVariants(product.id, variants);
    }

    // Retornar producto completo con todas las relaciones
    return await this.findOne(product.id);
  }

  // ============= MÉTODOS HELPER PARA UPSERT =============

  /**
   * Upsert ArtisanalIdentity (OneToOne)
   */
  private async upsertArtisanalIdentity(
    productId: string,
    data: any,
  ): Promise<void> {
    const existingEntity = await this.artisanalIdentityRepository.findOne({
      where: { productId },
    });

    if (existingEntity) {
      // Actualizar existente
      Object.assign(existingEntity, data);
      await this.artisanalIdentityRepository.save(existingEntity);
    } else {
      // Crear nuevo
      const newEntity = this.artisanalIdentityRepository.create({
        ...data,
        productId,
      });
      await this.artisanalIdentityRepository.save(newEntity);
    }
  }

  /**
   * Upsert PhysicalSpecs (OneToOne)
   */
  private async upsertPhysicalSpecs(
    productId: string,
    data: any,
  ): Promise<void> {
    const existingEntity = await this.physicalSpecsRepository.findOne({
      where: { productId },
    });

    if (existingEntity) {
      Object.assign(existingEntity, data);
      await this.physicalSpecsRepository.save(existingEntity);
    } else {
      const newEntity = this.physicalSpecsRepository.create({
        ...data,
        productId,
      });
      await this.physicalSpecsRepository.save(newEntity);
    }
  }

  /**
   * Upsert Logistics (OneToOne)
   */
  private async upsertLogistics(productId: string, data: any): Promise<void> {
    const existingEntity = await this.logisticsRepository.findOne({
      where: { productId },
    });

    if (existingEntity) {
      Object.assign(existingEntity, data);
      await this.logisticsRepository.save(existingEntity);
    } else {
      const newEntity = this.logisticsRepository.create({
        ...data,
        productId,
      });
      await this.logisticsRepository.save(newEntity);
    }
  }

  /**
   * Upsert Production (OneToOne)
   */
  private async upsertProduction(productId: string, data: any): Promise<void> {
    const existingEntity = await this.productionRepository.findOne({
      where: { productId },
    });

    if (existingEntity) {
      Object.assign(existingEntity, data);
      await this.productionRepository.save(existingEntity);
    } else {
      const newEntity = this.productionRepository.create({
        ...data,
        productId,
      });
      await this.productionRepository.save(newEntity);
    }
  }

  /**
   * Replace Media (OneToMany)
   * Elimina existentes y crea nuevos
   */
  private async replaceMedia(productId: string, mediaList: any[]): Promise<void> {
    // Eliminar medias existentes
    const existingMedia = await this.productMediaRepository.find({
      where: { productId },
    });

    if (existingMedia.length > 0) {
      await this.productMediaRepository.remove(existingMedia);
    }

    // Crear nuevos medias
    const newMediaEntities = mediaList.map((mediaDto) => {
      return this.productMediaRepository.create({
        ...mediaDto,
        productId,
      } as any);
    });

    if (newMediaEntities.length > 0) {
      await this.productMediaRepository.save(newMediaEntities as any);
    }
  }

  /**
   * Replace Badges (OneToMany)
   */
  private async replaceBadges(productId: string, badgesList: any[]): Promise<void> {
    const existingBadges = await this.badgesRepository.find({
      where: { productId },
    });

    if (existingBadges.length > 0) {
      await this.badgesRepository.remove(existingBadges);
    }

    const newBadges = badgesList.map((badgeDto) => {
      return this.badgesRepository.create({
        ...badgeDto,
        productId,
      } as any);
    });

    if (newBadges.length > 0) {
      await this.badgesRepository.save(newBadges as any);
    }
  }

  /**
   * Replace Materials (OneToMany)
   */
  private async replaceMaterials(
    productId: string,
    materialsList: any[],
  ): Promise<void> {
    const existingMaterials = await this.materialsRepository.find({
      where: { productId },
    });

    if (existingMaterials.length > 0) {
      await this.materialsRepository.remove(existingMaterials);
    }

    const newMaterials = materialsList.map((materialDto) => {
      return this.materialsRepository.create({
        ...materialDto,
        productId,
      } as any);
    });

    if (newMaterials.length > 0) {
      await this.materialsRepository.save(newMaterials as any);
    }
  }

  /**
   * Replace Variants (OneToMany)
   */
  private async replaceVariants(
    productId: string,
    variantsList: any[],
  ): Promise<void> {
    const existingVariants = await this.variantsRepository.find({
      where: { productId },
    });

    if (existingVariants.length > 0) {
      await this.variantsRepository.remove(existingVariants);
    }

    const newVariants = variantsList.map((variantDto) => {
      return this.variantsRepository.create({
        ...variantDto,
        productId,
      } as any);
    });

    if (newVariants.length > 0) {
      await this.variantsRepository.save(newVariants as any);
    }
  }

  /**
   * Obtener todos los productos con todas sus capas y relaciones
   * Combina products_core + todas las capas (1:1) + relaciones (1:N y N:M)
   * Incluye artisanShop (tabla legacy shop.artisan_shops)
   */
  async findAll(): Promise<ProductCore[]> {
    const products = await this.productCoreRepository.find({
      relations: [
        'artisanShop',
        'category',
        'artisanalIdentity',
        'artisanalIdentity.primaryCraft',
        'artisanalIdentity.primaryTechnique',
        'artisanalIdentity.secondaryTechnique',
        'artisanalIdentity.curatorialCategory',
        'physicalSpecs',
        'logistics',
        'production',
        'media',
        'badges',
        'badges.badge',
        'materials',
        'materials.material',
        'variants',
      ],
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    return products;
  }

  /**
   * Obtener un producto por ID con todas sus capas y relaciones
   * Incluye artisanShop (tabla legacy shop.artisan_shops)
   */
  async findOne(id: string): Promise<ProductCore> {
    const product = await this.productCoreRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: [
        'artisanShop',
        'category',
        'artisanalIdentity',
        'artisanalIdentity.primaryCraft',
        'artisanalIdentity.primaryTechnique',
        'artisanalIdentity.secondaryTechnique',
        'artisanalIdentity.curatorialCategory',
        'physicalSpecs',
        'logistics',
        'production',
        'media',
        'badges',
        'badges.badge',
        'materials',
        'materials.material',
        'variants',
      ],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Obtener productos por tienda (artisan_shop)
   * @param storeId - ID del artisan_shop (no confundir con la nueva tabla stores)
   */
  async findByStoreId(storeId: string): Promise<ProductCore[]> {
    const products = await this.productCoreRepository.find({
      where: { storeId, deletedAt: IsNull() },
      relations: [
        'artisanShop',
        'category',
        'artisanalIdentity',
        'artisanalIdentity.primaryCraft',
        'artisanalIdentity.primaryTechnique',
        'artisanalIdentity.secondaryTechnique',
        'artisanalIdentity.curatorialCategory',
        'physicalSpecs',
        'logistics',
        'production',
        'media',
        'badges',
        'badges.badge',
        'materials',
        'materials.material',
        'variants',
      ],
      order: { createdAt: 'DESC' },
    });

    return products;
  }

  /**
   * Obtener productos por userId (del artisan_shop)
   * Hace JOIN con artisan_shops y filtra por el user_id del artesano
   * @param userId - ID del usuario propietario del artisan_shop
   */
  async findByUserId(userId: string): Promise<ProductCore[]> {
    if (!userId) {
      throw new BadRequestException('El ID del usuario es requerido');
    }

    const products = await this.productCoreRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.artisanShop', 'shop')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.artisanalIdentity', 'artisanalIdentity')
      .leftJoinAndSelect('artisanalIdentity.primaryCraft', 'primaryCraft')
      .leftJoinAndSelect('artisanalIdentity.primaryTechnique', 'primaryTechnique')
      .leftJoinAndSelect('artisanalIdentity.secondaryTechnique', 'secondaryTechnique')
      .leftJoinAndSelect('artisanalIdentity.curatorialCategory', 'curatorialCategory')
      .leftJoinAndSelect('product.physicalSpecs', 'physicalSpecs')
      .leftJoinAndSelect('product.logistics', 'logistics')
      .leftJoinAndSelect('product.production', 'production')
      .leftJoinAndSelect('product.media', 'media')
      .leftJoinAndSelect('product.badges', 'badges')
      .leftJoinAndSelect('badges.badge', 'badge')
      .leftJoinAndSelect('product.materials', 'materials')
      .leftJoinAndSelect('materials.material', 'material')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('shop.user_id = :userId', { userId })
      .andWhere('product.deleted_at IS NULL')
      .orderBy('product.created_at', 'DESC')
      .getMany();

    return products;
  }

  /**
   * Obtener productos por categoría
   */
  async findByCategoryId(categoryId: string): Promise<ProductCore[]> {
    const products = await this.productCoreRepository.find({
      where: { categoryId, deletedAt: IsNull() },
      relations: [
        'artisanShop',
        'category',
        'artisanalIdentity',
        'artisanalIdentity.primaryCraft',
        'artisanalIdentity.primaryTechnique',
        'artisanalIdentity.secondaryTechnique',
        'artisanalIdentity.curatorialCategory',
        'physicalSpecs',
        'logistics',
        'production',
        'media',
        'badges',
        'badges.badge',
        'materials',
        'materials.material',
        'variants',
      ],
      order: { createdAt: 'DESC' },
    });

    return products;
  }

  /**
   * Obtener productos por status
   */
  async findByStatus(status: string): Promise<ProductCore[]> {
    const products = await this.productCoreRepository.find({
      where: { status, deletedAt: IsNull() },
      relations: [
        'artisanShop',
        'category',
        'artisanalIdentity',
        'artisanalIdentity.primaryCraft',
        'artisanalIdentity.primaryTechnique',
        'artisanalIdentity.secondaryTechnique',
        'artisanalIdentity.curatorialCategory',
        'physicalSpecs',
        'logistics',
        'production',
        'media',
        'badges',
        'badges.badge',
        'materials',
        'materials.material',
        'variants',
      ],
      order: { createdAt: 'DESC' },
    });

    return products;
  }

  /**
   * Obtener un producto por su legacyProductId
   * Este método permite buscar productos usando el ID de la tabla legacy shop.products
   */
  async findByLegacyId(legacyId: string): Promise<ProductCore> {
    const product = await this.productCoreRepository.findOne({
      where: { legacyProductId: legacyId, deletedAt: IsNull() },
      relations: [
        'artisanShop',
        'category',
        'artisanalIdentity',
        'artisanalIdentity.primaryCraft',
        'artisanalIdentity.primaryTechnique',
        'artisanalIdentity.secondaryTechnique',
        'artisanalIdentity.curatorialCategory',
        'physicalSpecs',
        'logistics',
        'production',
        'media',
        'badges',
        'badges.badge',
        'materials',
        'materials.material',
        'variants',
      ],
    });

    if (!product) {
      throw new NotFoundException(
        `Product with legacy ID ${legacyId} not found`,
      );
    }

    return product;
  }

  /**
   * Actualizar producto por ID
   * También maneja la actualización de medias si se envían
   */
  async update(
    id: string,
    updateProductsNewDto: UpdateProductsNewDto,
  ): Promise<ProductCore> {
    const product = await this.findOne(id);

    const { media, ...productData } = updateProductsNewDto as any;

    // Actualizar campos del ProductCore
    Object.assign(product, productData);

    // Si se envían medias, reemplazar los existentes
    if (media && media.length > 0) {
      // Eliminar medias anteriores
      if (product.media && product.media.length > 0) {
        await this.productMediaRepository.remove(product.media);
      }

      // Crear nuevos medias
      const newMedia = media.map((mediaDto: any) =>
        this.productMediaRepository.create({
          ...mediaDto,
          productId: product.id,
        }),
      );

      product.media = newMedia;
    }

    return await this.productCoreRepository.save(product);
  }

  /**
   * Soft delete completo de producto y todas sus entidades relacionadas
   * Marca como eliminado (deleted_at) el ProductCore y todas las entidades asociadas
   */
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    const deleteDate = new Date();

    // 1. Soft delete de ProductCore
    product.deletedAt = deleteDate;
    await this.productCoreRepository.save(product);

    // 2. Soft delete de entidades OneToOne
    if (product.artisanalIdentity) {
      product.artisanalIdentity.deletedAt = deleteDate;
      await this.artisanalIdentityRepository.save(product.artisanalIdentity);
    }

    if (product.physicalSpecs) {
      product.physicalSpecs.deletedAt = deleteDate;
      await this.physicalSpecsRepository.save(product.physicalSpecs);
    }

    if (product.logistics) {
      product.logistics.deletedAt = deleteDate;
      await this.logisticsRepository.save(product.logistics);
    }

    if (product.production) {
      product.production.deletedAt = deleteDate;
      await this.productionRepository.save(product.production);
    }

    // 3. Soft delete de entidades OneToMany
    if (product.media && product.media.length > 0) {
      for (const media of product.media) {
        media.deletedAt = deleteDate;
      }
      await this.productMediaRepository.save(product.media as any);
    }

    if (product.badges && product.badges.length > 0) {
      for (const badge of product.badges) {
        badge.deletedAt = deleteDate;
      }
      await this.badgesRepository.save(product.badges as any);
    }

    if (product.materials && product.materials.length > 0) {
      for (const material of product.materials) {
        material.deletedAt = deleteDate;
      }
      await this.materialsRepository.save(product.materials as any);
    }

    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        variant.deletedAt = deleteDate;
      }
      await this.variantsRepository.save(product.variants as any);
    }
  }

  /**
   * Cambiar status del producto
   */
  async updateStatus(id: string, status: string): Promise<ProductCore> {
    const product = await this.findOne(id);
    product.status = status;
    return await this.productCoreRepository.save(product);
  }

  /**
   * Obtener productos con paginación y filtros
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 20,
    filters?: {
      storeId?: string;
      categoryId?: string;
      status?: string;
    },
  ): Promise<{
    data: ProductCore[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.productCoreRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.artisanShop', 'artisanShop')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.artisanalIdentity', 'artisanalIdentity')
      .leftJoinAndSelect('artisanalIdentity.primaryCraft', 'primaryCraft')
      .leftJoinAndSelect('artisanalIdentity.primaryTechnique', 'primaryTechnique')
      .leftJoinAndSelect('artisanalIdentity.secondaryTechnique', 'secondaryTechnique')
      .leftJoinAndSelect('artisanalIdentity.curatorialCategory', 'curatorialCategory')
      .leftJoinAndSelect('product.physicalSpecs', 'physicalSpecs')
      .leftJoinAndSelect('product.logistics', 'logistics')
      .leftJoinAndSelect('product.production', 'production')
      .leftJoinAndSelect('product.media', 'media')
      .leftJoinAndSelect('product.badges', 'badges')
      .leftJoinAndSelect('badges.badge', 'badge')
      .leftJoinAndSelect('product.materials', 'materials')
      .leftJoinAndSelect('materials.material', 'material')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.deleted_at IS NULL');

    // Aplicar filtros
    if (filters?.storeId) {
      queryBuilder.andWhere('product.store_id = :storeId', {
        storeId: filters.storeId,
      });
    }

    if (filters?.categoryId) {
      queryBuilder.andWhere('product.category_id = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('product.status = :status', {
        status: filters.status,
      });
    }

    // Ordenar por fecha de creación (usar nombre de propiedad de entidad, no de columna SQL)
    queryBuilder.orderBy('product.createdAt', 'DESC');

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Ordenar por fecha de creación
    queryBuilder.orderBy('product.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
