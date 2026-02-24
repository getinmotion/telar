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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AgentDeliverablesService } from './agent-deliverables.service';
import { CreateAgentDeliverableDto } from './dto/create-agent-deliverable.dto';
import { UpdateAgentDeliverableDto } from './dto/update-agent-deliverable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('agent-deliverables')
@Controller('agent-deliverables')
export class AgentDeliverablesController {
  constructor(
    private readonly agentDeliverablesService: AgentDeliverablesService,
  ) {}

  /**
   * POST /agent-deliverables
   * Crear un nuevo entregable
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo entregable de agente' })
  @ApiResponse({
    status: 201,
    description: 'Entregable creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createAgentDeliverableDto: CreateAgentDeliverableDto) {
    return await this.agentDeliverablesService.create(
      createAgentDeliverableDto,
    );
  }

  /**
   * GET /agent-deliverables
   * Obtener todos los entregables
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todos los entregables' })
  @ApiResponse({
    status: 200,
    description: 'Lista de entregables obtenida exitosamente',
  })
  async getAll() {
    return await this.agentDeliverablesService.getAll();
  }

  /**
   * GET /agent-deliverables/user/:userId
   * Obtener entregables por usuario
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener entregables por usuario',
    description: 'Obtiene todos los entregables de un usuario específico',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Entregables del usuario obtenidos exitosamente',
  })
  @ApiResponse({ status: 400, description: 'ID de usuario inválido' })
  async getByUserId(@Param('userId') userId: string) {
    return await this.agentDeliverablesService.getByUserId(userId);
  }

  /**
   * GET /agent-deliverables/agent/:agentId
   * Obtener entregables por agente
   */
  @Get('agent/:agentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener entregables por agente',
    description: 'Obtiene todos los entregables generados por un agente específico',
  })
  @ApiParam({
    name: 'agentId',
    description: 'ID del agente',
    example: 'ai-agent-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Entregables del agente obtenidos exitosamente',
  })
  @ApiResponse({ status: 400, description: 'ID de agente inválido' })
  async getByAgentId(@Param('agentId') agentId: string) {
    return await this.agentDeliverablesService.getByAgentId(agentId);
  }

  /**
   * GET /agent-deliverables/user/:userId/agent/:agentId
   * Obtener entregables por usuario y agente
   */
  @Get('user/:userId/agent/:agentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener entregables por usuario y agente',
    description:
      'Obtiene todos los entregables de un usuario específico generados por un agente específico',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'agentId',
    description: 'ID del agente',
    example: 'ai-agent-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Entregables obtenidos exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  async getByUserAndAgent(
    @Param('userId') userId: string,
    @Param('agentId') agentId: string,
  ) {
    return await this.agentDeliverablesService.getByUserAndAgent(
      userId,
      agentId,
    );
  }

  /**
   * GET /agent-deliverables/task/:taskId
   * Obtener entregables por tarea
   */
  @Get('task/:taskId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener entregables por tarea',
    description: 'Obtiene todos los entregables asociados a una tarea específica',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID de la tarea (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Entregables de la tarea obtenidos exitosamente',
  })
  @ApiResponse({ status: 400, description: 'ID de tarea inválido' })
  async getByTaskId(@Param('taskId') taskId: string) {
    return await this.agentDeliverablesService.getByTaskId(taskId);
  }

  /**
   * GET /agent-deliverables/:id
   * Obtener un entregable por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener un entregable por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del entregable (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Entregable encontrado',
  })
  @ApiResponse({ status: 404, description: 'Entregable no encontrado' })
  async getById(@Param('id') id: string) {
    return await this.agentDeliverablesService.getById(id);
  }

  /**
   * PATCH /agent-deliverables/:id
   * Actualizar un entregable
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un entregable' })
  @ApiParam({
    name: 'id',
    description: 'ID del entregable (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Entregable actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Entregable no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateAgentDeliverableDto: UpdateAgentDeliverableDto,
  ) {
    return await this.agentDeliverablesService.update(
      id,
      updateAgentDeliverableDto,
    );
  }

  /**
   * DELETE /agent-deliverables/:id
   * Eliminar un entregable
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un entregable' })
  @ApiParam({
    name: 'id',
    description: 'ID del entregable (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Entregable eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Entregable no encontrado' })
  async delete(@Param('id') id: string) {
    return await this.agentDeliverablesService.delete(id);
  }
}
