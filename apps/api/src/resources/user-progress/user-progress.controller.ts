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
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserProgressService } from './user-progress.service';
import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('user-progress')
@Controller('user-progress')
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  /**
   * POST /user-progress
   * Crear un nuevo registro de progreso
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo registro de progreso de usuario' })
  @ApiResponse({
    status: 201,
    description: 'Registro de progreso creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe progreso para este usuario' })
  async create(@Body() createDto: CreateUserProgressDto) {
    return await this.userProgressService.create(createDto);
  }

  /**
   * GET /user-progress
   * Obtener todos los registros de progreso
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los registros de progreso' })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros obtenida exitosamente',
  })
  async getAll() {
    return await this.userProgressService.getAll();
  }

  /**
   * GET /user-progress/leaderboard
   * Obtener ranking de usuarios
   */
  @Get('leaderboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener ranking de usuarios por nivel y XP' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de usuarios a retornar',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Ranking obtenido exitosamente',
  })
  async getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return await this.userProgressService.getLeaderboard(limitNum);
  }

  /**
   * GET /user-progress/user/:userId
   * Obtener progreso por userId
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener progreso de un usuario por userId' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Progreso del usuario encontrado',
  })
  @ApiResponse({ status: 404, description: 'Progreso no encontrado' })
  async getByUserId(@Param('userId') userId: string) {
    return await this.userProgressService.getByUserId(userId);
  }

  /**
   * GET /user-progress/:id
   * Obtener un registro de progreso por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un registro de progreso por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de progreso (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro de progreso encontrado',
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async getById(@Param('id') id: string) {
    return await this.userProgressService.getById(id);
  }

  /**
   * PATCH /user-progress/:id
   * Actualizar un registro de progreso
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un registro de progreso' })
  @ApiParam({
    name: 'id',
    description: 'ID del registro (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserProgressDto,
  ) {
    return await this.userProgressService.update(id, updateDto);
  }

  /**
   * DELETE /user-progress/:id
   * Eliminar un registro de progreso
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un registro de progreso' })
  @ApiParam({
    name: 'id',
    description: 'ID del registro (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async delete(@Param('id') id: string) {
    return await this.userProgressService.delete(id);
  }

  /**
   * POST /user-progress/:userId/experience
   * Agregar puntos de experiencia
   */
  @Post(':userId/experience')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Agregar puntos de experiencia a un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Experiencia agregada exitosamente',
  })
  async addExperience(
    @Param('userId') userId: string,
    @Body('points') points: number,
  ) {
    return await this.userProgressService.addExperience(userId, points);
  }

  /**
   * POST /user-progress/:userId/mission
   * Completar una misión
   */
  @Post(':userId/mission')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Marcar una misión como completada' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Misión completada exitosamente',
  })
  async completeMission(@Param('userId') userId: string) {
    return await this.userProgressService.completeMission(userId);
  }

  /**
   * POST /user-progress/:userId/streak
   * Actualizar racha de actividad
   */
  @Post(':userId/streak')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar racha de actividad del usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Racha actualizada exitosamente',
  })
  async updateStreak(@Param('userId') userId: string) {
    return await this.userProgressService.updateStreak(userId);
  }

  /**
   * POST /user-progress/:userId/time
   * Agregar tiempo invertido
   */
  @Post(':userId/time')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Agregar tiempo invertido (en minutos)' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tiempo agregado exitosamente',
  })
  async addTimeSpent(
    @Param('userId') userId: string,
    @Body('minutes') minutes: number,
  ) {
    return await this.userProgressService.addTimeSpent(userId, minutes);
  }

  /**
   * POST /user-progress/update
   * Actualizar progreso completo del usuario (XP, nivel, rachas, logros)
   */
  @Post('update')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Actualizar progreso del usuario',
    description:
      'Actualiza XP, nivel, rachas y misiones completadas. Verifica y desbloquea logros automáticamente. El userId se extrae del JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Progreso actualizado exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          level: 3,
          experiencePoints: 75,
          nextLevelXP: 225,
          leveledUp: true,
          levelsGained: [3],
          completedMissions: 5,
          currentStreak: 3,
          longestStreak: 5,
          unlockedAchievements: [
            {
              id: 'five_missions',
              title: 'Emprendedor Activo',
              description: 'Completaste 5 misiones',
              icon: 'fire',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 500,
    description: 'Error al actualizar progreso',
  })
  async updateProgress(@Req() req: any, @Body() dto: UpdateProgressDto) {
    // Extraer userId del JWT
    const userId = req.user?.sub;

    if (!userId) {
      throw new BadRequestException('Usuario no identificado en el token JWT');
    }

    return await this.userProgressService.updateProgress(userId, dto);
  }
}
