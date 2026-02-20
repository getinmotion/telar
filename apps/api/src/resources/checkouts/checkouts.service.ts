import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Checkout, SaleContext } from './entities/checkout.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { UpdateCheckoutDto } from './dto/update-checkout.dto';
import { UpdateCheckoutStatusDto } from './dto/update-checkout-status.dto';
import { Cart } from '../cart/entities/cart.entity';
import { User } from '../users/entities/user.entity';
import { ArtisanShop } from '../artisan-shops/entities/artisan-shop.entity';

@Injectable()
export class CheckoutsService {
  constructor(
    @Inject('CHECKOUTS_REPOSITORY')
    private readonly checkoutsRepository: Repository<Checkout>,
    @Inject('CART_REPOSITORY')
    private readonly cartRepository: Repository<Cart>,
    @Inject('USERS_REPOSITORY')
    private readonly usersRepository: Repository<User>,
    @Inject('ARTISAN_SHOPS_REPOSITORY')
    private readonly artisanShopsRepository: Repository<ArtisanShop>,
  ) {}

  /**
   * Crear un nuevo checkout
   */
  async create(createDto: CreateCheckoutDto): Promise<Checkout> {
    // Validar que el carrito existe
    const cart = await this.cartRepository.findOne({
      where: { id: createDto.cartId },
    });
    if (!cart) {
      throw new NotFoundException(
        `Carrito con ID ${createDto.cartId} no encontrado`,
      );
    }

    // Validar que el usuario existe
    const user = await this.usersRepository.findOne({
      where: { id: createDto.buyerUserId },
    });
    if (!user) {
      throw new NotFoundException(
        `Usuario con ID ${createDto.buyerUserId} no encontrado`,
      );
    }

    // Validar contexto y context_shop_id
    if (createDto.context === SaleContext.TENANT) {
      if (!createDto.contextShopId) {
        throw new BadRequestException(
          'contextShopId es requerido cuando el contexto es tenant',
        );
      }

      // Validar que la tienda existe
      const shop = await this.artisanShopsRepository.findOne({
        where: { id: createDto.contextShopId },
      });
      if (!shop) {
        throw new NotFoundException(
          `Tienda con ID ${createDto.contextShopId} no encontrada`,
        );
      }
    } else if (
      createDto.context === SaleContext.MARKETPLACE &&
      createDto.contextShopId
    ) {
      throw new BadRequestException(
        'contextShopId debe ser null cuando el contexto es marketplace',
      );
    }

    // Validar que la clave de idempotencia sea única
    const existingCheckout = await this.checkoutsRepository.findOne({
      where: { idempotencyKey: createDto.idempotencyKey },
    });
    if (existingCheckout) {
      throw new BadRequestException(
        `Ya existe un checkout con la clave de idempotencia ${createDto.idempotencyKey}`,
      );
    }

    const newCheckout = this.checkoutsRepository.create(createDto);
    return await this.checkoutsRepository.save(newCheckout);
  }

  /**
   * Obtener todos los checkouts
   */
  async findAll(): Promise<Checkout[]> {
    return await this.checkoutsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un checkout por ID
   */
  async findOne(id: string): Promise<Checkout> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const checkout = await this.checkoutsRepository.findOne({
      where: { id },
    });

    if (!checkout) {
      throw new NotFoundException(`Checkout con ID ${id} no encontrado`);
    }

    return checkout;
  }

  /**
   * Obtener checkouts por buyer_user_id
   */
  async findByBuyerUserId(buyerUserId: string): Promise<Checkout[]> {
    if (!buyerUserId) {
      throw new BadRequestException('El buyerUserId es requerido');
    }

    return await this.checkoutsRepository.find({
      where: { buyerUserId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener checkout por cart_id
   */
  async findByCartId(cartId: string): Promise<Checkout | null> {
    if (!cartId) {
      throw new BadRequestException('El cartId es requerido');
    }

    return await this.checkoutsRepository.findOne({
      where: { cartId },
    });
  }

  /**
   * Actualizar un checkout
   */
  async update(
    id: string,
    updateDto: UpdateCheckoutDto,
  ): Promise<Checkout> {
    // Verificar que existe
    await this.findOne(id);

    // Si se actualiza el contexto o contextShopId, validar
    if (updateDto.context !== undefined) {
      if (updateDto.context === SaleContext.TENANT) {
        if (!updateDto.contextShopId) {
          throw new BadRequestException(
            'contextShopId es requerido cuando el contexto es tenant',
          );
        }
      } else if (updateDto.context === SaleContext.MARKETPLACE) {
        if (updateDto.contextShopId) {
          throw new BadRequestException(
            'contextShopId debe ser null cuando el contexto es marketplace',
          );
        }
      }
    }

    // Si se actualiza contextShopId, validar que exista
    if (updateDto.contextShopId) {
      const shop = await this.artisanShopsRepository.findOne({
        where: { id: updateDto.contextShopId },
      });
      if (!shop) {
        throw new NotFoundException(
          `Tienda con ID ${updateDto.contextShopId} no encontrada`,
        );
      }
    }

    // Si se actualiza la clave de idempotencia, verificar que sea única
    if (updateDto.idempotencyKey) {
      const existingCheckout = await this.checkoutsRepository.findOne({
        where: { idempotencyKey: updateDto.idempotencyKey },
      });

      if (existingCheckout && existingCheckout.id !== id) {
        throw new BadRequestException(
          `Ya existe un checkout con la clave de idempotencia ${updateDto.idempotencyKey}`,
        );
      }
    }

    // Actualizar
    await this.checkoutsRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Actualizar solo el estado de un checkout
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateCheckoutStatusDto,
  ): Promise<Checkout> {
    // Verificar que existe
    await this.findOne(id);

    // Actualizar solo el status
    await this.checkoutsRepository.update(id, {
      status: updateStatusDto.status,
    });

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un checkout
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.findOne(id);

    // Eliminar
    await this.checkoutsRepository.delete(id);

    return {
      message: `Checkout con ID ${id} eliminado exitosamente`,
    };
  }
}
