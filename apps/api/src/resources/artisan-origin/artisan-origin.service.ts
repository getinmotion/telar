import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtisanOrigin } from './entities/artisan-origin.entity';
import { CreateArtisanOriginDto } from './dto/create-artisan-origin.dto';
import { UpdateArtisanOriginDto } from './dto/update-artisan-origin.dto';

@Injectable()
export class ArtisanOriginService {
  constructor(
    @Inject('ARTISAN_ORIGIN_REPOSITORY')
    private readonly artisanOriginRepository: Repository<ArtisanOrigin>,
  ) {}

  /**
   * Crear un nuevo registro de origen artesanal
   */
  async create(
    createDto: CreateArtisanOriginDto,
  ): Promise<ArtisanOrigin> {
    const newOrigin = this.artisanOriginRepository.create(createDto);
    return await this.artisanOriginRepository.save(newOrigin);
  }

  /**
   * Obtener todos los registros de origen artesanal
   */
  async findAll(): Promise<ArtisanOrigin[]> {
    return await this.artisanOriginRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un registro de origen artesanal por ID
   */
  async findOne(id: string): Promise<ArtisanOrigin> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const origin = await this.artisanOriginRepository.findOne({
      where: { id },
    });

    if (!origin) {
      throw new NotFoundException(
        `Registro de origen con ID ${id} no encontrado`,
      );
    }

    return origin;
  }

  /**
   * Actualizar un registro de origen artesanal
   */
  async update(
    id: string,
    updateDto: UpdateArtisanOriginDto,
  ): Promise<ArtisanOrigin> {
    // Verificar que el registro existe
    await this.findOne(id);

    // Actualizar
    await this.artisanOriginRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un registro de origen artesanal
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el registro existe
    await this.findOne(id);

    // Eliminar
    await this.artisanOriginRepository.delete(id);

    return {
      message: `Registro de origen con ID ${id} eliminado exitosamente`,
    };
  }
}
