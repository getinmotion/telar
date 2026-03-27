import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Craft } from './entities/craft.entity';
import { CreateCraftDto } from './dto/create-craft.dto';
import { UpdateCraftDto } from './dto/update-craft.dto';

@Injectable()
export class CraftsService {
  constructor(
    @Inject('CRAFTS_REPOSITORY')
    private readonly craftsRepository: Repository<Craft>,
  ) {}

  /**
   * Crear un nuevo oficio
   */
  async create(createDto: CreateCraftDto): Promise<Craft> {
    // Verificar si ya existe un oficio con ese nombre
    const existingCraft = await this.craftsRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingCraft) {
      throw new ConflictException('Ya existe un oficio con ese nombre');
    }

    const newCraft = this.craftsRepository.create(createDto);
    return await this.craftsRepository.save(newCraft);
  }

  /**
   * Obtener todos los oficios
   */
  async findAll(): Promise<Craft[]> {
    return await this.craftsRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener un oficio por ID
   */
  async findOne(id: string): Promise<Craft> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const craft = await this.craftsRepository.findOne({
      where: { id },
    });

    if (!craft) {
      throw new NotFoundException(`Oficio con ID ${id} no encontrado`);
    }

    return craft;
  }

  /**
   * Obtener oficios activos
   */
  async findActive(): Promise<Craft[]> {
    return await this.craftsRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Buscar oficios por status
   */
  async findByStatus(status: string): Promise<Craft[]> {
    return await this.craftsRepository.find({
      where: { status: status as any },
      order: { name: 'ASC' },
    });
  }

  /**
   * Actualizar un oficio
   */
  async update(id: string, updateDto: UpdateCraftDto): Promise<Craft> {
    // Verificar que el oficio existe
    await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (updateDto.name) {
      const existingCraft = await this.craftsRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingCraft && existingCraft.id !== id) {
        throw new ConflictException('Ya existe un oficio con ese nombre');
      }
    }

    // Actualizar
    await this.craftsRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un oficio
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el oficio existe
    await this.findOne(id);

    // Eliminar (hard delete)
    await this.craftsRepository.delete(id);

    return {
      message: `Oficio con ID ${id} eliminado exitosamente`,
    };
  }
}
