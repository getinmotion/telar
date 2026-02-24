import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, Between } from 'typeorm';
import { UserMaturityAction } from './entities/user-maturity-action.entity';
import { CreateUserMaturityActionDto } from './dto/create-user-maturity-action.dto';
import { UpdateUserMaturityActionDto } from './dto/update-user-maturity-action.dto';

@Injectable()
export class UserMaturityActionsService {
  constructor(
    @Inject('USER_MATURITY_ACTIONS_REPOSITORY')
    private readonly userMaturityActionsRepository: Repository<UserMaturityAction>,
  ) {}

  /**
   * Crear una nueva acción de madurez
   */
  async create(
    createDto: CreateUserMaturityActionDto,
  ): Promise<UserMaturityAction> {
    const newAction = this.userMaturityActionsRepository.create(createDto);
    return await this.userMaturityActionsRepository.save(newAction);
  }

  /**
   * Obtener todas las acciones
   */
  async getAll(): Promise<UserMaturityAction[]> {
    return await this.userMaturityActionsRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una acción por ID
   */
  async getById(id: string): Promise<UserMaturityAction> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const action = await this.userMaturityActionsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!action) {
      throw new NotFoundException(`Acción con ID ${id} no encontrada`);
    }

    return action;
  }

  /**
   * Obtener acciones por userId
   */
  async getByUserId(userId: string): Promise<UserMaturityAction[]> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    return await this.userMaturityActionsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener acciones por categoría
   */
  async getByCategory(category: string): Promise<UserMaturityAction[]> {
    return await this.userMaturityActionsRepository.find({
      where: { category },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener acciones por tipo de acción
   */
  async getByActionType(actionType: string): Promise<UserMaturityAction[]> {
    return await this.userMaturityActionsRepository.find({
      where: { actionType },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener acciones de un usuario por categoría
   */
  async getByUserIdAndCategory(
    userId: string,
    category: string,
  ): Promise<UserMaturityAction[]> {
    return await this.userMaturityActionsRepository.find({
      where: { userId, category },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener puntos totales de un usuario
   */
  async getTotalPointsByUserId(userId: string): Promise<number> {
    const result = await this.userMaturityActionsRepository
      .createQueryBuilder('action')
      .select('SUM(action.points)', 'total')
      .where('action.user_id = :userId', { userId })
      .getRawOne();

    return parseInt(result.total) || 0;
  }

  /**
   * Obtener puntos por categoría de un usuario
   */
  async getPointsByUserIdAndCategory(
    userId: string,
    category: string,
  ): Promise<number> {
    const result = await this.userMaturityActionsRepository
      .createQueryBuilder('action')
      .select('SUM(action.points)', 'total')
      .where('action.user_id = :userId', { userId })
      .andWhere('action.category = :category', { category })
      .getRawOne();

    return parseInt(result.total) || 0;
  }

  /**
   * Obtener acciones recientes de un usuario
   */
  async getRecentByUserId(
    userId: string,
    limit: number = 10,
  ): Promise<UserMaturityAction[]> {
    return await this.userMaturityActionsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtener acciones en un rango de fechas
   */
  async getByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<UserMaturityAction[]> {
    return await this.userMaturityActionsRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar una acción
   */
  async update(
    id: string,
    updateDto: UpdateUserMaturityActionDto,
  ): Promise<UserMaturityAction> {
    // Verificar que existe
    await this.getById(id);

    // Actualizar
    await this.userMaturityActionsRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar una acción
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Eliminar
    await this.userMaturityActionsRepository.delete(id);

    return {
      message: `Acción con ID ${id} eliminada exitosamente`,
    };
  }
}
