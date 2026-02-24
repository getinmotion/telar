import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { AnalyticsEventsService } from './analytics-events.service';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';
import { UpdateAnalyticsEventDto } from './dto/update-analytics-event.dto';
import { LogAnalyticsEventDto } from './dto/log-analytics-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@ApiTags('analytics-events')
@Controller('analytics-events')
export class AnalyticsEventsController {
  constructor(
    private readonly analyticsEventsService: AnalyticsEventsService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * POST /analytics-events/log
   * Registrar un evento analítico (público, soporta usuarios anónimos y autenticados)
   */
  @Post('log')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar evento analítico (público)',
    description:
      'Registra un evento analítico. Si se proporciona un token JWT válido en el header Authorization, se asociará el evento al usuario. Si no hay token, se registra como evento anónimo.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT opcional (Bearer token)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Evento analítico registrado exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '456e7890-e89b-12d3-a456-426614174000',
          eventType: 'page_view',
          eventData: { page: '/home', referrer: 'google' },
          sessionId: 'sess_abc123',
          success: true,
          durationMs: 1500,
          createdAt: '2026-01-23T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async logEvent(
    @Body() logDto: LogAnalyticsEventDto,
    @Headers('authorization') authHeader?: string,
  ) {
    // Intentar extraer userId del token JWT si está presente
    let userId: string | null = null;

    if (authHeader) {
      try {
        const [type, token] = authHeader.split(' ');

        if (type === 'Bearer' && token) {
          const payload = await this.jwtService.verifyAsync(token);
          userId = payload.sub || null;
        }
      } catch (error) {
        // Si el token es inválido, simplemente continuar sin userId
        // No lanzar error porque el endpoint es público
      }
    }

    return await this.analyticsEventsService.logEvent(logDto, userId);
  }

  /**
   * POST /analytics-events
   * Crear un nuevo evento analítico
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo evento analítico' })
  @ApiResponse({
    status: 201,
    description: 'Evento analítico creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createAnalyticsEventDto: CreateAnalyticsEventDto) {
    return await this.analyticsEventsService.create(createAnalyticsEventDto);
  }

  /**
   * GET /analytics-events
   * Obtener todos los eventos analíticos
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todos los eventos analíticos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos obtenida exitosamente',
  })
  async getAll() {
    return await this.analyticsEventsService.getAll();
  }

  /**
   * GET /analytics-events/stats/event-types
   * Obtener estadísticas por tipo de evento
   */
  @Get('stats/event-types')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener estadísticas agregadas por tipo de evento',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: [
        {
          eventType: 'page_view',
          count: '150',
          avgDuration: '1250.5',
          successCount: '148',
        },
        {
          eventType: 'button_click',
          count: '89',
          avgDuration: '500.2',
          successCount: '89',
        },
      ],
    },
  })
  async getEventTypeStats() {
    return await this.analyticsEventsService.getEventTypeStats();
  }

  /**
   * GET /analytics-events/stats/user/:userId
   * Obtener estadísticas de un usuario
   */
  @Get('stats/user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener estadísticas de eventos de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del usuario obtenidas exitosamente',
    schema: {
      example: {
        totalEvents: '250',
        totalSessions: '15',
        avgDuration: '1100.5',
        successCount: '245',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'ID de usuario inválido' })
  async getUserStats(@Param('userId') userId: string) {
    return await this.analyticsEventsService.getUserStats(userId);
  }

  /**
   * GET /analytics-events/user/:userId
   * Obtener eventos por usuario
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener eventos analíticos por usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Eventos del usuario obtenidos exitosamente',
  })
  @ApiResponse({ status: 400, description: 'ID de usuario inválido' })
  async getByUserId(@Param('userId') userId: string) {
    return await this.analyticsEventsService.getByUserId(userId);
  }

  /**
   * GET /analytics-events/type/:eventType
   * Obtener eventos por tipo
   */
  @Get('type/:eventType')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener eventos analíticos por tipo' })
  @ApiParam({
    name: 'eventType',
    description: 'Tipo de evento',
    example: 'page_view',
  })
  @ApiResponse({
    status: 200,
    description: 'Eventos obtenidos exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Tipo de evento inválido' })
  async getByEventType(@Param('eventType') eventType: string) {
    return await this.analyticsEventsService.getByEventType(eventType);
  }

  /**
   * GET /analytics-events/session/:sessionId
   * Obtener eventos por sesión
   */
  @Get('session/:sessionId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener eventos analíticos por sesión' })
  @ApiParam({
    name: 'sessionId',
    description: 'ID de sesión',
    example: 'sess_abc123xyz',
  })
  @ApiResponse({
    status: 200,
    description: 'Eventos de la sesión obtenidos exitosamente',
  })
  @ApiResponse({ status: 400, description: 'ID de sesión inválido' })
  async getBySessionId(@Param('sessionId') sessionId: string) {
    return await this.analyticsEventsService.getBySessionId(sessionId);
  }

  /**
   * GET /analytics-events/:id
   * Obtener un evento analítico por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener un evento analítico por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del evento (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Evento encontrado',
  })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  async getById(@Param('id') id: string) {
    return await this.analyticsEventsService.getById(id);
  }

  /**
   * PATCH /analytics-events/:id
   * Actualizar un evento analítico
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un evento analítico' })
  @ApiParam({
    name: 'id',
    description: 'ID del evento (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Evento actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateAnalyticsEventDto: UpdateAnalyticsEventDto,
  ) {
    return await this.analyticsEventsService.update(id, updateAnalyticsEventDto);
  }

  /**
   * DELETE /analytics-events/:id
   * Eliminar un evento analítico
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un evento analítico' })
  @ApiParam({
    name: 'id',
    description: 'ID del evento (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Evento eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  async delete(@Param('id') id: string) {
    return await this.analyticsEventsService.delete(id);
  }
}
