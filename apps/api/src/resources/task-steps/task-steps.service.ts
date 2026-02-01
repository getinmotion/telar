import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { TaskStep } from './entities/task-step.entity';
import { CreateTaskStepDto } from './dto/create-task-step.dto';
import { UpdateTaskStepDto } from './dto/update-task-step.dto';

@Injectable()
export class TaskStepsService {
  private readonly logger = new Logger(TaskStepsService.name);

  constructor(
    @Inject('TASK_STEPS_REPOSITORY')
    private readonly taskStepsRepository: Repository<TaskStep>,
  ) {}

  /**
   * Crear un nuevo paso de tarea
   */
  async create(createTaskStepDto: CreateTaskStepDto): Promise<TaskStep> {
    const newTaskStep = this.taskStepsRepository.create(createTaskStepDto);
    return await this.taskStepsRepository.save(newTaskStep);
  }

  /**
   * Obtener todos los pasos
   */
  async getAll(): Promise<TaskStep[]> {
    return await this.taskStepsRepository.find({
      order: { taskId: 'ASC', stepNumber: 'ASC' },
      relations: ['task'],
    });
  }

  /**
   * Obtener un paso por ID
   */
  async getById(id: string): Promise<TaskStep> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const taskStep = await this.taskStepsRepository.findOne({
      where: { id },
      relations: ['task'],
    });

    if (!taskStep) {
      throw new NotFoundException(`Paso de tarea con ID ${id} no encontrado`);
    }

    return taskStep;
  }

  /**
   * Obtener pasos por tarea
   */
  async getByTaskId(taskId: string): Promise<TaskStep[]> {
    if (!taskId) {
      throw new BadRequestException('El ID de la tarea es requerido');
    }

    return await this.taskStepsRepository.find({
      where: { taskId },
      order: { stepNumber: 'ASC' },
      relations: ['task'],
    });
  }

  /**
   * Obtener pasos por estado de completitud
   */
  async getByCompletionStatus(
    taskId: string,
    completionStatus: string,
  ): Promise<TaskStep[]> {
    if (!taskId || !completionStatus) {
      throw new BadRequestException(
        'El ID de la tarea y el estado son requeridos',
      );
    }

    return await this.taskStepsRepository.find({
      where: { taskId, completionStatus },
      order: { stepNumber: 'ASC' },
      relations: ['task'],
    });
  }

  /**
   * Obtener pasos por usuario (a través de agent_tasks)
   */
  async getByUserId(userId: string): Promise<TaskStep[]> {
    if (!userId) {
      throw new BadRequestException('El ID del usuario es requerido');
    }

    return await this.taskStepsRepository
      .createQueryBuilder('taskStep')
      .innerJoinAndSelect('taskStep.task', 'agentTask')
      .where('agentTask.userId = :userId', { userId })
      .orderBy('agentTask.createdAt', 'DESC')
      .addOrderBy('taskStep.stepNumber', 'ASC')
      .getMany();
  }

  /**
   * Actualizar un paso
   */
  async update(
    id: string,
    updateTaskStepDto: UpdateTaskStepDto,
  ): Promise<TaskStep> {
    // Verificar que existe
    await this.getById(id);

    // Actualizar
    await this.taskStepsRepository.update(id, updateTaskStepDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Actualizar estado de completitud
   */
  async updateCompletionStatus(
    id: string,
    completionStatus: string,
  ): Promise<TaskStep> {
    // Verificar que existe
    await this.getById(id);

    // Actualizar solo el estado
    await this.taskStepsRepository.update(id, { completionStatus });

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Actualizar datos de entrada del usuario
   */
  async updateUserInputData(
    id: string,
    userInputData: object,
  ): Promise<TaskStep> {
    // Verificar que existe
    const taskStep = await this.getById(id);

    // Merge de los datos existentes con los nuevos
    const mergedData = {
      ...taskStep.userInputData,
      ...userInputData,
    };

    // Actualizar
    await this.taskStepsRepository.update(id, {
      userInputData: mergedData,
    });

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Agregar entrada al log de asistencia de IA
   */
  async addToAiAssistanceLog(
    id: string,
    logEntry: object,
  ): Promise<TaskStep> {
    // Verificar que existe
    const taskStep = await this.getById(id);

    // Agregar nueva entrada al log
    const updatedLog = [...taskStep.aiAssistanceLog, logEntry];

    // Actualizar
    await this.taskStepsRepository.update(id, {
      aiAssistanceLog: updatedLog,
    });

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar un paso (soft delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Soft delete
    await this.taskStepsRepository.softDelete(id);

    return {
      message: `Paso de tarea con ID ${id} eliminado exitosamente`,
    };
  }
}
