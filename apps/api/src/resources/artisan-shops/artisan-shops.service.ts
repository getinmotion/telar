import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtisanShop } from './entities/artisan-shop.entity';
import { CreateArtisanShopDto } from './dto/create-artisan-shop.dto';
import { UpdateArtisanShopDto } from './dto/update-artisan-shop.dto';

@Injectable()
export class ArtisanShopsService {
  constructor(
    @Inject('ARTISAN_SHOPS_REPOSITORY')
    private readonly artisanShopsRepository: Repository<ArtisanShop>,
  ) {}

  /**
   * Crear una nueva tienda de artesano
   */
  async create(createDto: CreateArtisanShopDto): Promise<ArtisanShop> {
    // Verificar si ya existe una tienda con ese slug
    const existingSlug = await this.artisanShopsRepository.findOne({
      where: { shopSlug: createDto.shopSlug },
    });

    if (existingSlug) {
      throw new ConflictException(
        `Ya existe una tienda con el slug ${createDto.shopSlug}`,
      );
    }

    // Verificar si el usuario ya tiene una tienda
    const existingUserShop = await this.artisanShopsRepository.findOne({
      where: { userId: createDto.userId },
    });

    if (existingUserShop) {
      throw new ConflictException('El usuario ya tiene una tienda registrada');
    }

    const newShop = this.artisanShopsRepository.create(createDto);
    return await this.artisanShopsRepository.save(newShop);
  }

  /**
   * Obtener todas las tiendas
   */
  async getAll(): Promise<ArtisanShop[]> {
    return await this.artisanShopsRepository.find({
      relations: ['user', 'activeTheme'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una tienda por ID
   */
  async getById(id: string): Promise<ArtisanShop> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const shop = await this.artisanShopsRepository.findOne({
      where: { id },
      relations: ['user', 'activeTheme'],
    });

    if (!shop) {
      throw new NotFoundException(`Tienda con ID ${id} no encontrada`);
    }

    return shop;
  }

  /**
   * Obtener tienda por userId (relación 1:1)
   */
  async getByUserId(userId: string): Promise<ArtisanShop | null> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    const shop = await this.artisanShopsRepository.findOne({
      where: { userId },
      relations: ['user', 'activeTheme'],
    });

    return shop; // Puede ser null si el usuario no tiene tienda
  }

  /**
   * Obtener tienda por slug
   */
  async getBySlug(slug: string): Promise<ArtisanShop> {
    if (!slug) {
      throw new BadRequestException('El slug es requerido');
    }

    const shop = await this.artisanShopsRepository.findOne({
      where: { shopSlug: slug },
      relations: ['user', 'activeTheme'],
    });

    if (!shop) {
      throw new NotFoundException(`Tienda con slug ${slug} no encontrada`);
    }

    return shop;
  }

  /**
   * Obtener tiendas por departamento
   */
  async getByDepartment(department: string): Promise<ArtisanShop[]> {
    return await this.artisanShopsRepository.find({
      where: { department },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener tiendas por municipio
   */
  async getByMunicipality(municipality: string): Promise<ArtisanShop[]> {
    return await this.artisanShopsRepository.find({
      where: { municipality },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener tiendas activas
   */
  async getActive(): Promise<ArtisanShop[]> {
    return await this.artisanShopsRepository.find({
      where: { active: true },
      relations: ['user', 'activeTheme'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener tiendas destacadas
   */
  async getFeatured(): Promise<ArtisanShop[]> {
    return await this.artisanShopsRepository.find({
      where: { featured: true, active: true },
      relations: ['user', 'activeTheme'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener tiendas con perfil completo
   */
  async getWithCompletedProfile(): Promise<ArtisanShop[]> {
    return await this.artisanShopsRepository.find({
      where: { artisanProfileCompleted: true },
      relations: ['user', 'activeTheme'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar una tienda
   */
  async update(
    id: string,
    updateDto: UpdateArtisanShopDto,
  ): Promise<ArtisanShop> {
    // Verificar que existe
    await this.getById(id);

    // Si se actualiza el slug, verificar que no exista otro con ese slug
    if (updateDto.shopSlug) {
      const existingSlug = await this.artisanShopsRepository.findOne({
        where: { shopSlug: updateDto.shopSlug },
      });

      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException(
          `Ya existe otra tienda con el slug ${updateDto.shopSlug}`,
        );
      }
    }

    // Actualizar
    await this.artisanShopsRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar una tienda
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Eliminar
    await this.artisanShopsRepository.delete(id);

    return {
      message: `Tienda con ID ${id} eliminada exitosamente`,
    };
  }
}
