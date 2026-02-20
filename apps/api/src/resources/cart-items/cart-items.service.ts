import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { ArtisanShop } from '../artisan-shops/entities/artisan-shop.entity';

@Injectable()
export class CartItemsService {
  constructor(
    @Inject('CART_ITEMS_REPOSITORY')
    private readonly cartItemsRepository: Repository<CartItem>,
    @Inject('CART_REPOSITORY')
    private readonly cartRepository: Repository<Cart>,
    @Inject('PRODUCTS_REPOSITORY')
    private readonly productsRepository: Repository<Product>,
    @Inject('ARTISAN_SHOPS_REPOSITORY')
    private readonly artisanShopsRepository: Repository<ArtisanShop>,
  ) {}

  /**
   * Crear un nuevo item en el carrito
   */
  async create(createDto: CreateCartItemDto): Promise<CartItem> {
    // Verificar que el carrito existe
    const cartExists = await this.cartRepository.findOne({
      where: { id: createDto.cartId },
    });

    if (!cartExists) {
      throw new NotFoundException(
        `Carrito con ID ${createDto.cartId} no encontrado`,
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

    // Verificar que la tienda vendedora existe
    const shopExists = await this.artisanShopsRepository.findOne({
      where: { id: createDto.sellerShopId },
    });

    if (!shopExists) {
      throw new NotFoundException(
        `Tienda con ID ${createDto.sellerShopId} no encontrada`,
      );
    }

    const newCartItem = this.cartItemsRepository.create(createDto);
    return await this.cartItemsRepository.save(newCartItem);
  }

  /**
   * Obtener todos los items del carrito
   */
  async findAll(): Promise<CartItem[]> {
    return await this.cartItemsRepository.find({
      relations: ['cart', 'product', 'sellerShop'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un item del carrito por ID
   */
  async findOne(id: string): Promise<CartItem> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const cartItem = await this.cartItemsRepository.findOne({
      where: { id },
      relations: ['cart', 'product', 'sellerShop'],
    });

    if (!cartItem) {
      throw new NotFoundException(
        `Item del carrito con ID ${id} no encontrado`,
      );
    }

    return cartItem;
  }

  /**
   * Obtener items por cartId
   */
  async findByCartId(cartId: string): Promise<CartItem[]> {
    if (!cartId) {
      throw new BadRequestException('El cartId es requerido');
    }

    return await this.cartItemsRepository.find({
      where: { cartId },
      relations: ['product', 'sellerShop'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar un item del carrito
   */
  async update(id: string, updateDto: UpdateCartItemDto): Promise<CartItem> {
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
    await this.cartItemsRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un item del carrito
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.findOne(id);

    // Eliminar
    await this.cartItemsRepository.delete(id);

    return {
      message: `Item del carrito con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Eliminar todos los items de un carrito
   */
  async removeByCartId(cartId: string): Promise<{ message: string }> {
    if (!cartId) {
      throw new BadRequestException('El cartId es requerido');
    }

    const result = await this.cartItemsRepository.delete({ cartId });

    return {
      message: `${result.affected || 0} items del carrito eliminados exitosamente`,
    };
  }
}
