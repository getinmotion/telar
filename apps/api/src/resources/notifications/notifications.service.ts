import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('NOTIFICATIONS_REPOSITORY')
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      userId: createNotificationDto.userId,
      type: createNotificationDto.type,
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      metadata: createNotificationDto.metadata || {},
      read: false,
    });

    return await this.notificationsRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException(
        `Notificación con ID ${id} no encontrada`,
      );
    }

    return notification;
  }

  async findByUserId(
    userId: string,
    onlyUnread?: boolean,
    limit?: number,
  ): Promise<Notification[]> {
    const where: any = { userId };

    if (onlyUnread === true) {
      where.read = false;
    }

    const queryOptions: any = {
      where,
      order: { createdAt: 'DESC' },
    };

    if (limit && limit > 0) {
      queryOptions.take = limit;
    }

    return await this.notificationsRepository.find(queryOptions);
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return await this.notificationsRepository.count({
      where: { userId, read: false },
    });
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.findOne(id);

    // Actualizar campos si están presentes
    if (updateNotificationDto.title !== undefined) {
      notification.title = updateNotificationDto.title;
    }
    if (updateNotificationDto.message !== undefined) {
      notification.message = updateNotificationDto.message;
    }
    if (updateNotificationDto.metadata !== undefined) {
      notification.metadata = updateNotificationDto.metadata;
    }
    if (updateNotificationDto.read !== undefined) {
      notification.read = updateNotificationDto.read;
    }

    return await this.notificationsRepository.save(notification);
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.read = true;
    return await this.notificationsRepository.save(notification);
  }

  async markAllAsReadByUserId(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, read: false },
      { read: true },
    );
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationsRepository.remove(notification);
  }

  async removeAllByUserId(userId: string): Promise<void> {
    await this.notificationsRepository.delete({ userId });
  }
}
