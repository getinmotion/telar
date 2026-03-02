import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import { ProductVariant, VariantStatus } from './entities/product-variant.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { QueryProductVariantDto } from './dto/query-product-variant.dto';

@Injectable()
export class ProductVariantsService {
  constructor(
    @Inject('PRODUCT_VARIANTS_REPOSITORY')
    private readonly productVariantsRepository: Repository<ProductVariant>,
  ) {}

  /**
   * Crear una nueva variante de producto
   */
  async create(
    createDto: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    // Verificar que no exista otra variante con el mismo SKU
    const existingVariant = await this.productVariantsRepository.findOne({
      where: { sku: createDto.sku },
    });

    if (existingVariant) {
      throw new ConflictException(
        `Ya existe una variante con el SKU: ${createDto.sku}`,
      );
    }

    const variant = this.productVariantsRepository.create(createDto);
    return await this.productVariantsRepository.save(variant);
  }

  /**
   * Obtener todas las variantes con paginación y filtros
   */
  async findAll(queryDto: QueryProductVariantDto): Promise<{
    data: ProductVariant[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC', productId, status, sku } = queryDto;

    const queryBuilder = this.productVariantsRepository
      .createQueryBuilder('variant')
      .leftJoinAndSelect('variant.product', 'product');

    // Filtros
    if (productId) {
      queryBuilder.andWhere('variant.productId = :productId', { productId });
    }

    if (status) {
      queryBuilder.andWhere('variant.status = :status', { status });
    }

    if (sku) {
      queryBuilder.andWhere('variant.sku ILIKE :sku', { sku: `%${sku}%` });
    }

    // Ordenamiento y paginación
    queryBuilder
      .orderBy(`variant.${sortBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener una variante por ID
   */
  async findOne(id: string): Promise<ProductVariant> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const variant = await this.productVariantsRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!variant) {
      throw new NotFoundException(`Variante con ID ${id} no encontrada`);
    }

    return variant;
  }

  /**
   * Obtener una variante por SKU
   */
  async findBySku(sku: string): Promise<ProductVariant> {
    if (!sku) {
      throw new BadRequestException('El SKU es requerido');
    }

    const variant = await this.productVariantsRepository.findOne({
      where: { sku },
      relations: ['product'],
    });

    if (!variant) {
      throw new NotFoundException(`Variante con SKU ${sku} no encontrada`);
    }

    return variant;
  }

  /**
   * Obtener todas las variantes de un producto específico
   */
  async findByProductId(productId: string): Promise<ProductVariant[]> {
    if (!productId) {
      throw new BadRequestException('El productId es requerido');
    }

    return await this.productVariantsRepository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener variantes con stock bajo (debajo del mínimo)
   */
  async findLowStock(): Promise<ProductVariant[]> {
    return await this.productVariantsRepository
      .createQueryBuilder('variant')
      .leftJoinAndSelect('variant.product', 'product')
      .where('variant.stock <= variant.minStock')
      .andWhere('variant.status = :status', { status: VariantStatus.ACTIVE })
      .orderBy('variant.stock', 'ASC')
      .getMany();
  }

  /**
   * Actualizar una variante
   */
  async update(
    id: string,
    updateDto: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    // Verificar que existe
    await this.findOne(id);

    // Si se está actualizando el SKU, verificar que no exista otro con ese SKU
    if (updateDto.sku) {
      const existingVariant = await this.productVariantsRepository.findOne({
        where: { sku: updateDto.sku },
      });

      if (existingVariant && existingVariant.id !== id) {
        throw new ConflictException(
          `Ya existe otra variante con el SKU: ${updateDto.sku}`,
        );
      }
    }

    // Actualizar
    await this.productVariantsRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Actualizar stock de una variante
   */
  async updateStock(
    id: string,
    quantity: number,
    operation: 'add' | 'subtract' | 'set',
  ): Promise<ProductVariant> {
    const variant = await this.findOne(id);

    let newStock: number;

    switch (operation) {
      case 'add':
        newStock = variant.stock + quantity;
        break;
      case 'subtract':
        newStock = variant.stock - quantity;
        if (newStock < 0) {
          throw new BadRequestException(
            'El stock no puede ser negativo',
          );
        }
        break;
      case 'set':
        newStock = quantity;
        if (newStock < 0) {
          throw new BadRequestException(
            'El stock no puede ser negativo',
          );
        }
        break;
    }

    await this.productVariantsRepository.update(id, { stock: newStock });
    return await this.findOne(id);
  }

  /**
   * Cambiar el estado de una variante
   */
  async changeStatus(
    id: string,
    status: VariantStatus,
  ): Promise<ProductVariant> {
    await this.findOne(id);
    await this.productVariantsRepository.update(id, { status });
    return await this.findOne(id);
  }

  /**
   * Eliminar una variante (soft delete cambiando estado a discontinued)
   */
  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.productVariantsRepository.update(id, {
      status: VariantStatus.DISCONTINUED,
    });

    return {
      message: `Variante con ID ${id} marcada como discontinuada`,
    };
  }

  /**
   * Eliminar permanentemente una variante (hard delete)
   */
  async hardDelete(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.productVariantsRepository.delete(id);

    return {
      message: `Variante con ID ${id} eliminada permanentemente`,
    };
  }
}
