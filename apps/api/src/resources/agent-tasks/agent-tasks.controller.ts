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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AgentTasksService } from './agent-tasks.service';
import { CreateAgentTaskDto } from './dto/create-agent-task.dto';
import { UpdateAgentTaskDto } from './dto/update-agent-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskStatus } from './entities/agent-task.entity';

@ApiTags('agent-tasks')
@Controller('agent-tasks')
export class AgentTasksController {
  constructor(private readonly agentTasksService: AgentTasksService) {}

  /**
   * POST /agent-tasks
   * Crear una nueva tarea de agente
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear una nueva tarea de agente' })
  @ApiResponse({
    status: 201,
    description: 'Tarea creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una tarea para este usuario y agente',
  })
  async create(@Body() createDto: CreateAgentTaskDto) {
    return await this.agentTasksService.create(createDto);
  }

  /**
   * GET /agent-tasks
   * Obtener todas las tareas
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todas las tareas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas obtenida exitosamente',
  })
  async getAll() {
    return await this.agentTasksService.getAll();
  }

  /**
   * GET /agent-tasks/:id
   * Obtener una tarea por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener una tarea por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea encontrada',
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async getById(@Param('id') id: string) {
    return await this.agentTasksService.getById(id);
  }

  /**
   * GET /agent-tasks/user/:userId
   * Obtener todas las tareas de un usuario
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todas las tareas de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tareas del usuario obtenidas exitosamente',
  })
  async getByUserId(@Param('userId') userId: string) {
    return await this.agentTasksService.getByUserId(userId);
  }

  /**
   * GET /agent-tasks/user/:userId/status/:status
   * Obtener tareas de un usuario por estado
   */
  @Get('user/:userId/status/:status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener tareas de un usuario por estado' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'status',
    description: 'Estado de la tarea',
    enum: TaskStatus,
    example: 'pending',
  })
  @ApiResponse({
    status: 200,
    description: 'Tareas filtradas por estado obtenidas exitosamente',
  })
  async getByUserIdAndStatus(
    @Param('userId') userId: string,
    @Param('status') status: TaskStatus,
  ) {
    return await this.agentTasksService.getByUserIdAndStatus(userId, status);
  }

  /**
   * GET /agent-tasks/agent/:agentId
   * Obtener tareas por agente
   */
  @Get('agent/:agentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todas las tareas de un agente' })
  @ApiParam({
    name: 'agentId',
    description: 'ID del agente',
    example: 'agent_formalization',
  })
  @ApiResponse({
    status: 200,
    description: 'Tareas del agente obtenidas exitosamente',
  })
  async getByAgentId(@Param('agentId') agentId: string) {
    return await this.agentTasksService.getByAgentId(agentId);
  }

  /**
   * GET /agent-tasks/user/:userId/active
   * Obtener tareas activas de un usuario
   */
  @Get('user/:userId/active')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener tareas activas de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tareas activas obtenidas exitosamente',
  })
  async getActiveTasks(@Param('userId') userId: string) {
    return await this.agentTasksService.getActiveTasks(userId);
  }

  /**
   * GET /agent-tasks/user/:userId/archived
   * Obtener tareas archivadas de un usuario
   */
  @Get('user/:userId/archived')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener tareas archivadas de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tareas archivadas obtenidas exitosamente',
  })
  async getArchivedTasks(@Param('userId') userId: string) {
    return await this.agentTasksService.getArchivedTasks(userId);
  }

  /**
   * GET /agent-tasks/user/:userId/milestone/:category
   * Obtener tareas por categoría de milestone
   */
  @Get('user/:userId/milestone/:category')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener tareas por categoría de milestone' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'category',
    description: 'Categoría del milestone',
    example: 'formalization',
  })
  @ApiResponse({
    status: 200,
    description: 'Tareas por categoría obtenidas exitosamente',
  })
  async getByMilestoneCategory(
    @Param('userId') userId: string,
    @Param('category') category: string,
  ) {
    return await this.agentTasksService.getByMilestoneCategory(
      userId,
      category,
    );
  }

  /**
   * GET /agent-tasks/user/:userId/stats
   * Obtener estadísticas de tareas de un usuario
   */
  @Get('user/:userId/stats')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener estadísticas de tareas de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        total: 10,
        pending: 3,
        inProgress: 2,
        completed: 4,
        cancelled: 1,
        archived: 2,
      },
    },
  })
  async getUserTaskStats(@Param('userId') userId: string) {
    return await this.agentTasksService.getUserTaskStats(userId);
  }

  /**
   * PATCH /agent-tasks/:id
   * Actualizar una tarea
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar una tarea' })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAgentTaskDto,
  ) {
    return await this.agentTasksService.update(id, updateDto);
  }

  /**
   * PATCH /agent-tasks/:id/complete
   * Marcar tarea como completada
   */
  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Marcar tarea como completada' })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea marcada como completada',
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async markAsCompleted(@Param('id') id: string) {
    return await this.agentTasksService.markAsCompleted(id);
  }

  /**
   * PATCH /agent-tasks/:id/archive
   * Archivar una tarea
   */
  @Patch(':id/archive')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Archivar una tarea' })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea archivada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async archive(@Param('id') id: string) {
    return await this.agentTasksService.archive(id);
  }

  /**
   * PATCH /agent-tasks/:id/unarchive
   * Desarchivar una tarea
   */
  @Patch(':id/unarchive')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Desarchivar una tarea' })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea desarchivada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async unarchive(@Param('id') id: string) {
    return await this.agentTasksService.unarchive(id);
  }

  /**
   * PATCH /agent-tasks/:id/progress
   * Actualizar progreso de una tarea
   */
  @Patch(':id/progress')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar progreso de una tarea' })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'progressPercentage',
    description: 'Porcentaje de progreso (0-100)',
    example: 50,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Progreso actualizado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Progreso inválido' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async updateProgress(
    @Param('id') id: string,
    @Query('progressPercentage') progressPercentage: number,
  ) {
    return await this.agentTasksService.updateProgress(
      id,
      Number(progressPercentage),
    );
  }

  /**
   * DELETE /agent-tasks/:id
   * Eliminar una tarea
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar una tarea' })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async delete(@Param('id') id: string) {
    return await this.agentTasksService.delete(id);
  }
}
