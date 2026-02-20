import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { Repository, SelectQueryBuilder, Not, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsQueryDto } from './dto/products-query.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @Inject('PRODUCTS_REPOSITORY')
    private readonly productsRepository: Repository<Product>,
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
   * Obtener todos los productos con filtros y paginación
   */
  async getAll(
    query: ProductsQueryDto,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, sortBy = 'created_at', order = 'DESC' } =
      query;

    const queryBuilder: SelectQueryBuilder<Product> = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.shop', 'shop')
      .leftJoinAndSelect('product.category', 'category');

    // Filtro: Solo productos activos por defecto
    queryBuilder.andWhere('product.active = :active', { active: true });

    // Filtro: Categoría única
    if (query.category) {
      queryBuilder.andWhere(
        'LOWER(product.subcategory) = LOWER(:category)',
        { category: query.category },
      );
    }

    // Filtro: Múltiples categorías (OR)
    if (query.categories) {
      const categoryList = query.categories.split(',').map((c) => c.trim());
      queryBuilder.andWhere(
        'LOWER(product.subcategory) IN (:...categories)',
        { categories: categoryList.map((c) => c.toLowerCase()) },
      );
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
}
