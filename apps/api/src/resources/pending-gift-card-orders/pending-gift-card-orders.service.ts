import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { PendingGiftCardOrder } from './entities/pending-gift-card-order.entity';
import { CreatePendingGiftCardOrderDto } from './dto/create-pending-gift-card-order.dto';
import { UpdatePendingGiftCardOrderDto } from './dto/update-pending-gift-card-order.dto';
import { Cart } from '../cart/entities/cart.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PendingGiftCardOrdersService {
  constructor(
    @Inject('PENDING_GIFT_CARD_ORDERS_REPOSITORY')
    private readonly pendingGiftCardOrdersRepository: Repository<PendingGiftCardOrder>,
    @Inject('CART_REPOSITORY')
    private readonly cartRepository: Repository<Cart>,
    @Inject('USERS_REPOSITORY')
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Crear una nueva orden pendiente de gift card
   */
  async create(
    createDto: CreatePendingGiftCardOrderDto,
  ): Promise<PendingGiftCardOrder> {
    // Verificar que el carrito existe
    const cartExists = await this.cartRepository.findOne({
      where: { id: createDto.cartId },
    });

    if (!cartExists) {
      throw new NotFoundException(
        `Carrito con ID ${createDto.cartId} no encontrado`,
      );
    }

    // Verificar que el usuario existe
    const userExists = await this.usersRepository.findOne({
      where: { id: createDto.userId },
    });

    if (!userExists) {
      throw new NotFoundException(
        `Usuario con ID ${createDto.userId} no encontrado`,
      );
    }

    const newOrder = this.pendingGiftCardOrdersRepository.create(createDto);
    return await this.pendingGiftCardOrdersRepository.save(newOrder);
  }

  /**
   * Obtener todas las órdenes pendientes
   */
  async findAll(): Promise<PendingGiftCardOrder[]> {
    return await this.pendingGiftCardOrdersRepository.find({
      relations: ['cart', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una orden pendiente por ID
   */
  async findOne(id: string): Promise<PendingGiftCardOrder> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const order = await this.pendingGiftCardOrdersRepository.findOne({
      where: { id },
      relations: ['cart', 'user'],
    });

    if (!order) {
      throw new NotFoundException(
        `Orden pendiente con ID ${id} no encontrada`,
      );
    }

    return order;
  }

  /**
   * Obtener órdenes pendientes por userId
   */
  async findByUserId(userId: string): Promise<PendingGiftCardOrder[]> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    return await this.pendingGiftCardOrdersRepository.find({
      where: { userId },
      relations: ['cart'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener órdenes pendientes por cartId
   */
  async findByCartId(cartId: string): Promise<PendingGiftCardOrder[]> {
    if (!cartId) {
      throw new BadRequestException('El cartId es requerido');
    }

    return await this.pendingGiftCardOrdersRepository.find({
      where: { cartId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener órdenes pendientes no procesadas
   */
  async findUnprocessed(): Promise<PendingGiftCardOrder[]> {
    return await this.pendingGiftCardOrdersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.cart', 'cart')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.processed_at IS NULL')
      .orderBy('order.created_at', 'DESC')
      .getMany();
  }

  /**
   * Actualizar una orden pendiente
   */
  async update(
    id: string,
    updateDto: UpdatePendingGiftCardOrderDto,
  ): Promise<PendingGiftCardOrder> {
    // Verificar que existe
    await this.findOne(id);

    // Si se actualiza el carrito, verificar que existe
    if (updateDto.cartId) {
      const cartExists = await this.cartRepository.findOne({
        where: { id: updateDto.cartId },
      });

      if (!cartExists) {
        throw new NotFoundException(
          `Carrito con ID ${updateDto.cartId} no encontrado`,
        );
      }
    }

    // Si se actualiza el usuario, verificar que existe
    if (updateDto.userId) {
      const userExists = await this.usersRepository.findOne({
        where: { id: updateDto.userId },
      });

      if (!userExists) {
        throw new NotFoundException(
          `Usuario con ID ${updateDto.userId} no encontrado`,
        );
      }
    }

    // Actualizar
    await this.pendingGiftCardOrdersRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Marcar como procesada
   */
  async markAsProcessed(id: string): Promise<PendingGiftCardOrder> {
    // Verificar que existe
    await this.findOne(id);

    // Actualizar processed_at
    await this.pendingGiftCardOrdersRepository.update(id, {
      processedAt: new Date(),
    });

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar una orden pendiente
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.findOne(id);

    // Eliminar
    await this.pendingGiftCardOrdersRepository.delete(id);

    return {
      message: `Orden pendiente con ID ${id} eliminada exitosamente`,
    };
  }
}
