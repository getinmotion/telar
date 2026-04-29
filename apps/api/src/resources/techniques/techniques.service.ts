import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Technique } from './entities/technique.entity';
import { CreateTechniqueDto } from './dto/create-technique.dto';
import { UpdateTechniqueDto } from './dto/update-technique.dto';

@Injectable()
export class TechniquesService {
  constructor(
    @Inject('TECHNIQUES_REPOSITORY')
    private readonly techniquesRepository: Repository<Technique>,
  ) {}

  /**
   * Crear una nueva técnica
   */
  async create(createDto: CreateTechniqueDto): Promise<Technique> {
    // Verificar si ya existe una técnica con ese nombre para el mismo craft
    const existingTechnique = await this.techniquesRepository.findOne({
      where: { name: createDto.name, craftId: createDto.craftId },
    });

    if (existingTechnique) {
      throw new ConflictException(
        'Ya existe una técnica con ese nombre para este craft',
      );
    }

    const newTechnique = this.techniquesRepository.create(createDto);
    return await this.techniquesRepository.save(newTechnique);
  }

  /**
   * Obtener todas las técnicas
   */
  async findAll(): Promise<Technique[]> {
    return await this.techniquesRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener una técnica por ID
   */
  async findOne(id: string): Promise<Technique> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const technique = await this.techniquesRepository.findOne({
      where: { id },
    });

    if (!technique) {
      throw new NotFoundException(`Técnica con ID ${id} no encontrada`);
    }

    return technique;
  }

  /**
   * Obtener técnicas por craftId
   */
  async findByCraftId(craftId: string): Promise<Technique[]> {
    return await this.techniquesRepository.find({
      where: { craftId },
      order: { name: 'ASC' },
    });
  }

  /**
   * Buscar técnicas por status
   */
  async findByStatus(status: string): Promise<Technique[]> {
    return await this.techniquesRepository.find({
      where: { status: status as any },
      order: { name: 'ASC' },
    });
  }

  /**
   * Actualizar una técnica
   */
  async update(id: string, updateDto: UpdateTechniqueDto): Promise<Technique> {
    // Verificar que la técnica existe
    await this.findOne(id);

    // Si se está actualizando el nombre o craftId, verificar que no exista otra con ese nombre
    if (updateDto.name || updateDto.craftId) {
      const technique = await this.findOne(id);
      const nameToCheck = updateDto.name || technique.name;
      const craftIdToCheck = updateDto.craftId || technique.craftId;

      const existingTechnique = await this.techniquesRepository.findOne({
        where: { name: nameToCheck, craftId: craftIdToCheck },
      });

      if (existingTechnique && existingTechnique.id !== id) {
        throw new ConflictException(
          'Ya existe una técnica con ese nombre para este craft',
        );
      }
    }

    // Actualizar
    await this.techniquesRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar una técnica
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que la técnica existe
    await this.findOne(id);

    // Eliminar (hard delete)
    await this.techniquesRepository.delete(id);

    return {
      message: `Técnica con ID ${id} eliminada exitosamente`,
    };
  }
}
