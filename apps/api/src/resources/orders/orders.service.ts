import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ArtisanShop } from '../artisan-shops/entities/artisan-shop.entity';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('ORDERS_REPOSITORY')
    private readonly ordersRepository: Repository<Order>,
    @Inject('ARTISAN_SHOPS_REPOSITORY')
    private readonly artisanShopsRepository: Repository<ArtisanShop>,
  ) {}

  /**
   * Crear una nueva orden
   */
  async create(createDto: CreateOrderDto): Promise<Order> {
    // Verificar que la tienda vendedora existe
    const shopExists = await this.artisanShopsRepository.findOne({
      where: { id: createDto.sellerShopId },
    });

    if (!shopExists) {
      throw new NotFoundException(
        `Tienda con ID ${createDto.sellerShopId} no encontrada`,
      );
    }

    const newOrder = this.ordersRepository.create(createDto);
    return await this.ordersRepository.save(newOrder);
  }

  /**
   * Obtener todas las órdenes
   */
  async findAll(): Promise<Order[]> {
    return await this.ordersRepository.find({
      relations: ['sellerShop'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una orden por ID
   */
  async findOne(id: string): Promise<Order> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['sellerShop'],
    });

    if (!order) {
      throw new NotFoundException(`Orden con ID ${id} no encontrada`);
    }

    return order;
  }

  /**
   * Obtener órdenes por checkoutId
   */
  async findByCheckoutId(checkoutId: string): Promise<Order[]> {
    if (!checkoutId) {
      throw new BadRequestException('El checkoutId es requerido');
    }

    return await this.ordersRepository.find({
      where: { checkoutId },
      relations: ['sellerShop'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener órdenes por sellerShopId
   */
  async findBySellerShopId(sellerShopId: string): Promise<Order[]> {
    if (!sellerShopId) {
      throw new BadRequestException('El sellerShopId es requerido');
    }

    return await this.ordersRepository.find({
      where: { sellerShopId },
      relations: ['sellerShop'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener órdenes de un usuario con sus items
   * Busca por buyer_user_id del checkout e incluye order_items
   */
  async findByBuyerUserIdWithItems(buyerUserId: string): Promise<Order[]> {
    if (!buyerUserId) {
      throw new BadRequestException('El buyerUserId es requerido');
    }

    return await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.checkout', 'checkout')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('order.sellerShop', 'sellerShop')
      .where('checkout.buyer_user_id = :buyerUserId', { buyerUserId })
      .orderBy('order.created_at', 'DESC')
      .getMany();
  }

  /**
   * Actualizar una orden
   */
  async update(id: string, updateDto: UpdateOrderDto): Promise<Order> {
    // Verificar que existe
    await this.findOne(id);

    // Si se actualiza la tienda vendedora, verificar que existe
    if (updateDto.sellerShopId) {
      const shopExists = await this.artisanShopsRepository.findOne({
        where: { id: updateDto.sellerShopId },
      });

      if (!shopExists) {
        throw new NotFoundException(
          `Tienda con ID ${updateDto.sellerShopId} no encontrada`,
        );
      }
    }

    // Actualizar
    await this.ordersRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Actualizar estado de la orden
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    // Verificar que existe
    await this.findOne(id);

    // Actualizar estado
    await this.ordersRepository.update(id, { status: updateStatusDto.status });

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar una orden
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.findOne(id);

    // Eliminar
    await this.ordersRepository.delete(id);

    return {
      message: `Orden con ID ${id} eliminada exitosamente`,
    };
  }
}
