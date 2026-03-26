import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CareTag } from './entities/care-tag.entity';
import { CreateCareTagDto } from './dto/create-care-tag.dto';
import { UpdateCareTagDto } from './dto/update-care-tag.dto';

@Injectable()
export class CareTagsService {
  constructor(
    @Inject('CARE_TAGS_REPOSITORY')
    private readonly careTagsRepository: Repository<CareTag>,
  ) {}

  /**
   * Crear un nuevo care tag
   */
  async create(createDto: CreateCareTagDto): Promise<CareTag> {
    // Verificar si ya existe un care tag con ese nombre
    const existingTag = await this.careTagsRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingTag) {
      throw new ConflictException('Ya existe un care tag con ese nombre');
    }

    const newTag = this.careTagsRepository.create(createDto);
    return await this.careTagsRepository.save(newTag);
  }

  /**
   * Obtener todos los care tags
   */
  async findAll(): Promise<CareTag[]> {
    return await this.careTagsRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener un care tag por ID
   */
  async findOne(id: string): Promise<CareTag> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const tag = await this.careTagsRepository.findOne({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Care tag con ID ${id} no encontrado`);
    }

    return tag;
  }

  /**
   * Obtener care tags activos
   */
  async findActive(): Promise<CareTag[]> {
    return await this.careTagsRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Actualizar un care tag
   */
  async update(id: string, updateDto: UpdateCareTagDto): Promise<CareTag> {
    // Verificar que el care tag existe
    await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (updateDto.name) {
      const existingTag = await this.careTagsRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingTag && existingTag.id !== id) {
        throw new ConflictException('Ya existe un care tag con ese nombre');
      }
    }

    // Actualizar
    await this.careTagsRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un care tag
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el care tag existe
    await this.findOne(id);

    // Eliminar (hard delete)
    await this.careTagsRepository.delete(id);

    return {
      message: `Care tag con ID ${id} eliminado exitosamente`,
    };
  }
}
