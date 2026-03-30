import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Badge } from './entities/badge.entity';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';

@Injectable()
export class BadgesService {
  constructor(
    @Inject('BADGES_REPOSITORY')
    private readonly badgesRepository: Repository<Badge>,
  ) {}

  /**
   * Crear un nuevo badge
   */
  async create(createDto: CreateBadgeDto): Promise<Badge> {
    // Verificar si ya existe un badge con ese código
    const existingBadge = await this.badgesRepository.findOne({
      where: { code: createDto.code },
    });

    if (existingBadge) {
      throw new ConflictException('Ya existe un badge con ese código');
    }

    const newBadge = this.badgesRepository.create(createDto);
    return await this.badgesRepository.save(newBadge);
  }

  /**
   * Obtener todos los badges
   */
  async findAll(): Promise<Badge[]> {
    return await this.badgesRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener un badge por ID
   */
  async findOne(id: string): Promise<Badge> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const badge = await this.badgesRepository.findOne({
      where: { id },
    });

    if (!badge) {
      throw new NotFoundException(`Badge con ID ${id} no encontrado`);
    }

    return badge;
  }

  /**
   * Obtener badges activos
   */
  async findActive(): Promise<Badge[]> {
    return await this.badgesRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Buscar badges por targetType
   */
  async findByTarget(targetType: string): Promise<Badge[]> {
    return await this.badgesRepository.find({
      where: { targetType: targetType as any },
      order: { name: 'ASC' },
    });
  }

  /**
   * Buscar badges por assignmentType
   */
  async findByAssignment(assignmentType: string): Promise<Badge[]> {
    return await this.badgesRepository.find({
      where: { assignmentType: assignmentType as any },
      order: { name: 'ASC' },
    });
  }

  /**
   * Actualizar un badge
   */
  async update(id: string, updateDto: UpdateBadgeDto): Promise<Badge> {
    // Verificar que el badge existe
    await this.findOne(id);

    // Si se está actualizando el código, verificar que no exista otro con ese código
    if (updateDto.code) {
      const existingBadge = await this.badgesRepository.findOne({
        where: { code: updateDto.code },
      });

      if (existingBadge && existingBadge.id !== id) {
        throw new ConflictException('Ya existe un badge con ese código');
      }
    }

    // Actualizar
    await this.badgesRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.findOne(id);
  }

  /**
   * Eliminar un badge
   */
  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el badge existe
    await this.findOne(id);

    // Eliminar (hard delete)
    await this.badgesRepository.delete(id);

    return {
      message: `Badge con ID ${id} eliminado exitosamente`,
    };
  }
}
