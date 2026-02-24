import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, IsNull } from 'typeorm';
import { AgentTask, TaskStatus } from './entities/agent-task.entity';
import { CreateAgentTaskDto } from './dto/create-agent-task.dto';
import { UpdateAgentTaskDto } from './dto/update-agent-task.dto';

@Injectable()
export class AgentTasksService {
  constructor(
    @Inject('AGENT_TASKS_REPOSITORY')
    private readonly agentTasksRepository: Repository<AgentTask>,
  ) {}

  /**
   * Crear una nueva tarea de agente
   */
  async create(createDto: CreateAgentTaskDto): Promise<AgentTask> {
    // Validar que no exista ya una tarea con el mismo user_id y agent_id
    const existingTask = await this.agentTasksRepository.findOne({
      where: {
        userId: createDto.userId,
        agentId: createDto.agentId,
      },
    });

    if (existingTask) {
      throw new ConflictException(
        `Ya existe una tarea para el usuario ${createDto.userId} y el agente ${createDto.agentId}`,
      );
    }

    const newTask = this.agentTasksRepository.create(createDto);
    return await this.agentTasksRepository.save(newTask);
  }

  /**
   * Obtener todas las tareas
   */
  async getAll(): Promise<AgentTask[]> {
    return await this.agentTasksRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una tarea por ID
   */
  async getById(id: string): Promise<AgentTask> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const task = await this.agentTasksRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!task) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    return task;
  }

  /**
   * Obtener todas las tareas de un usuario
   */
  async getByUserId(userId: string): Promise<AgentTask[]> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    return await this.agentTasksRepository.find({
      where: { userId },
      relations: ['user'],
      order: { priority: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * Obtener tareas de un usuario por estado
   */
  async getByUserIdAndStatus(
    userId: string,
    status: TaskStatus,
  ): Promise<AgentTask[]> {
    if (!userId) {
      throw new BadRequestException('El userId es requerido');
    }

    return await this.agentTasksRepository.find({
      where: { userId, status },
      relations: ['user'],
      order: { priority: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * Obtener tareas por agente
   */
  async getByAgentId(agentId: string): Promise<AgentTask[]> {
    if (!agentId) {
      throw new BadRequestException('El agentId es requerido');
    }

    return await this.agentTasksRepository.find({
      where: { agentId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener tareas activas (no archivadas, no completadas, no canceladas)
   */
  async getActiveTasks(userId: string): Promise<AgentTask[]> {
    return await this.agentTasksRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere('task.isArchived = :isArchived', { isArchived: false })
      .andWhere('task.status IN (:...statuses)', {
        statuses: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
      })
      .orderBy('task.priority', 'ASC')
      .addOrderBy('task.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Obtener tareas archivadas
   */
  async getArchivedTasks(userId: string): Promise<AgentTask[]> {
    return await this.agentTasksRepository.find({
      where: { userId, isArchived: true },
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Obtener tareas por categoría de milestone
   */
  async getByMilestoneCategory(
    userId: string,
    milestoneCategory: string,
  ): Promise<AgentTask[]> {
    return await this.agentTasksRepository.find({
      where: { userId, milestoneCategory: milestoneCategory as any },
      relations: ['user'],
      order: { priority: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar una tarea
   */
  async update(id: string, updateDto: UpdateAgentTaskDto): Promise<AgentTask> {
    // Verificar que existe
    await this.getById(id);

    // Si se está marcando como completada, agregar la fecha
    if (updateDto.status === TaskStatus.COMPLETED && !updateDto.progressPercentage) {
      updateDto.progressPercentage = 100;
    }

    // Actualizar
    await this.agentTasksRepository.update(id, updateDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Marcar tarea como completada
   */
  async markAsCompleted(id: string): Promise<AgentTask> {
    await this.getById(id);

    await this.agentTasksRepository.update(id, {
      status: TaskStatus.COMPLETED,
      completedAt: new Date(),
      progressPercentage: 100,
    });

    return await this.getById(id);
  }

  /**
   * Archivar una tarea
   */
  async archive(id: string): Promise<AgentTask> {
    await this.getById(id);

    await this.agentTasksRepository.update(id, {
      isArchived: true,
    });

    return await this.getById(id);
  }

  /**
   * Desarchivar una tarea
   */
  async unarchive(id: string): Promise<AgentTask> {
    await this.getById(id);

    await this.agentTasksRepository.update(id, {
      isArchived: false,
    });

    return await this.getById(id);
  }

  /**
   * Actualizar progreso de una tarea
   */
  async updateProgress(
    id: string,
    progressPercentage: number,
  ): Promise<AgentTask> {
    if (progressPercentage < 0 || progressPercentage > 100) {
      throw new BadRequestException(
        'El progreso debe estar entre 0 y 100',
      );
    }

    await this.getById(id);

    // Si llega a 100%, marcar como completada
    const updateData: any = { progressPercentage };
    if (progressPercentage === 100) {
      updateData.status = TaskStatus.COMPLETED;
      updateData.completedAt = new Date();
    }

    await this.agentTasksRepository.update(id, updateData);

    return await this.getById(id);
  }

  /**
   * Eliminar una tarea (hard delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    await this.getById(id);

    await this.agentTasksRepository.delete(id);

    return {
      message: `Tarea con ID ${id} eliminada exitosamente`,
    };
  }

  /**
   * Obtener estadísticas de tareas de un usuario
   */
  async getUserTaskStats(userId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    archived: number;
  }> {
    const tasks = await this.agentTasksRepository.find({
      where: { userId },
    });

    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS)
        .length,
      completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
      cancelled: tasks.filter((t) => t.status === TaskStatus.CANCELLED).length,
      archived: tasks.filter((t) => t.isArchived).length,
    };
  }
}
