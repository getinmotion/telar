import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { ArtisanShop } from './entities/artisan-shop.entity';
import { CreateArtisanShopDto } from './dto/create-artisan-shop.dto';
import { UpdateArtisanShopDto } from './dto/update-artisan-shop.dto';
import { ArtisanShopsQueryDto } from './dto/artisan-shops-query.dto';

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
   * Obtener todas las tiendas con filtros y paginación
   */
  async getAll(query: ArtisanShopsQueryDto): Promise<{
    data: ArtisanShop[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 20,
      active,
      publishStatus,
      marketplaceApproved,
      featured,
      hasApprovedProducts,
      shopSlug,
      region,
      craftType,
      sortBy = 'createdAt',
      order = 'DESC',
    } = query;

    const queryBuilder = this.artisanShopsRepository
      .createQueryBuilder('shop')
      .leftJoinAndSelect('shop.user', 'user')
      .leftJoinAndSelect('shop.activeTheme', 'activeTheme');

    // Filtro: active
    if (active !== undefined) {
      queryBuilder.andWhere('shop.active = :active', { active });
    }

    // Filtro: publishStatus
    if (publishStatus) {
      queryBuilder.andWhere('shop.publish_status = :publishStatus', {
        publishStatus,
      });
    }

    // Filtro: marketplaceApproved
    if (marketplaceApproved !== undefined) {
      queryBuilder.andWhere(
        'shop.marketplace_approved = :marketplaceApproved',
        { marketplaceApproved },
      );
    }

    // Filtro: featured
    if (featured !== undefined) {
      queryBuilder.andWhere('shop.featured = :featured', { featured });
    }

    // Filtro: hasApprovedProducts (solo tiendas con productos aprobados)
    if (hasApprovedProducts === true) {
      queryBuilder
        .innerJoin('shop.products', 'product')
        .andWhere('product.moderation_status IN (:...statuses)', {
          statuses: ['approved', 'approved_with_edits'],
        });
    }

    // Filtro: shopSlug
    if (shopSlug) {
      queryBuilder.andWhere('shop.shop_slug = :shopSlug', { shopSlug });
    }

    // Filtro: region
    if (region) {
      queryBuilder.andWhere('shop.region = :region', { region });
    }

    // Filtro: craftType
    if (craftType) {
      queryBuilder.andWhere('shop.craft_type = :craftType', { craftType });
    }

    // Ordenamiento
    const orderByColumn = sortBy === 'shopName' ? 'shop.shop_name' : 'shop.created_at';
    queryBuilder.orderBy(orderByColumn, order);

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Ejecutar query
    const [data, total] = await queryBuilder.getManyAndCount();

    // Si hasApprovedProducts está activo, eliminar duplicados
    let uniqueData = data;
    if (hasApprovedProducts === true) {
      uniqueData = data.filter(
        (shop, index, self) =>
          index === self.findIndex((s) => s.id === shop.id),
      );
    }

    return {
      data: uniqueData,
      total,
      page,
      limit,
    };
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
   * Obtener tiendas destacadas con productos aprobados
   * - Solo tiendas activas, publicadas y aprobadas en marketplace
   * - Solo tiendas con al menos 1 producto aprobado
   * - Ordenadas por fecha de creación (más recientes primero)
   * @param limit Cantidad máxima de tiendas a retornar (default: 8)
   */
  async getFeatured(limit: number = 8): Promise<ArtisanShop[]> {
    // Paso 1: Obtener IDs de tiendas que tienen productos aprobados usando query raw
    const shopIdsResult = await this.artisanShopsRepository.query(
      `
      SELECT s.id
      FROM shop.artisan_shops s
      WHERE s.active = $1
        AND s.publish_status = $2
        AND s.marketplace_approved = $3
        AND EXISTS (
          SELECT 1 FROM shop.products p
          WHERE p.shop_id = s.id
            AND p.moderation_status IN ('approved', 'approved_with_edits')
        )
      LIMIT $4
      `,
      [true, 'published', true, limit],
    );

    const shopIds = shopIdsResult.map((row: { id: string }) => row.id);

    // Si no hay tiendas que cumplan los criterios, retornar array vacío
    if (shopIds.length === 0) {
      return [];
    }

    // Paso 2: Obtener las tiendas completas con sus relaciones y ordenadas
    return await this.artisanShopsRepository.find({
      where: { id: In(shopIds) },
      relations: ['user', 'activeTheme'],
      order: { createdAt: 'DESC' },
      take: limit,
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
