import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtisanMaterial } from './entities/artisan-material.entity';
import { CreateArtisanMaterialDto } from './dto/create-artisan-material.dto';
import { UpdateArtisanMaterialDto } from './dto/update-artisan-material.dto';
import { resolveArtisanProfileId } from '../../utils/resolve-artisan-profile-id.util';

@Injectable()
export class ArtisanMaterialsService {
  constructor(
    @Inject('ARTISAN_MATERIALS_REPOSITORY')
    private readonly artisanMaterialsRepository: Repository<ArtisanMaterial>,
  ) {}

  /**
   * Crear una nueva relación artesano-material
   */
  async create(
    createDto: CreateArtisanMaterialDto,
  ): Promise<ArtisanMaterial> {
    const artisanId = await resolveArtisanProfileId(this.artisanMaterialsRepository, createDto.artisanId);

    // Verificar si ya existe la relación
    const existing = await this.artisanMaterialsRepository.findOne({
      where: {
        artisanId,
        materialId: createDto.materialId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'La relación entre este artesano y material ya existe',
      );
    }

    const newRelation = this.artisanMaterialsRepository.create({ ...createDto, artisanId });
    return await this.artisanMaterialsRepository.save(newRelation);
  }

  /**
   * Obtener todas las relaciones artesano-material
   */
  async findAll(): Promise<ArtisanMaterial[]> {
    return await this.artisanMaterialsRepository.find({
      relations: ['artisan', 'material'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una relación por ID
   */
  async findOne(id: string): Promise<ArtisanMaterial> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const relation = await this.artisanMaterialsRepository.findOne({
      where: { id },
      relations: ['artisan', 'material'],
    });

    if (!relation) {
      throw new NotFoundException(
        `Relación artesano-material con ID ${id} no encontrada`,
      );
    }

    return relation;
  }

  /**
   * Obtener todos los materiales de un artesano
   */
  async findByArtisan(artisanId: string): Promise<ArtisanMaterial[]> {
    const resolvedId = await resolveArtisanProfileId(this.artisanMaterialsRepository, artisanId);
    return await this.artisanMaterialsRepository.find({
      where: { artisanId: resolvedId },
      relations: ['material'],
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar una relación artesano-material
   */
  async update(
    id: string,
    updateDto: UpdateArtisanMaterialDto,
  ): Promise<ArtisanMaterial> {
    // Verificar que la relación existe
    await this.findOne(id);

    // Actualizar
    await this.artisanMaterialsRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar una relación artesano-material
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que la relación existe
    await this.findOne(id);

    // Eliminar
    await this.artisanMaterialsRepository.delete(id);

    return {
      message: `Relación artesano-material con ID ${id} eliminada exitosamente`,
    };
  }
}
