import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class OrderItemsService {
  constructor(
    @Inject('ORDER_ITEMS_REPOSITORY')
    private readonly orderItemsRepository: Repository<OrderItem>,
    @Inject('ORDERS_REPOSITORY')
    private readonly ordersRepository: Repository<Order>,
    @Inject('PRODUCTS_REPOSITORY')
    private readonly productsRepository: Repository<Product>,
  ) {}

  /**
   * Crear un nuevo item en la orden
   */
  async create(createDto: CreateOrderItemDto): Promise<OrderItem> {
    // Verificar que la orden existe
    const orderExists = await this.ordersRepository.findOne({
      where: { id: createDto.orderId },
    });

    if (!orderExists) {
      throw new NotFoundException(
        `Orden con ID ${createDto.orderId} no encontrada`,
      );
    }

    // Verificar que el producto existe
    const productExists = await this.productsRepository.findOne({
      where: { id: createDto.productId },
    });

    if (!productExists) {
      throw new NotFoundException(
        `Producto con ID ${createDto.productId} no encontrado`,
      );
    }

    const newOrderItem = this.orderItemsRepository.create(createDto);
    return await this.orderItemsRepository.save(newOrderItem);
  }

  /**
   * Obtener todos los items de órdenes
   */
  async findAll(): Promise<OrderItem[]> {
    return await this.orderItemsRepository.find({
      relations: ['order', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un item de orden por ID
   */
  async findOne(id: string): Promise<OrderItem> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const orderItem = await this.orderItemsRepository.findOne({
      where: { id },
      relations: ['order', 'product'],
    });

    if (!orderItem) {
      throw new NotFoundException(
        `Item de orden con ID ${id} no encontrado`,
      );
    }

    return orderItem;
  }

  /**
   * Obtener items por orderId
   */
  async findByOrderId(orderId: string): Promise<OrderItem[]> {
    if (!orderId) {
      throw new BadRequestException('El orderId es requerido');
    }

    return await this.orderItemsRepository.find({
      where: { orderId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar un item de orden
   */
  async update(
    id: string,
    updateDto: UpdateOrderItemDto,
  ): Promise<OrderItem> {
    // Verificar que existe
    await this.findOne(id);

    // Si se actualiza el producto, verificar que existe
    if (updateDto.productId) {
      const productExists = await this.productsRepository.findOne({
        where: { id: updateDto.productId },
      });

      if (!productExists) {
        throw new NotFoundException(
          `Producto con ID ${updateDto.productId} no encontrado`,
        );
      }
    }

    // Actualizar
    await this.orderItemsRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un item de orden
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.findOne(id);

    // Eliminar
    await this.orderItemsRepository.delete(id);

    return {
      message: `Item de orden con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Eliminar todos los items de una orden
   */
  async removeByOrderId(orderId: string): Promise<{ message: string }> {
    if (!orderId) {
      throw new BadRequestException('El orderId es requerido');
    }

    const result = await this.orderItemsRepository.delete({ orderId });

    return {
      message: `${result.affected || 0} items de la orden eliminados exitosamente`,
    };
  }
}
