import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtisanMediaCommunity } from './entities/artisan-media-community.entity';
import { CreateArtisanMediaCommunityDto } from './dto/create-artisan-media-community.dto';
import { UpdateArtisanMediaCommunityDto } from './dto/update-artisan-media-community.dto';

@Injectable()
export class ArtisanMediaCommunityService {
  constructor(
    @Inject('ARTISAN_MEDIA_COMMUNITY_REPOSITORY')
    private readonly artisanMediaCommunityRepository: Repository<ArtisanMediaCommunity>,
  ) {}

  /**
   * Crear un nuevo medio de comunidad del artesano
   */
  async create(
    createDto: CreateArtisanMediaCommunityDto,
  ): Promise<ArtisanMediaCommunity> {
    const newMedia = this.artisanMediaCommunityRepository.create(createDto);
    return await this.artisanMediaCommunityRepository.save(newMedia);
  }

  /**
   * Obtener todos los medios de comunidad
   */
  async findAll(): Promise<ArtisanMediaCommunity[]> {
    return await this.artisanMediaCommunityRepository.find({
      relations: ['artisan'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un medio de comunidad por ID
   */
  async findOne(id: string): Promise<ArtisanMediaCommunity> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const media = await this.artisanMediaCommunityRepository.findOne({
      where: { id },
      relations: ['artisan'],
    });

    if (!media) {
      throw new NotFoundException(
        `Medio de comunidad con ID ${id} no encontrado`,
      );
    }

    return media;
  }

  /**
   * Obtener todos los medios de comunidad de un artesano
   */
  async findByArtisan(artisanId: string): Promise<ArtisanMediaCommunity[]> {
    return await this.artisanMediaCommunityRepository.find({
      where: { artisanId },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar un medio de comunidad
   */
  async update(
    id: string,
    updateDto: UpdateArtisanMediaCommunityDto,
  ): Promise<ArtisanMediaCommunity> {
    // Verificar que el medio existe
    await this.findOne(id);

    // Actualizar
    await this.artisanMediaCommunityRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un medio de comunidad
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el medio existe
    await this.findOne(id);

    // Eliminar
    await this.artisanMediaCommunityRepository.delete(id);

    return {
      message: `Medio de comunidad con ID ${id} eliminado exitosamente`,
    };
  }
}
