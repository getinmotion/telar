import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cart, CartStatus, SaleContext } from './entities/cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UpdateCartStatusDto } from './dto/update-cart-status.dto';
import {
  SyncGuestCartDto,
  SyncGuestCartResponseDto,
} from './dto/sync-guest-cart.dto';
import { User } from '../users/entities/user.entity';
import { ArtisanShop } from '../artisan-shops/entities/artisan-shop.entity';
import { CartItem, PriceSource } from '../cart-items/entities/cart-item.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @Inject('CART_REPOSITORY')
    private readonly cartRepository: Repository<Cart>,
    @Inject('USERS_REPOSITORY')
    private readonly usersRepository: Repository<User>,
    @Inject('ARTISAN_SHOPS_REPOSITORY')
    private readonly artisanShopsRepository: Repository<ArtisanShop>,
    @Inject('CART_ITEMS_REPOSITORY')
    private readonly cartItemsRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Crear un nuevo carrito
   */
  async create(createDto: CreateCartDto): Promise<Cart> {
    // Verificar que el usuario existe
    const userExists = await this.usersRepository.findOne({
      where: { id: createDto.buyerUserId },
    });

    if (!userExists) {
      throw new NotFoundException(
        `Usuario con ID ${createDto.buyerUserId} no encontrado`,
      );
    }

    // Si el contexto es tenant, verificar que la tienda existe
    if (createDto.context === SaleContext.TENANT) {
      if (!createDto.contextShopId) {
        throw new BadRequestException(
          'contextShopId es requerido cuando el contexto es tenant',
        );
      }

      const shopExists = await this.artisanShopsRepository.findOne({
        where: { id: createDto.contextShopId },
      });

      if (!shopExists) {
        throw new NotFoundException(
          `Tienda con ID ${createDto.contextShopId} no encontrada`,
        );
      }
    }

    const newCart = this.cartRepository.create(createDto);
    return await this.cartRepository.save(newCart);
  }

  /**
   * Obtener todos los carritos
   */
  async findAll(): Promise<Cart[]> {
    return await this.cartRepository.find({
      relations: ['buyer', 'contextShop'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un carrito por ID
   */
  async findOne(id: string): Promise<Cart> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const cart = await this.cartRepository.findOne({
      where: { id },
      relations: ['buyer', 'contextShop'],
    });

    if (!cart) {
      throw new NotFoundException(`Carrito con ID ${id} no encontrado`);
    }

    return cart;
  }

  /**
   * Obtener carritos por buyerUserId
   */
  async findByBuyerId(buyerUserId: string): Promise<Cart[]> {
    if (!buyerUserId) {
      throw new BadRequestException('El buyerUserId es requerido');
    }

    return await this.cartRepository.find({
      where: { buyerUserId },
      relations: ['buyer', 'contextShop'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener carrito abierto del usuario
   */
  async findOpenCartByBuyerId(buyerUserId: string): Promise<Cart | null> {
    if (!buyerUserId) {
      throw new BadRequestException('El buyerUserId es requerido');
    }

    const cart = await this.cartRepository.findOne({
      where: { buyerUserId, status: CartStatus.OPEN },
      relations: ['buyer', 'contextShop'],
      order: { createdAt: 'DESC' },
    });

    return cart || null;
  }

  /**
   * Actualizar un carrito
   */
  async update(id: string, updateDto: UpdateCartDto): Promise<Cart> {
    // Verificar que existe
    await this.findOne(id);

    // Si se actualiza el contexto a tenant, verificar que hay contextShopId
    if (
      updateDto.context === SaleContext.TENANT &&
      !updateDto.contextShopId
    ) {
      throw new BadRequestException(
        'contextShopId es requerido cuando el contexto es tenant',
      );
    }

    // Si se proporciona contextShopId, verificar que la tienda existe
    if (updateDto.contextShopId) {
      const shopExists = await this.artisanShopsRepository.findOne({
        where: { id: updateDto.contextShopId },
      });

      if (!shopExists) {
        throw new NotFoundException(
          `Tienda con ID ${updateDto.contextShopId} no encontrada`,
        );
      }
    }

    // Actualizar
    await this.cartRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Actualizar estado del carrito
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateCartStatusDto,
  ): Promise<Cart> {
    // Verificar que existe
    const cart = await this.findOne(id);

    const updateData: Partial<Cart> = { status: updateStatusDto.status };

    // Actualizar timestamps según el estado
    if (updateStatusDto.status === CartStatus.LOCKED) {
      updateData.lockedAt = new Date();
    } else if (updateStatusDto.status === CartStatus.CONVERTED) {
      updateData.convertedAt = new Date();
    }

    // Actualizar
    await this.cartRepository.update(id, updateData);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un carrito
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.findOne(id);

    // Eliminar
    await this.cartRepository.delete(id);

    return {
      message: `Carrito con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Sincronizar carrito de invitado a carrito de usuario autenticado
   * Migración de la edge function sync-guest-cart de Supabase
   */
  async syncGuestCart(
    dto: SyncGuestCartDto,
  ): Promise<SyncGuestCartResponseDto> {
    // 1. Buscar o crear carrito
    let cart = await this.findOpenCartByBuyerId(dto.buyerUserId);

    if (!cart) {
      // Crear nuevo carrito
      cart = await this.create({
        buyerUserId: dto.buyerUserId,
        context: SaleContext.MARKETPLACE,
        currency: 'COP',
      });
    }

    // 2. Buscar productos en bulk
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.productsService.findByIds(productIds);

    // Crear Map para búsqueda rápida
    const productMap = new Map(products.map((p) => [p.id, p]));

    // 3. Buscar items existentes en el carrito
    const existingItems = await this.cartItemsRepository.find({
      where: { cartId: cart.id },
    });

    // Crear map: "productId:variantId" -> CartItem
    const existingItemsMap = new Map(
      existingItems.map((item) => {
        const key = `${item.productId}:${item.metadata?.variantId || ''}`;
        return [key, item];
      }),
    );

    // 4. Validar y enriquecer items
    const cartItemsToCreate: any[] = [];
    const cartItemsToUpdate: any[] = [];

    for (const item of dto.items) {
      const product = productMap.get(item.productId);

      // Omitir si el producto no existe o está inactivo
      if (!product || !product.active) {
        continue;
      }

      // Convertir precio a unidades menores (centavos)
      const unitPriceMinor = Math.round(
        Number(product.price) * 100,
      ).toString();

      // Construir metadata para variante
      const metadata = item.variantId ? { variantId: item.variantId } : {};

      // Verificar si el item ya existe en el carrito
      const itemKey = `${product.id}:${item.variantId || ''}`;
      const existingItem = existingItemsMap.get(itemKey);

      if (existingItem) {
        // Sumar cantidades (merge)
        existingItem.quantity += item.quantity;
        cartItemsToUpdate.push(existingItem);
      } else {
        // Crear nuevo item
        cartItemsToCreate.push({
          cartId: cart.id,
          productId: product.id,
          sellerShopId: product.shopId,
          quantity: item.quantity,
          currency: 'COP',
          unitPriceMinor,
          priceSource: PriceSource.PRODUCT_BASE,
          metadata,
        });
      }
    }

    // 5. Insertar/actualizar items en bulk
    const createdItems =
      cartItemsToCreate.length > 0
        ? await this.cartItemsRepository.save(cartItemsToCreate)
        : [];

    const updatedItems =
      cartItemsToUpdate.length > 0
        ? await this.cartItemsRepository.save(cartItemsToUpdate)
        : [];

    const totalItemsCreated = createdItems.length + updatedItems.length;

    // 6. Retornar respuesta
    return {
      success: true,
      cartId: cart.id,
      itemsCreated: totalItemsCreated,
    };
  }
}
