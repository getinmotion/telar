import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @Inject('MATERIALS_REPOSITORY')
    private readonly materialsRepository: Repository<Material>,
  ) {}

  /**
   * Crear un nuevo material
   */
  async create(createDto: CreateMaterialDto): Promise<Material> {
    // Verificar si ya existe un material con ese nombre
    const existingMaterial = await this.materialsRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingMaterial) {
      throw new ConflictException('Ya existe un material con ese nombre');
    }

    const newMaterial = this.materialsRepository.create(createDto);
    return await this.materialsRepository.save(newMaterial);
  }

  /**
   * Obtener todos los materiales
   */
  async findAll(): Promise<Material[]> {
    return await this.materialsRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener un material por ID
   */
  async findOne(id: string): Promise<Material> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const material = await this.materialsRepository.findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException(`Material con ID ${id} no encontrado`);
    }

    return material;
  }

  /**
   * Obtener materiales orgánicos
   */
  async findOrganic(): Promise<Material[]> {
    return await this.materialsRepository.find({
      where: { isOrganic: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener materiales sostenibles
   */
  async findSustainable(): Promise<Material[]> {
    return await this.materialsRepository.find({
      where: { isSustainable: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Buscar materiales por status
   */
  async findByStatus(status: string): Promise<Material[]> {
    return await this.materialsRepository.find({
      where: { status: status as any },
      order: { name: 'ASC' },
    });
  }

  /**
   * Actualizar un material
   */
  async update(id: string, updateDto: UpdateMaterialDto): Promise<Material> {
    // Verificar que el material existe
    await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (updateDto.name) {
      const existingMaterial = await this.materialsRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingMaterial && existingMaterial.id !== id) {
        throw new ConflictException('Ya existe un material con ese nombre');
      }
    }

    // Actualizar
    await this.materialsRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un material
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el material existe
    await this.findOne(id);

    // Eliminar (hard delete)
    await this.materialsRepository.delete(id);

    return {
      message: `Material con ID ${id} eliminado exitosamente`,
    };
  }
}
