import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  InventoryMovement,
  MovementType,
} from './entities/inventory-movement.entity';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { UpdateInventoryMovementDto } from './dto/update-inventory-movement.dto';
import { QueryInventoryMovementDto } from './dto/query-inventory-movement.dto';

@Injectable()
export class InventoryMovementsService {
  constructor(
    @Inject('INVENTORY_MOVEMENTS_REPOSITORY')
    private readonly inventoryMovementsRepository: Repository<InventoryMovement>,
  ) {}

  /**
   * Crear un nuevo movimiento de inventario
   */
  async create(
    createDto: CreateInventoryMovementDto,
  ): Promise<InventoryMovement> {
    // Validar que qty sea positivo
    if (createDto.qty <= 0) {
      throw new BadRequestException('La cantidad debe ser un número positivo');
    }

    // TODO: Validar que product_variant_id exista
    // TODO: Actualizar el stock de la variante según el tipo de movimiento

    const movement = this.inventoryMovementsRepository.create(createDto);
    return await this.inventoryMovementsRepository.save(movement);
  }

  /**
   * Obtener todos los movimientos con paginación y filtros
   */
  async findAll(queryDto: QueryInventoryMovementDto): Promise<{
    data: InventoryMovement[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'DESC',
      productVariantId,
      type,
      refId,
      createdBy,
    } = queryDto;

    const queryBuilder = this.inventoryMovementsRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.productVariant', 'productVariant')
      .leftJoinAndSelect('movement.creator', 'creator');

    // Filtros
    if (productVariantId) {
      queryBuilder.andWhere('movement.productVariantId = :productVariantId', {
        productVariantId,
      });
    }

    if (type) {
      queryBuilder.andWhere('movement.type = :type', { type });
    }

    if (refId) {
      queryBuilder.andWhere('movement.refId = :refId', { refId });
    }

    if (createdBy) {
      queryBuilder.andWhere('movement.createdBy = :createdBy', { createdBy });
    }

    // Ordenamiento y paginación
    queryBuilder
      .orderBy(`movement.${sortBy}`, order)
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
   * Obtener un movimiento por ID
   */
  async findOne(id: string): Promise<InventoryMovement> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const movement = await this.inventoryMovementsRepository.findOne({
      where: { id },
      relations: ['productVariant', 'creator'],
    });

    if (!movement) {
      throw new NotFoundException(
        `Movimiento de inventario con ID ${id} no encontrado`,
      );
    }

    return movement;
  }

  /**
   * Obtener movimientos por variante de producto
   */
  async findByProductVariant(
    productVariantId: string,
  ): Promise<InventoryMovement[]> {
    if (!productVariantId) {
      throw new BadRequestException('El productVariantId es requerido');
    }

    return await this.inventoryMovementsRepository.find({
      where: { productVariantId },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Calcular balance de inventario para una variante
   */
  async calculateBalance(productVariantId: string): Promise<{
    productVariantId: string;
    totalIn: number;
    totalOut: number;
    totalAdjust: number;
    balance: number;
  }> {
    const movements = await this.findByProductVariant(productVariantId);

    const totalIn = movements
      .filter((m) => m.type === MovementType.IN)
      .reduce((sum, m) => sum + m.qty, 0);

    const totalOut = movements
      .filter((m) => m.type === MovementType.OUT)
      .reduce((sum, m) => sum + m.qty, 0);

    const totalAdjust = movements
      .filter((m) => m.type === MovementType.ADJUST)
      .reduce((sum, m) => sum + m.qty, 0);

    const balance = totalIn - totalOut + totalAdjust;

    return {
      productVariantId,
      totalIn,
      totalOut,
      totalAdjust,
      balance,
    };
  }

  /**
   * Actualizar un movimiento
   *
   * ADVERTENCIA: Normalmente los movimientos NO se deben actualizar
   * para mantener la integridad del histórico.
   */
  async update(
    id: string,
    updateDto: UpdateInventoryMovementDto,
  ): Promise<InventoryMovement> {
    // Verificar que existe
    await this.findOne(id);

    // Validar qty si se proporciona
    if (updateDto.qty !== undefined && updateDto.qty <= 0) {
      throw new BadRequestException('La cantidad debe ser un número positivo');
    }

    // Actualizar
    await this.inventoryMovementsRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un movimiento
   *
   * ADVERTENCIA: Normalmente los movimientos NO se deben eliminar
   * para mantener la integridad del histórico.
   */
  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.inventoryMovementsRepository.delete(id);

    return {
      message: `Movimiento de inventario con ID ${id} eliminado`,
    };
  }
}
