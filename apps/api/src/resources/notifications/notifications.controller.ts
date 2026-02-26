import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva notificación',
    description: 'Crea una notificación para un usuario específico.',
  })
  @ApiResponse({
    status: 201,
    description: 'Notificación creada exitosamente',
    type: Notification,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las notificaciones',
    description: 'Retorna una lista de todas las notificaciones del sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificaciones',
    type: [Notification],
  })
  async findAll(): Promise<Notification[]> {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener notificaciones de un usuario',
    description:
      'Retorna las notificaciones de un usuario específico, opcionalmente filtradas por estado de lectura y con límite de resultados.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'onlyUnread',
    required: false,
    description: 'Filtrar solo notificaciones no leídas',
    example: true,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número máximo de notificaciones a retornar',
    example: 10,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones del usuario',
    type: [Notification],
  })
  async findByUserId(
    @Param('userId') userId: string,
    @Query('onlyUnread') onlyUnread?: string,
    @Query('limit') limit?: string,
  ): Promise<Notification[]> {
    const unreadOnly = onlyUnread === 'true';
    const limitNumber = limit ? parseInt(limit, 10) : undefined;

    return this.notificationsService.findByUserId(
      userId,
      unreadOnly,
      limitNumber,
    );
  }

  @Get('user/:userId/unread-count')
  @ApiOperation({
    summary: 'Contar notificaciones no leídas de un usuario',
    description: 'Retorna el número de notificaciones no leídas de un usuario.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Cantidad de notificaciones no leídas',
    schema: {
      example: { count: 5 },
    },
  })
  async countUnreadByUserId(
    @Param('userId') userId: string,
  ): Promise<{ count: number }> {
    const count =
      await this.notificationsService.countUnreadByUserId(userId);
    return { count };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener notificación por ID',
    description: 'Retorna los detalles de una notificación específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la notificación',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificación encontrada',
    type: Notification,
  })
  @ApiResponse({
    status: 404,
    description: 'Notificación no encontrada',
  })
  async findOne(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar notificación',
    description: 'Actualiza parcialmente los datos de una notificación.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la notificación',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificación actualizada exitosamente',
    type: Notification,
  })
  @ApiResponse({
    status: 404,
    description: 'Notificación no encontrada',
  })
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Patch(':id/mark-as-read')
  @ApiOperation({
    summary: 'Marcar notificación como leída',
    description: 'Marca una notificación específica como leída.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la notificación',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificación marcada como leída',
    type: Notification,
  })
  @ApiResponse({
    status: 404,
    description: 'Notificación no encontrada',
  })
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Post('user/:userId/mark-all-as-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar todas las notificaciones como leídas',
    description:
      'Marca todas las notificaciones no leídas de un usuario como leídas.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones marcadas como leídas',
    schema: {
      example: { message: 'Todas las notificaciones han sido marcadas como leídas' },
    },
  })
  async markAllAsReadByUserId(
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    await this.notificationsService.markAllAsReadByUserId(userId);
    return { message: 'Todas las notificaciones han sido marcadas como leídas' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar notificación',
    description: 'Elimina permanentemente una notificación del sistema.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la notificación',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Notificación eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Notificación no encontrada',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.notificationsService.remove(id);
  }

  @Delete('user/:userId/all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar todas las notificaciones de un usuario',
    description: 'Elimina permanentemente todas las notificaciones de un usuario.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Notificaciones eliminadas exitosamente',
  })
  async removeAllByUserId(@Param('userId') userId: string): Promise<void> {
    return this.notificationsService.removeAllByUserId(userId);
  }
}
