import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { AgentDeliverable } from './entities/agent-deliverable.entity';
import { CreateAgentDeliverableDto } from './dto/create-agent-deliverable.dto';
import { UpdateAgentDeliverableDto } from './dto/update-agent-deliverable.dto';

@Injectable()
export class AgentDeliverablesService {
  private readonly logger = new Logger(AgentDeliverablesService.name);

  constructor(
    @Inject('AGENT_DELIVERABLES_REPOSITORY')
    private readonly agentDeliverablesRepository: Repository<AgentDeliverable>,
  ) {}

  /**
   * Crear un nuevo entregable
   */
  async create(
    createAgentDeliverableDto: CreateAgentDeliverableDto,
  ): Promise<AgentDeliverable> {
    const newDeliverable = this.agentDeliverablesRepository.create(
      createAgentDeliverableDto,
    );
    return await this.agentDeliverablesRepository.save(newDeliverable);
  }

  /**
   * Obtener todos los entregables
   */
  async getAll(): Promise<AgentDeliverable[]> {
    return await this.agentDeliverablesRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user', 'task'],
    });
  }

  /**
   * Obtener un entregable por ID
   */
  async getById(id: string): Promise<AgentDeliverable> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const deliverable = await this.agentDeliverablesRepository.findOne({
      where: { id },
      relations: ['user', 'task'],
    });

    if (!deliverable) {
      throw new NotFoundException(`Entregable con ID ${id} no encontrado`);
    }

    return deliverable;
  }

  /**
   * Obtener entregables por usuario
   */
  async getByUserId(userId: string): Promise<AgentDeliverable[]> {
    if (!userId) {
      throw new BadRequestException('El ID del usuario es requerido');
    }

    return await this.agentDeliverablesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['user', 'task'],
    });
  }

  /**
   * Obtener entregables por agente
   */
  async getByAgentId(agentId: string): Promise<AgentDeliverable[]> {
    if (!agentId) {
      throw new BadRequestException('El ID del agente es requerido');
    }

    return await this.agentDeliverablesRepository.find({
      where: { agentId },
      order: { createdAt: 'DESC' },
      relations: ['user', 'task'],
    });
  }

  /**
   * Obtener entregables por usuario y agente
   */
  async getByUserAndAgent(
    userId: string,
    agentId: string,
  ): Promise<AgentDeliverable[]> {
    if (!userId || !agentId) {
      throw new BadRequestException(
        'El ID del usuario y el ID del agente son requeridos',
      );
    }

    return await this.agentDeliverablesRepository.find({
      where: { userId, agentId },
      order: { createdAt: 'DESC' },
      relations: ['user', 'task'],
    });
  }

  /**
   * Obtener entregables por tarea
   */
  async getByTaskId(taskId: string): Promise<AgentDeliverable[]> {
    if (!taskId) {
      throw new BadRequestException('El ID de la tarea es requerido');
    }

    return await this.agentDeliverablesRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
      relations: ['user', 'task'],
    });
  }

  /**
   * Actualizar un entregable
   */
  async update(
    id: string,
    updateAgentDeliverableDto: UpdateAgentDeliverableDto,
  ): Promise<AgentDeliverable> {
    // Verificar que existe
    await this.getById(id);

    // Actualizar
    await this.agentDeliverablesRepository.update(
      id,
      updateAgentDeliverableDto,
    );

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar un entregable (soft delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Soft delete
    await this.agentDeliverablesRepository.softDelete(id);

    return {
      message: `Entregable con ID ${id} eliminado exitosamente`,
    };
  }
}
