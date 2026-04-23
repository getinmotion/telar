import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtisanMediaWorkshop } from './entities/artisan-media-workshop.entity';
import { CreateArtisanMediaWorkshopDto } from './dto/create-artisan-media-workshop.dto';
import { UpdateArtisanMediaWorkshopDto } from './dto/update-artisan-media-workshop.dto';

@Injectable()
export class ArtisanMediaWorkshopService {
  constructor(
    @Inject('ARTISAN_MEDIA_WORKSHOP_REPOSITORY')
    private readonly artisanMediaWorkshopRepository: Repository<ArtisanMediaWorkshop>,
  ) {}

  /**
   * Crear un nuevo medio de taller del artesano
   */
  async create(
    createDto: CreateArtisanMediaWorkshopDto,
  ): Promise<ArtisanMediaWorkshop> {
    const newMedia = this.artisanMediaWorkshopRepository.create(createDto);
    return await this.artisanMediaWorkshopRepository.save(newMedia);
  }

  /**
   * Obtener todos los medios de taller
   */
  async findAll(): Promise<ArtisanMediaWorkshop[]> {
    return await this.artisanMediaWorkshopRepository.find({
      relations: ['artisan'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un medio de taller por ID
   */
  async findOne(id: string): Promise<ArtisanMediaWorkshop> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const media = await this.artisanMediaWorkshopRepository.findOne({
      where: { id },
      relations: ['artisan'],
    });

    if (!media) {
      throw new NotFoundException(
        `Medio de taller con ID ${id} no encontrado`,
      );
    }

    return media;
  }

  /**
   * Obtener todos los medios de taller de un artesano
   */
  async findByArtisan(artisanId: string): Promise<ArtisanMediaWorkshop[]> {
    return await this.artisanMediaWorkshopRepository.find({
      where: { artisanId },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar un medio de taller
   */
  async update(
    id: string,
    updateDto: UpdateArtisanMediaWorkshopDto,
  ): Promise<ArtisanMediaWorkshop> {
    // Verificar que el medio existe
    await this.findOne(id);

    // Actualizar
    await this.artisanMediaWorkshopRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un medio de taller
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el medio existe
    await this.findOne(id);

    // Eliminar
    await this.artisanMediaWorkshopRepository.delete(id);

    return {
      message: `Medio de taller con ID ${id} eliminado exitosamente`,
    };
  }
}
