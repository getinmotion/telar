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
import { ImageUrlBuilder } from '../../common/utils/image-url-builder.util';

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
      sortBy = 'created_at',
      order = 'DESC',
    } = query;

    // Construir WHERE conditions dinámicamente
    const whereConditions: string[] = [];
    const parameters: any[] = [];
    let paramIndex = 1;

    if (active !== undefined) {
      whereConditions.push(`s.active = $${paramIndex}`);
      parameters.push(active);
      paramIndex++;
    }

    if (publishStatus) {
      whereConditions.push(`s.publish_status = $${paramIndex}`);
      parameters.push(publishStatus);
      paramIndex++;
    }

    if (marketplaceApproved !== undefined) {
      whereConditions.push(`s.marketplace_approved = $${paramIndex}`);
      parameters.push(marketplaceApproved);
      paramIndex++;
    }

    if (featured !== undefined) {
      whereConditions.push(`s.featured = $${paramIndex}`);
      parameters.push(featured);
      paramIndex++;
    }

    if (shopSlug) {
      whereConditions.push(`s.shop_slug = $${paramIndex}`);
      parameters.push(shopSlug);
      paramIndex++;
    }

    if (region) {
      whereConditions.push(`s.region = $${paramIndex}`);
      parameters.push(region);
      paramIndex++;
    }

    if (craftType) {
      whereConditions.push(`s.craft_type = $${paramIndex}`);
      parameters.push(craftType);
      paramIndex++;
    }

    // Manejo especial para hasApprovedProducts
    let fromClause = 'shop.artisan_shops s';
    if (hasApprovedProducts === true) {
      fromClause = `shop.artisan_shops s
        INNER JOIN shop.products p ON p.shop_id = s.id`;
      whereConditions.push(
        `p.moderation_status IN ('approved', 'approved_with_edits')`,
      );
    }

    const whereClause =
      whereConditions.length > 0
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

    // Ordenamiento
    const orderByColumn =
      sortBy === 'shop_name' ? 's.shop_name' : 's.created_at';

    // DISTINCT ON requiere que el primer campo de ORDER BY sea s.id
    // Luego ordenamos por la columna que el usuario solicitó
    const orderByClause = `ORDER BY s.id, ${orderByColumn} ${order}`;

    // Paginación
    const offset = (page - 1) * limit;

    // Query 1: COUNT total
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM ${fromClause}
      ${whereClause}
    `;

    // Query 2: DATA con relaciones
    const dataQuery = `
      SELECT DISTINCT ON (s.id)
        s.id,
        s.user_id,
        s.shop_name,
        s.shop_slug,
        s.description,
        s.story,
        s.logo_url,
        s.banner_url,
        s.craft_type,
        s.region,
        s.certifications,
        s.contact_info,
        s.social_links,
        s.active,
        s.featured,
        s.servientrega_coverage,
        s.seo_data,
        s.created_at,
        s.updated_at,
        s.privacy_level,
        s.data_classification,
        s.public_profile,
        s.creation_status,
        s.creation_step,
        s.primary_colors,
        s.secondary_colors,
        s.brand_claim,
        s.hero_config,
        s.about_content,
        s.contact_config,
        s.active_theme_id,
        s.publish_status,
        s.marketplace_approved,
        s.marketplace_approved_at,
        s.marketplace_approved_by,
        s.id_contraparty,
        s.artisan_profile,
        s.artisan_profile_completed,
        s.bank_data_status,
        s.marketplace_approval_status,
        s.department,
        s.municipality,
        u.id as user_id_rel,
        u.email as user_email,
        u.email_confirmed_at as user_email_confirmed_at
      FROM ${fromClause}
      LEFT JOIN auth.users u ON u.id = s.user_id
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Ejecutar queries
    const countResult = await this.artisanShopsRepository.query(
      countQuery,
      parameters,
    );
    const total = parseInt(countResult[0]?.total || '0');

    const dataResult = await this.artisanShopsRepository.query(dataQuery, [
      ...parameters,
      limit,
      offset,
    ]);

    // Mapear resultados a entidades ArtisanShop
    const data = dataResult.map((row: any) => {
      const shop = new ArtisanShop();
      shop.id = row.id;
      shop.userId = row.user_id;
      shop.shopName = row.shop_name;
      shop.shopSlug = row.shop_slug;
      shop.description = row.description;
      shop.story = row.story;

      // Transformar URLs de imágenes con ImageUrlBuilder (igual que @AfterLoad)
      shop.logoUrl = ImageUrlBuilder.buildUrl(row.logo_url);
      shop.bannerUrl = ImageUrlBuilder.buildUrl(row.banner_url);

      shop.craftType = row.craft_type;
      shop.region = row.region;
      shop.certifications = row.certifications;
      shop.contactInfo = row.contact_info;
      shop.socialLinks = row.social_links;
      shop.active = row.active;
      shop.featured = row.featured;
      shop.servientregaCoverage = row.servientrega_coverage;
      shop.seoData = row.seo_data;
      shop.createdAt = row.created_at;
      shop.updatedAt = row.updated_at;
      shop.privacyLevel = row.privacy_level;
      shop.dataClassification = row.data_classification;
      shop.publicProfile = row.public_profile;
      shop.creationStatus = row.creation_status;
      shop.creationStep = row.creation_step;
      shop.primaryColors = row.primary_colors;
      shop.secondaryColors = row.secondary_colors;
      shop.brandClaim = row.brand_claim;

      // Transformar objetos JSONB con imágenes anidadas
      shop.heroConfig = ImageUrlBuilder.transformObject(row.hero_config);

      shop.aboutContent = row.about_content;
      shop.contactConfig = row.contact_config;
      shop.activeThemeId = row.active_theme_id;
      shop.publishStatus = row.publish_status;
      shop.marketplaceApproved = row.marketplace_approved;
      shop.marketplaceApprovedAt = row.marketplace_approved_at;
      shop.marketplaceApprovedBy = row.marketplace_approved_by;
      shop.idContraparty = row.id_contraparty;

      // Transformar artisan_profile con imágenes
      shop.artisanProfile = ImageUrlBuilder.transformObject(
        row.artisan_profile,
      );

      shop.artisanProfileCompleted = row.artisan_profile_completed;
      shop.bankDataStatus = row.bank_data_status;
      shop.marketplaceApprovalStatus = row.marketplace_approval_status;
      shop.department = row.department;
      shop.municipality = row.municipality;

      // Construir relación user si existe
      if (row.user_id_rel) {
        shop.user = {
          id: row.user_id_rel,
          email: row.user_email,
          emailConfirmedAt: row.user_email_confirmed_at,
        } as any;
      }

      return shop;
    });

    return {
      data,
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
