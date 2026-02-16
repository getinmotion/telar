import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class WishlistService {
  constructor(
    @Inject('WISHLIST_REPOSITORY')
    private readonly wishlistRepository: Repository<Wishlist>,
    @Inject('USER_PROFILES_REPOSITORY')
    private readonly userProfileRepository: Repository<UserProfile>,
    @Inject('PRODUCTS_REPOSITORY')
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Crear un nuevo item en wishlist
   */
  async create(createDto: CreateWishlistDto): Promise<Wishlist> {
    // Verificar que el usuario existe
    const userExists = await this.userProfileRepository.findOne({
      where: { userId: createDto.userId },
    });

    if (!userExists) {
      throw new NotFoundException(
        `Usuario con ID ${createDto.userId} no encontrado`,
      );
    }

    // Verificar que el producto existe
    const productExists = await this.productRepository.findOne({
      where: { id: createDto.productId },
    });

    if (!productExists) {
      throw new NotFoundException(
        `Producto con ID ${createDto.productId} no encontrado`,
      );
    }

    // Verificar si ya existe este producto en la wishlist del usuario
    const existing = await this.wishlistRepository.findOne({
      where: {
        userId: createDto.userId,
        productId: createDto.productId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Este producto ya está en la wishlist del usuario',
      );
    }

    const newWishlistItem = this.wishlistRepository.create(createDto);
    return await this.wishlistRepository.save(newWishlistItem);
  }

  /**
   * Obtener todos los items de wishlist
   */
  async getAll(): Promise<Wishlist[]> {
    return await this.wishlistRepository.find({
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un item de wishlist por ID
   */
  async getById(id: string): Promise<Wishlist> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const wishlistItem = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!wishlistItem) {
      throw new NotFoundException(`Wishlist item con ID ${id} no encontrado`);
    }

    return wishlistItem;
  }

  /**
   * Obtener wishlist por userId
   */
  async getByUserId(userId: string): Promise<Wishlist[]> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    return await this.wishlistRepository.find({
      where: { userId },
      relations: ['product', 'product.shop'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar un item de wishlist
   */
  async update(id: string, updateDto: UpdateWishlistDto): Promise<Wishlist> {
    // Verificar que existe
    await this.getById(id);

    // Si se actualiza userId o productId, verificar que no exista otro con esa combinación
    if (updateDto.userId || updateDto.productId) {
      const current = await this.wishlistRepository.findOne({ where: { id } });

      const existing = await this.wishlistRepository.findOne({
        where: {
          userId: updateDto.userId || current!.userId,
          productId: updateDto.productId || current!.productId,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Ya existe otro wishlist item con ese userId y productId',
        );
      }
    }

    // Actualizar
    await this.wishlistRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar un item de wishlist
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Eliminar
    await this.wishlistRepository.delete(id);

    return {
      message: `Wishlist item con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Eliminar por userId y productId
   */
  async deleteByUserAndProduct(
    userId: string,
    productId: string,
  ): Promise<{ message: string }> {
    const wishlistItem = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });

    if (!wishlistItem) {
      throw new NotFoundException(
        `No se encontró el producto en la wishlist del usuario`,
      );
    }

    await this.wishlistRepository.delete(wishlistItem.id);

    return {
      message: 'Producto eliminado de wishlist exitosamente',
    };
  }
}
