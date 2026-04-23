import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtisanMediaFamily } from './entities/artisan-media-family.entity';
import { CreateArtisanMediaFamilyDto } from './dto/create-artisan-media-family.dto';
import { UpdateArtisanMediaFamilyDto } from './dto/update-artisan-media-family.dto';

@Injectable()
export class ArtisanMediaFamilyService {
  constructor(
    @Inject('ARTISAN_MEDIA_FAMILY_REPOSITORY')
    private readonly artisanMediaFamilyRepository: Repository<ArtisanMediaFamily>,
  ) {}

  /**
   * Crear un nuevo medio familiar del artesano
   */
  async create(
    createDto: CreateArtisanMediaFamilyDto,
  ): Promise<ArtisanMediaFamily> {
    const newMedia = this.artisanMediaFamilyRepository.create(createDto);
    return await this.artisanMediaFamilyRepository.save(newMedia);
  }

  /**
   * Obtener todos los medios familiares
   */
  async findAll(): Promise<ArtisanMediaFamily[]> {
    return await this.artisanMediaFamilyRepository.find({
      relations: ['artisan'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un medio familiar por ID
   */
  async findOne(id: string): Promise<ArtisanMediaFamily> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const media = await this.artisanMediaFamilyRepository.findOne({
      where: { id },
      relations: ['artisan'],
    });

    if (!media) {
      throw new NotFoundException(
        `Medio familiar con ID ${id} no encontrado`,
      );
    }

    return media;
  }

  /**
   * Obtener todos los medios familiares de un artesano
   */
  async findByArtisan(artisanId: string): Promise<ArtisanMediaFamily[]> {
    return await this.artisanMediaFamilyRepository.find({
      where: { artisanId },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar un medio familiar
   */
  async update(
    id: string,
    updateDto: UpdateArtisanMediaFamilyDto,
  ): Promise<ArtisanMediaFamily> {
    // Verificar que el medio existe
    await this.findOne(id);

    // Actualizar
    await this.artisanMediaFamilyRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un medio familiar
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el medio existe
    await this.findOne(id);

    // Eliminar
    await this.artisanMediaFamilyRepository.delete(id);

    return {
      message: `Medio familiar con ID ${id} eliminado exitosamente`,
    };
  }
}
