import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { MasterCoordinatorContext } from './entities/master-coordinator-context.entity';
import { CreateMasterCoordinatorContextDto } from './dto/create-master-coordinator-context.dto';
import { UpdateMasterCoordinatorContextDto } from './dto/update-master-coordinator-context.dto';

@Injectable()
export class MasterCoordinatorContextService {
  constructor(
    @Inject('MASTER_COORDINATOR_CONTEXT_REPOSITORY')
    private readonly contextRepository: Repository<MasterCoordinatorContext>,
  ) {}

  /**
   * Crear un nuevo contexto de coordinador
   */
  async create(
    createDto: CreateMasterCoordinatorContextDto,
  ): Promise<MasterCoordinatorContext> {
    // Validar que no exista ya un contexto para este usuario (1:1)
    const existingContext = await this.contextRepository.findOne({
      where: { userId: createDto.userId },
    });

    if (existingContext) {
      throw new ConflictException(
        `Ya existe un contexto para el usuario ${createDto.userId}`,
      );
    }

    const newContext = this.contextRepository.create(createDto);
    return await this.contextRepository.save(newContext);
  }

  /**
   * Obtener todos los contextos
   */
  async getAll(): Promise<MasterCoordinatorContext[]> {
    return await this.contextRepository.find({
      relations: ['user'],
      order: { lastInteraction: 'DESC' },
    });
  }

  /**
   * Obtener un contexto por ID
   */
  async getById(id: string): Promise<MasterCoordinatorContext> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const context = await this.contextRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!context) {
      throw new NotFoundException(`Contexto con ID ${id} no encontrado`);
    }

    return context;
  }

  /**
   * Obtener contexto por userId (relación 1:1)
   */
  async getByUserId(userId: string): Promise<MasterCoordinatorContext | null> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    const context = await this.contextRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    return context;
  }

  /**
   * Obtener o crear contexto para un usuario
   */
  async getOrCreate(
    userId: string,
  ): Promise<MasterCoordinatorContext> {
    let context = await this.getByUserId(userId);

    if (!context) {
      context = await this.create({
        userId,
        contextSnapshot: {},
        aiMemory: [],
        contextVersion: 1,
      });
    }

    return context;
  }

  /**
   * Actualizar un contexto
   * Incrementa automáticamente contextVersion
   */
  async update(
    id: string,
    updateDto: UpdateMasterCoordinatorContextDto,
  ): Promise<MasterCoordinatorContext> {
    const context = await this.getById(id);

    // Incrementar versión del contexto
    const updatedData = {
      ...updateDto,
      contextVersion: context.contextVersion + 1,
    };

    await this.contextRepository.update(id, updatedData);

    return await this.getById(id);
  }

  /**
   * Actualizar por userId
   */
  async updateByUserId(
    userId: string,
    updateDto: UpdateMasterCoordinatorContextDto,
  ): Promise<MasterCoordinatorContext> {
    const context = await this.getByUserId(userId);

    if (!context) {
      throw new NotFoundException(
        `Contexto para el usuario ${userId} no encontrado`,
      );
    }

    return await this.update(context.id, updateDto);
  }

  /**
   * Actualizar solo el snapshot del contexto
   */
  async updateContextSnapshot(
    userId: string,
    snapshot: Record<string, any>,
  ): Promise<MasterCoordinatorContext> {
    const context = await this.getOrCreate(userId);

    // Merge del snapshot existente con el nuevo
    const mergedSnapshot = {
      ...context.contextSnapshot,
      ...snapshot,
    };

    return await this.update(context.id, {
      contextSnapshot: mergedSnapshot,
    });
  }

  /**
   * Agregar una entrada a la memoria de IA
   */
  async addToAiMemory(
    userId: string,
    memoryEntry: any,
  ): Promise<MasterCoordinatorContext> {
    const context = await this.getOrCreate(userId);

    // Agregar timestamp si no existe
    if (!memoryEntry.timestamp) {
      memoryEntry.timestamp = new Date().toISOString();
    }

    // Agregar nueva entrada al array de memoria
    const updatedMemory = [...context.aiMemory, memoryEntry];

    return await this.update(context.id, {
      aiMemory: updatedMemory,
      lastInteraction: new Date().toISOString() as any,
    });
  }

  /**
   * Limpiar memoria de IA (mantener solo las últimas N entradas)
   */
  async trimAiMemory(
    userId: string,
    keepLast: number = 100,
  ): Promise<MasterCoordinatorContext> {
    const context = await this.getByUserId(userId);

    if (!context) {
      throw new NotFoundException(
        `Contexto para el usuario ${userId} no encontrado`,
      );
    }

    if (context.aiMemory.length <= keepLast) {
      return context; // No hay nada que recortar
    }

    // Mantener solo las últimas N entradas
    const trimmedMemory = context.aiMemory.slice(-keepLast);

    return await this.update(context.id, {
      aiMemory: trimmedMemory,
    });
  }

  /**
   * Actualizar última interacción
   */
  async updateLastInteraction(
    userId: string,
  ): Promise<MasterCoordinatorContext> {
    const context = await this.getOrCreate(userId);

    return await this.update(context.id, {
      lastInteraction: new Date().toISOString() as any,
    });
  }

  /**
   * Obtener contextos inactivos (última interacción hace más de X días)
   */
  async getInactiveContexts(daysInactive: number = 30): Promise<
    MasterCoordinatorContext[]
  > {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    return await this.contextRepository
      .createQueryBuilder('context')
      .leftJoinAndSelect('context.user', 'user')
      .where('context.last_interaction < :cutoffDate', { cutoffDate })
      .orderBy('context.last_interaction', 'ASC')
      .getMany();
  }

  /**
   * Obtener estadísticas de contextos
   */
  async getStats(): Promise<{
    totalContexts: number;
    averageMemorySize: number;
    averageContextVersion: number;
    activeLastWeek: number;
    activeLastMonth: number;
  }> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const totalContexts = await this.contextRepository.count();

    const activeLastWeek = await this.contextRepository
      .createQueryBuilder('context')
      .where('context.last_interaction >= :oneWeekAgo', { oneWeekAgo })
      .getCount();

    const activeLastMonth = await this.contextRepository
      .createQueryBuilder('context')
      .where('context.last_interaction >= :oneMonthAgo', { oneMonthAgo })
      .getCount();

    const contexts = await this.contextRepository.find();

    const averageMemorySize =
      contexts.length > 0
        ? Math.round(
            contexts.reduce((sum, c) => sum + c.aiMemory.length, 0) /
              contexts.length,
          )
        : 0;

    const averageContextVersion =
      contexts.length > 0
        ? Math.round(
            contexts.reduce((sum, c) => sum + c.contextVersion, 0) /
              contexts.length,
          )
        : 0;

    return {
      totalContexts,
      averageMemorySize,
      averageContextVersion,
      activeLastWeek,
      activeLastMonth,
    };
  }

  /**
   * Eliminar un contexto
   */
  async delete(id: string): Promise<{ message: string }> {
    await this.getById(id);

    await this.contextRepository.delete(id);

    return {
      message: `Contexto con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Eliminar contexto por userId
   */
  async deleteByUserId(userId: string): Promise<{ message: string }> {
    const context = await this.getByUserId(userId);

    if (!context) {
      throw new NotFoundException(
        `Contexto para el usuario ${userId} no encontrado`,
      );
    }

    await this.contextRepository.delete(context.id);

    return {
      message: `Contexto del usuario ${userId} eliminado exitosamente`,
    };
  }
}
