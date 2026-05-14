import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtisanTerritorial } from './entities/artisan-territorial.entity';
import { CreateArtisanTerritorialDto } from './dto/create-artisan-territorial.dto';
import { UpdateArtisanTerritorialDto } from './dto/update-artisan-territorial.dto';

@Injectable()
export class ArtisanTerritorialService {
  constructor(
    @Inject('ARTISAN_TERRITORIAL_REPOSITORY')
    private readonly artisanTerritorialRepository: Repository<ArtisanTerritorial>,
  ) {}

  /**
   * Crear un nuevo registro territorial
   */
  async create(
    createDto: CreateArtisanTerritorialDto,
  ): Promise<ArtisanTerritorial> {
    const newTerritorial = this.artisanTerritorialRepository.create(createDto);
    return await this.artisanTerritorialRepository.save(newTerritorial);
  }

  /**
   * Obtener todos los registros territoriales
   */
  async findAll(): Promise<ArtisanTerritorial[]> {
    return await this.artisanTerritorialRepository.find({
      relations: ['territory'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un registro territorial por ID
   */
  async findOne(id: string): Promise<ArtisanTerritorial> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const territorial = await this.artisanTerritorialRepository.findOne({
      where: { id },
      relations: ['territory'],
    });

    if (!territorial) {
      throw new NotFoundException(
        `Registro territorial con ID ${id} no encontrado`,
      );
    }

    return territorial;
  }

  /**
   * Obtener todos los registros territoriales por territorio
   */
  async findByTerritory(territorialId: string): Promise<ArtisanTerritorial[]> {
    return await this.artisanTerritorialRepository.find({
      where: { territorialId },
      relations: ['territory'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar un registro territorial
   */
  async update(
    id: string,
    updateDto: UpdateArtisanTerritorialDto,
  ): Promise<ArtisanTerritorial> {
    // Verificar que el registro existe
    await this.findOne(id);

    // Actualizar
    await this.artisanTerritorialRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un registro territorial
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el registro existe
    await this.findOne(id);

    // Eliminar
    await this.artisanTerritorialRepository.delete(id);

    return {
      message: `Registro territorial con ID ${id} eliminado exitosamente`,
    };
  }
}
