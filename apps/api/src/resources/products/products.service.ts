import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
   * Obtener todos los productos
   */
  async getAll(): Promise<Product[]> {
    return await this.productsRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['shop', 'category'],
    });
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
   * Eliminar un producto (soft delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Soft delete
    await this.productsRepository.softDelete(id);

    return {
      message: `Producto con ID ${id} eliminado exitosamente`,
    };
  }
}
