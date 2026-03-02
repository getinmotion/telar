import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductModerationHistory } from './entities/product-moderation-history.entity';
import { CreateProductModerationHistoryDto } from './dto/create-product-moderation-history.dto';
import { UpdateProductModerationHistoryDto } from './dto/update-product-moderation-history.dto';

@Injectable()
export class ProductModerationHistoryService {
  constructor(
    @Inject('PRODUCT_MODERATION_HISTORY_REPOSITORY')
    private readonly moderationHistoryRepository: Repository<ProductModerationHistory>,
  ) {}

  /**
   * Crear un nuevo registro de historial de moderación
   */
  async create(
    createDto: CreateProductModerationHistoryDto,
  ): Promise<ProductModerationHistory> {
    const newHistory = this.moderationHistoryRepository.create(createDto);
    return await this.moderationHistoryRepository.save(newHistory);
  }

  /**
   * Obtener todos los registros de historial de moderación
   */
  async findAll(): Promise<ProductModerationHistory[]> {
    return await this.moderationHistoryRepository.find({
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un registro por ID
   */
  async findOne(id: string): Promise<ProductModerationHistory> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const history = await this.moderationHistoryRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!history) {
      throw new NotFoundException(
        `Registro de historial con ID ${id} no encontrado`,
      );
    }

    return history;
  }

  /**
   * Obtener historial por ID de producto
   */
  async findByProductId(
    productId: string,
  ): Promise<ProductModerationHistory[]> {
    if (!productId) {
      throw new BadRequestException('El productId es requerido');
    }

    return await this.moderationHistoryRepository.find({
      where: { productId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener historial por ID de moderador
   */
  async findByModeratorId(
    moderatorId: string,
  ): Promise<ProductModerationHistory[]> {
    if (!moderatorId) {
      throw new BadRequestException('El moderatorId es requerido');
    }

    return await this.moderationHistoryRepository.find({
      where: { moderatorId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener historial por ID de artesano
   */
  async findByArtisanId(
    artisanId: string,
  ): Promise<ProductModerationHistory[]> {
    if (!artisanId) {
      throw new BadRequestException('El artisanId es requerido');
    }

    return await this.moderationHistoryRepository.find({
      where: { artisanId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar un registro
   */
  async update(
    id: string,
    updateDto: UpdateProductModerationHistoryDto,
  ): Promise<ProductModerationHistory> {
    // Verificar que existe
    await this.findOne(id);

    // Actualizar
    await this.moderationHistoryRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un registro
   */
  async remove(id: string): Promise<void> {
    // Verificar que existe
    await this.findOne(id);

    // Eliminar
    await this.moderationHistoryRepository.delete(id);
  }
}
