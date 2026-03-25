import { Injectable, NotFoundException, Inject } from '@nestjs/common';
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
  ) {}

  /**
   * Crear nuevo producto
   */
  async create(createProductsNewDto: CreateProductsNewDto): Promise<ProductCore> {
    const product = this.productCoreRepository.create(
      createProductsNewDto as any,
    ) as unknown as ProductCore;
    return await this.productCoreRepository.save(product);
  }

  /**
   * Obtener todos los productos con todas sus capas y relaciones
   * Combina products_core + todas las capas (1:1) + relaciones (1:N y N:M)
   */
  async findAll(): Promise<ProductCore[]> {
    const products = await this.productCoreRepository.find({
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
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    return products;
  }

  /**
   * Obtener un producto por ID con todas sus capas y relaciones
   */
  async findOne(id: string): Promise<ProductCore> {
    const product = await this.productCoreRepository.findOne({
      where: { id, deletedAt: IsNull() },
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

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Obtener productos por tienda
   */
  async findByStoreId(storeId: string): Promise<ProductCore[]> {
    const products = await this.productCoreRepository.find({
      where: { storeId, deletedAt: IsNull() },
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
      order: { createdAt: 'DESC' },
    });

    return products;
  }

  /**
   * Obtener productos por categoría
   */
  async findByCategoryId(categoryId: string): Promise<ProductCore[]> {
    const products = await this.productCoreRepository.find({
      where: { categoryId, deletedAt: IsNull() },
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
        'artisanalIdentity',
        'physicalSpecs',
        'logistics',
        'production',
        'media',
        'badges',
        'materials',
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

    if (!product) {
      throw new NotFoundException(
        `Product with legacy ID ${legacyId} not found`,
      );
    }

    return product;
  }

  /**
   * Actualizar producto
   */
  async update(
    id: string,
    updateProductsNewDto: UpdateProductsNewDto,
  ): Promise<ProductCore> {
    const product = await this.findOne(id);

    Object.assign(product, updateProductsNewDto);

    return await this.productCoreRepository.save(product);
  }

  /**
   * Soft delete de producto
   */
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.deletedAt = new Date();
    await this.productCoreRepository.save(product);
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
      .leftJoinAndSelect('product.artisanalIdentity', 'artisanalIdentity')
      .leftJoinAndSelect('product.physicalSpecs', 'physicalSpecs')
      .leftJoinAndSelect('product.logistics', 'logistics')
      .leftJoinAndSelect('product.production', 'production')
      .leftJoinAndSelect('product.media', 'media')
      .leftJoinAndSelect('product.badges', 'badges')
      .leftJoinAndSelect('product.materials', 'materials')
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

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Ordenar por fecha de creación
    queryBuilder.orderBy('product.created_at', 'DESC');

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
