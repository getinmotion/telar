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
  ApiBody,
} from '@nestjs/swagger';
import { TaskStepsService } from './task-steps.service';
import { CreateTaskStepDto } from './dto/create-task-step.dto';
import { UpdateTaskStepDto } from './dto/update-task-step.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('task-steps')
@Controller('task-steps')
export class TaskStepsController {
  constructor(private readonly taskStepsService: TaskStepsService) {}

  /**
   * POST /task-steps
   * Crear un nuevo paso de tarea
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo paso de tarea' })
  @ApiResponse({
    status: 201,
    description: 'Paso de tarea creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createTaskStepDto: CreateTaskStepDto) {
    return await this.taskStepsService.create(createTaskStepDto);
  }

  /**
   * GET /task-steps
   * Obtener todos los pasos
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todos los pasos de tareas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pasos obtenida exitosamente',
  })
  async getAll() {
    return await this.taskStepsService.getAll();
  }

  /**
   * GET /task-steps/task/:taskId
   * Obtener pasos por tarea
   */
  @Get('task/:taskId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener pasos por tarea',
    description: 'Obtiene todos los pasos de una tarea específica ordenados por stepNumber',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID de la tarea (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Pasos de la tarea obtenidos exitosamente',
  })
  @ApiResponse({ status: 400, description: 'ID de tarea inválido' })
  async getByTaskId(@Param('taskId') taskId: string) {
    return await this.taskStepsService.getByTaskId(taskId);
  }

  /**
   * GET /task-steps/task/:taskId/status/:status
   * Obtener pasos por tarea y estado
   */
  @Get('task/:taskId/status/:status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener pasos por tarea y estado',
    description: 'Filtra los pasos de una tarea por su estado de completitud',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID de la tarea (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'status',
    description: 'Estado de completitud',
    example: 'pending',
    enum: ['pending', 'in_progress', 'completed', 'skipped'],
  })
  @ApiResponse({
    status: 200,
    description: 'Pasos filtrados obtenidos exitosamente',
  })
  async getByCompletionStatus(
    @Param('taskId') taskId: string,
    @Param('status') status: string,
  ) {
    return await this.taskStepsService.getByCompletionStatus(taskId, status);
  }

  /**
   * GET /task-steps/user/:userId
   * Obtener pasos por usuario (a través de agent_tasks)
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener pasos por usuario',
    description:
      'Obtiene todos los pasos de tareas asociados a un usuario a través de agent_tasks',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Pasos del usuario obtenidos exitosamente',
  })
  @ApiResponse({ status: 400, description: 'ID de usuario inválido' })
  async getByUserId(@Param('userId') userId: string) {
    return await this.taskStepsService.getByUserId(userId);
  }

  /**
   * GET /task-steps/:id
   * Obtener un paso por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener un paso por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del paso (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Paso encontrado',
  })
  @ApiResponse({ status: 404, description: 'Paso no encontrado' })
  async getById(@Param('id') id: string) {
    return await this.taskStepsService.getById(id);
  }

  /**
   * PATCH /task-steps/:id
   * Actualizar un paso
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un paso' })
  @ApiParam({
    name: 'id',
    description: 'ID del paso (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Paso actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Paso no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskStepDto: UpdateTaskStepDto,
  ) {
    return await this.taskStepsService.update(id, updateTaskStepDto);
  }

  /**
   * PATCH /task-steps/:id/status
   * Actualizar estado de completitud
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar estado de completitud' })
  @ApiParam({
    name: 'id',
    description: 'ID del paso (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Nuevo estado',
    schema: {
      type: 'object',
      properties: {
        completionStatus: {
          type: 'string',
          enum: ['pending', 'in_progress', 'completed', 'skipped'],
          example: 'completed',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
  })
  async updateCompletionStatus(
    @Param('id') id: string,
    @Body('completionStatus') completionStatus: string,
  ) {
    return await this.taskStepsService.updateCompletionStatus(
      id,
      completionStatus,
    );
  }

  /**
   * PATCH /task-steps/:id/user-input
   * Actualizar datos de entrada del usuario
   */
  @Patch(':id/user-input')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar datos de entrada del usuario' })
  @ApiParam({
    name: 'id',
    description: 'ID del paso (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Datos de entrada del usuario',
    schema: {
      type: 'object',
      example: {
        businessName: 'Artesanías Don Juan',
        location: 'Ráquira, Boyacá',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Datos actualizados exitosamente',
  })
  async updateUserInputData(
    @Param('id') id: string,
    @Body() userInputData: object,
  ) {
    return await this.taskStepsService.updateUserInputData(id, userInputData);
  }

  /**
   * POST /task-steps/:id/ai-log
   * Agregar entrada al log de asistencia de IA
   */
  @Post(':id/ai-log')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Agregar entrada al log de asistencia de IA' })
  @ApiParam({
    name: 'id',
    description: 'ID del paso (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Entrada del log',
    schema: {
      type: 'object',
      example: {
        timestamp: '2026-01-27T15:30:00Z',
        message: 'Usuario solicitó ayuda',
        aiResponse: 'Le proporcioné sugerencias',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Entrada agregada al log exitosamente',
  })
  async addToAiAssistanceLog(
    @Param('id') id: string,
    @Body() logEntry: object,
  ) {
    return await this.taskStepsService.addToAiAssistanceLog(id, logEntry);
  }

  /**
   * DELETE /task-steps/:id
   * Eliminar un paso
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un paso' })
  @ApiParam({
    name: 'id',
    description: 'ID del paso (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Paso eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Paso no encontrado' })
  async delete(@Param('id') id: string) {
    return await this.taskStepsService.delete(id);
  }
}
