import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';
import { UpdateAnalyticsEventDto } from './dto/update-analytics-event.dto';
import { LogAnalyticsEventDto } from './dto/log-analytics-event.dto';

@Injectable()
export class AnalyticsEventsService {
  private readonly logger = new Logger(AnalyticsEventsService.name);

  constructor(
    @Inject('ANALYTICS_EVENTS_REPOSITORY')
    private readonly analyticsEventsRepository: Repository<AnalyticsEvent>,
  ) {}

  /**
   * Crear un nuevo evento analítico
   */
  async create(
    createAnalyticsEventDto: CreateAnalyticsEventDto,
  ): Promise<AnalyticsEvent> {
    const newEvent = this.analyticsEventsRepository.create(
      createAnalyticsEventDto,
    );
    return await this.analyticsEventsRepository.save(newEvent);
  }

  /**
   * Registrar evento analítico (para tracking)
   * Permite eventos anónimos (sin userId) o autenticados
   */
  async logEvent(
    logDto: LogAnalyticsEventDto,
    userId?: string | null,
  ): Promise<{ success: boolean; data: AnalyticsEvent }> {
    const insertData: Partial<AnalyticsEvent> = {
      eventType: logDto.event_type,
      eventData: logDto.event_data || {},
      sessionId: logDto.session_id,
      success: logDto.success ?? true,
      durationMs: logDto.duration_ms,
    };

    // Solo agregar userId si está presente
    if (userId) {
      insertData.userId = userId;
    }

    const newEvent = this.analyticsEventsRepository.create(insertData);
    const savedEvent: AnalyticsEvent = await this.analyticsEventsRepository.save(newEvent);


    return {
      success: true,
      data: savedEvent,
    };
  }

  /**
   * Obtener todos los eventos analíticos
   */
  async getAll(): Promise<AnalyticsEvent[]> {
    return await this.analyticsEventsRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Obtener un evento analítico por ID
   */
  async getById(id: string): Promise<AnalyticsEvent> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const event = await this.analyticsEventsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!event) {
      throw new NotFoundException(
        `Evento analítico con ID ${id} no encontrado`,
      );
    }

    return event;
  }

  /**
   * Obtener eventos por usuario
   */
  async getByUserId(userId: string): Promise<AnalyticsEvent[]> {
    if (!userId) {
      throw new BadRequestException('El ID del usuario es requerido');
    }

    return await this.analyticsEventsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Obtener eventos por tipo
   */
  async getByEventType(eventType: string): Promise<AnalyticsEvent[]> {
    if (!eventType) {
      throw new BadRequestException('El tipo de evento es requerido');
    }

    return await this.analyticsEventsRepository.find({
      where: { eventType },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Obtener eventos por sesión
   */
  async getBySessionId(sessionId: string): Promise<AnalyticsEvent[]> {
    if (!sessionId) {
      throw new BadRequestException('El ID de sesión es requerido');
    }

    return await this.analyticsEventsRepository.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Actualizar un evento analítico
   */
  async update(
    id: string,
    updateAnalyticsEventDto: UpdateAnalyticsEventDto,
  ): Promise<AnalyticsEvent> {
    // Verificar que existe
    const event = await this.getById(id);

    // Actualizar
    await this.analyticsEventsRepository.update(id, updateAnalyticsEventDto);

    // Retornar actualizado
    return await this.getById(id);
  }

  /**
   * Eliminar un evento analítico (soft delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    // Verificar que existe
    await this.getById(id);

    // Eliminar permanentemente (analytics no usa soft delete típicamente)
    await this.analyticsEventsRepository.delete(id);

    return {
      message: `Evento analítico con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Obtener estadísticas de eventos por tipo
   */
  async getEventTypeStats(): Promise<any[]> {
    return await this.analyticsEventsRepository
      .createQueryBuilder('event')
      .select('event.eventType', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(event.durationMs)', 'avgDuration')
      .addSelect(
        'SUM(CASE WHEN event.success = true THEN 1 ELSE 0 END)',
        'successCount',
      )
      .groupBy('event.eventType')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  /**
   * Obtener estadísticas de eventos por usuario
   */
  async getUserStats(userId: string): Promise<any> {
    if (!userId) {
      throw new BadRequestException('El ID del usuario es requerido');
    }

    const result = await this.analyticsEventsRepository
      .createQueryBuilder('event')
      .select('COUNT(*)', 'totalEvents')
      .addSelect('COUNT(DISTINCT event.sessionId)', 'totalSessions')
      .addSelect('AVG(event.durationMs)', 'avgDuration')
      .addSelect(
        'SUM(CASE WHEN event.success = true THEN 1 ELSE 0 END)',
        'successCount',
      )
      .where('event.userId = :userId', { userId })
      .getRawOne();

    return result;
  }
}
