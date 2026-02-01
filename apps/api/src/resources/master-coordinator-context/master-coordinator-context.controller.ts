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
import { MasterCoordinatorContextService } from './master-coordinator-context.service';
import { CreateMasterCoordinatorContextDto } from './dto/create-master-coordinator-context.dto';
import { UpdateMasterCoordinatorContextDto } from './dto/update-master-coordinator-context.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('master-coordinator-context')
@Controller('master-coordinator-context')
export class MasterCoordinatorContextController {
  constructor(
    private readonly masterCoordinatorContextService: MasterCoordinatorContextService,
  ) {}

  /**
   * POST /master-coordinator-context
   * Crear un nuevo contexto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo contexto de coordinador' })
  @ApiResponse({
    status: 201,
    description: 'Contexto creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe un contexto para este usuario' })
  async create(@Body() createDto: CreateMasterCoordinatorContextDto) {
    return await this.masterCoordinatorContextService.create(createDto);
  }

  /**
   * GET /master-coordinator-context
   * Obtener todos los contextos
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todos los contextos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de contextos obtenida exitosamente',
  })
  async getAll() {
    return await this.masterCoordinatorContextService.getAll();
  }

  /**
   * GET /master-coordinator-context/stats
   * Obtener estadísticas de contextos
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener estadísticas de contextos' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        totalContexts: 150,
        averageMemorySize: 25,
        averageContextVersion: 12,
        activeLastWeek: 80,
        activeLastMonth: 120,
      },
    },
  })
  async getStats() {
    return await this.masterCoordinatorContextService.getStats();
  }

  /**
   * GET /master-coordinator-context/inactive
   * Obtener contextos inactivos
   */
  @Get('inactive')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener contextos inactivos' })
  @ApiQuery({
    name: 'days',
    description: 'Días de inactividad (default: 30)',
    required: false,
    type: Number,
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Contextos inactivos obtenidos exitosamente',
  })
  async getInactiveContexts(@Query('days') days?: number) {
    const daysInactive = days ? Number(days) : 30;
    return await this.masterCoordinatorContextService.getInactiveContexts(
      daysInactive,
    );
  }

  /**
   * GET /master-coordinator-context/:id
   * Obtener un contexto por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener un contexto por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del contexto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Contexto encontrado',
  })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async getById(@Param('id') id: string) {
    return await this.masterCoordinatorContextService.getById(id);
  }

  /**
   * GET /master-coordinator-context/user/:userId
   * Obtener contexto por userId
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener contexto por userId' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Contexto encontrado',
  })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async getByUserId(@Param('userId') userId: string) {
    return await this.masterCoordinatorContextService.getByUserId(userId);
  }

  /**
   * GET /master-coordinator-context/user/:userId/or-create
   * Obtener o crear contexto para un usuario
   */
  @Get('user/:userId/or-create')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener o crear contexto para un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Contexto obtenido o creado exitosamente',
  })
  async getOrCreate(@Param('userId') userId: string) {
    return await this.masterCoordinatorContextService.getOrCreate(userId);
  }

  /**
   * PATCH /master-coordinator-context/:id
   * Actualizar un contexto
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un contexto' })
  @ApiParam({
    name: 'id',
    description: 'ID del contexto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Contexto actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMasterCoordinatorContextDto,
  ) {
    return await this.masterCoordinatorContextService.update(id, updateDto);
  }

  /**
   * PATCH /master-coordinator-context/user/:userId
   * Actualizar contexto por userId
   */
  @Patch('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar contexto por userId' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Contexto actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async updateByUserId(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateMasterCoordinatorContextDto,
  ) {
    return await this.masterCoordinatorContextService.updateByUserId(
      userId,
      updateDto,
    );
  }

  /**
   * POST /master-coordinator-context/user/:userId/snapshot
   * Actualizar solo el snapshot del contexto
   */
  @Post('user/:userId/snapshot')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar snapshot del contexto' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Datos del snapshot a actualizar',
    schema: {
      type: 'object',
      example: {
        currentGoals: ['Registrar RUT'],
        businessStage: 'growth',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot actualizado exitosamente',
  })
  async updateContextSnapshot(
    @Param('userId') userId: string,
    @Body() snapshot: Record<string, any>,
  ) {
    return await this.masterCoordinatorContextService.updateContextSnapshot(
      userId,
      snapshot,
    );
  }

  /**
   * POST /master-coordinator-context/user/:userId/memory
   * Agregar entrada a la memoria de IA
   */
  @Post('user/:userId/memory')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Agregar entrada a la memoria de IA' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Entrada de memoria',
    schema: {
      type: 'object',
      example: {
        message: 'Usuario preguntó sobre RUT',
        response: 'Le expliqué el proceso',
        context: 'formalization',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Entrada agregada a la memoria exitosamente',
  })
  async addToAiMemory(
    @Param('userId') userId: string,
    @Body() memoryEntry: any,
  ) {
    return await this.masterCoordinatorContextService.addToAiMemory(
      userId,
      memoryEntry,
    );
  }

  /**
   * POST /master-coordinator-context/user/:userId/memory/trim
   * Limpiar memoria de IA (mantener solo las últimas N entradas)
   */
  @Post('user/:userId/memory/trim')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Limpiar memoria de IA manteniendo solo las últimas N entradas',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'keepLast',
    description: 'Número de entradas a mantener (default: 100)',
    required: false,
    type: Number,
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Memoria limpiada exitosamente',
  })
  async trimAiMemory(
    @Param('userId') userId: string,
    @Query('keepLast') keepLast?: number,
  ) {
    const keep = keepLast ? Number(keepLast) : 100;
    return await this.masterCoordinatorContextService.trimAiMemory(
      userId,
      keep,
    );
  }

  /**
   * POST /master-coordinator-context/user/:userId/interaction
   * Actualizar última interacción
   */
  @Post('user/:userId/interaction')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar última interacción' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Última interacción actualizada exitosamente',
  })
  async updateLastInteraction(@Param('userId') userId: string) {
    return await this.masterCoordinatorContextService.updateLastInteraction(
      userId,
    );
  }

  /**
   * DELETE /master-coordinator-context/:id
   * Eliminar un contexto
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un contexto' })
  @ApiParam({
    name: 'id',
    description: 'ID del contexto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Contexto eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async delete(@Param('id') id: string) {
    return await this.masterCoordinatorContextService.delete(id);
  }

  /**
   * DELETE /master-coordinator-context/user/:userId
   * Eliminar contexto por userId
   */
  @Delete('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar contexto por userId' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Contexto eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Contexto no encontrado' })
  async deleteByUserId(@Param('userId') userId: string) {
    return await this.masterCoordinatorContextService.deleteByUserId(userId);
  }
}
