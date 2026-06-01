import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Repository, IsNull } from 'typeorm';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import {
  Store,
  StoreContacts,
  StoreAward,
  StoreBadge,
  ArtisanShop,
  StoreArtisanalProfile,
} from './entities';

@Injectable()
export class StoresService {
  constructor(
    @Inject('STORES_REPOSITORY')
    private readonly storeRepository: Repository<Store>,
    @Inject('ARTISAN_SHOPS_REPOSITORY')
    private readonly artisanShopRepository: Repository<ArtisanShop>,
    @Inject('STORE_ARTISANAL_PROFILE_REPOSITORY')
    private readonly artisanalProfileRepo: Repository<StoreArtisanalProfile>,
  ) {}

  /**
   * Crear nueva tienda
   */
  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const store = this.storeRepository.create(createStoreDto);
    return await this.storeRepository.save(store);
  }

  /**
   * Obtener todas las tiendas con datos legacy
   * Combina shop.stores + public.artisan_shops usando legacy_id
   */
  async findAll(): Promise<Store[]> {
    const stores = await this.storeRepository.find({
      relations: ['contacts', 'awards', 'badges'],
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    // Cargar datos legacy para cada tienda que tenga legacy_id
    for (const store of stores) {
      if (store.legacyId) {
        const legacyShop = await this.artisanShopRepository.findOne({
          where: { id: store.legacyId },
        });
        if (legacyShop) {
          store.legacyShop = legacyShop;
        }
      }
    }

    return stores;
  }

  /**
   * Obtener una tienda por ID con datos legacy
   */
  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['contacts', 'awards', 'badges'],
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    // Cargar datos legacy si existe legacy_id
    if (store.legacyId) {
      const legacyShop = await this.artisanShopRepository.findOne({
        where: { id: store.legacyId },
      });
      if (legacyShop) {
        store.legacyShop = legacyShop;
      }
    }

    return store;
  }

  /**
   * Obtener tienda por slug con datos legacy
   */
  async findBySlug(slug: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { slug, deletedAt: IsNull() },
      relations: ['contacts', 'awards', 'badges'],
    });

    if (!store) {
      throw new NotFoundException(`Store with slug ${slug} not found`);
    }

    // Cargar datos legacy si existe legacy_id
    if (store.legacyId) {
      const legacyShop = await this.artisanShopRepository.findOne({
        where: { id: store.legacyId },
      });
      if (legacyShop) {
        store.legacyShop = legacyShop;
      }
    }

    return store;
  }

  /**
   * Obtener tienda por user_id con datos legacy
   */
  async findByUserId(userId: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { userId, deletedAt: IsNull() },
      relations: ['contacts', 'awards', 'badges', 'artisanalProfile'],
    });

    if (!store) {
      throw new NotFoundException(`Store for user ${userId} not found`);
    }

    // Cargar datos legacy si existe legacy_id
    if (store.legacyId) {
      const legacyShop = await this.artisanShopRepository.findOne({
        where: { id: store.legacyId },
      });
      if (legacyShop) {
        store.legacyShop = legacyShop;
      }
    }

    return store;
  }

  /**
   * Actualizar tienda
   */
  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);

    Object.assign(store, updateStoreDto);

    return await this.storeRepository.save(store);
  }

  /**
   * Soft delete de tienda
   */
  async remove(id: string): Promise<void> {
    const store = await this.findOne(id);
    store.deletedAt = new Date();
    await this.storeRepository.save(store);
  }

  /**
   * Upsert del perfil artesanal de una tienda por userId.
   * Usado para guardar el oficio primario desde el wizard de productos.
   */
  async upsertArtisanalProfileByUserId(
    userId: string,
    primaryCraftId: string | null,
  ): Promise<void> {
    const store = await this.findByUserId(userId);
    await this.artisanalProfileRepo.upsert(
      { storeId: store.id, primaryCraftId },
      ['storeId'],
    );
  }

  /**
   * Obtener solo datos legacy de artisan_shops
   * Útil para migración o debugging
   */
  async findLegacyShop(legacyId: string): Promise<ArtisanShop> {
    const legacyShop = await this.artisanShopRepository.findOne({
      where: { id: legacyId },
    });

    if (!legacyShop) {
      throw new NotFoundException(`Legacy shop with ID ${legacyId} not found`);
    }

    return legacyShop;
  }
}
