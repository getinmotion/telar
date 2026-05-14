import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtisanMediaWorking } from './entities/artisan-media-working.entity';
import { CreateArtisanMediaWorkingDto } from './dto/create-artisan-media-working.dto';
import { UpdateArtisanMediaWorkingDto } from './dto/update-artisan-media-working.dto';

@Injectable()
export class ArtisanMediaWorkingService {
  constructor(
    @Inject('ARTISAN_MEDIA_WORKING_REPOSITORY')
    private readonly artisanMediaWorkingRepository: Repository<ArtisanMediaWorking>,
  ) {}

  /**
   * Crear un nuevo medio de trabajo del artesano
   */
  async create(
    createDto: CreateArtisanMediaWorkingDto,
  ): Promise<ArtisanMediaWorking> {
    const newMedia = this.artisanMediaWorkingRepository.create(createDto);
    return await this.artisanMediaWorkingRepository.save(newMedia);
  }

  /**
   * Obtener todos los medios de trabajo
   */
  async findAll(): Promise<ArtisanMediaWorking[]> {
    return await this.artisanMediaWorkingRepository.find({
      relations: ['artisan'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un medio de trabajo por ID
   */
  async findOne(id: string): Promise<ArtisanMediaWorking> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const media = await this.artisanMediaWorkingRepository.findOne({
      where: { id },
      relations: ['artisan'],
    });

    if (!media) {
      throw new NotFoundException(
        `Medio de trabajo con ID ${id} no encontrado`,
      );
    }

    return media;
  }

  /**
   * Obtener todos los medios de trabajo de un artesano
   */
  async findByArtisan(artisanId: string): Promise<ArtisanMediaWorking[]> {
    return await this.artisanMediaWorkingRepository.find({
      where: { artisanId },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar un medio de trabajo
   */
  async update(
    id: string,
    updateDto: UpdateArtisanMediaWorkingDto,
  ): Promise<ArtisanMediaWorking> {
    // Verificar que el medio existe
    await this.findOne(id);

    // Actualizar
    await this.artisanMediaWorkingRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un medio de trabajo
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el medio existe
    await this.findOne(id);

    // Eliminar
    await this.artisanMediaWorkingRepository.delete(id);

    return {
      message: `Medio de trabajo con ID ${id} eliminado exitosamente`,
    };
  }
}
