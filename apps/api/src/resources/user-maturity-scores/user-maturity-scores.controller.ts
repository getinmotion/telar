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
import { UserMaturityScoresService } from './user-maturity-scores.service';
import { CreateUserMaturityScoreDto } from './dto/create-user-maturity-score.dto';
import { UpdateUserMaturityScoreDto } from './dto/update-user-maturity-score.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('user-maturity-scores')
@Controller('user-maturity-scores')
export class UserMaturityScoresController {
  constructor(
    private readonly userMaturityScoresService: UserMaturityScoresService,
  ) {}

  /**
   * POST /user-maturity-scores
   * Crear un nuevo score de madurez
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo score de madurez' })
  @ApiResponse({
    status: 201,
    description: 'Score creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createDto: CreateUserMaturityScoreDto) {
    return await this.userMaturityScoresService.create(createDto);
  }

  /**
   * GET /user-maturity-scores
   * Obtener todos los scores
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todos los scores de madurez' })
  @ApiResponse({
    status: 200,
    description: 'Lista de scores obtenida exitosamente',
  })
  async getAll() {
    return await this.userMaturityScoresService.getAll();
  }

  /**
   * GET /user-maturity-scores/stats
   * Obtener estadísticas globales
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener estadísticas globales de madurez' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        totalUsers: 150,
        averageScores: {
          ideaValidation: 72,
          userExperience: 68,
          marketFit: 55,
          monetization: 48,
          total: 60,
        },
      },
    },
  })
  async getGlobalStats() {
    return await this.userMaturityScoresService.getGlobalStats();
  }

  /**
   * GET /user-maturity-scores/:id
   * Obtener un score por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener un score por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del score (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Score encontrado',
  })
  @ApiResponse({ status: 404, description: 'Score no encontrado' })
  async getById(@Param('id') id: string) {
    return await this.userMaturityScoresService.getById(id);
  }

  /**
   * GET /user-maturity-scores/user/:userId
   * Obtener todos los scores de un usuario (histórico)
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener histórico de scores de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de scores obtenido exitosamente',
  })
  async getByUserId(@Param('userId') userId: string) {
    return await this.userMaturityScoresService.getByUserId(userId);
  }

  /**
   * GET /user-maturity-scores/user/:userId/latest
   * Obtener el score más reciente de un usuario
   */
  @Get('user/:userId/latest')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener el score más reciente de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Score más reciente obtenido exitosamente',
  })
  async getLatestByUserId(@Param('userId') userId: string) {
    return await this.userMaturityScoresService.getLatestByUserId(userId);
  }

  /**
   * GET /user-maturity-scores/user/:userId/average
   * Obtener el score promedio de un usuario
   */
  @Get('user/:userId/average')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener el score promedio de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Score promedio obtenido exitosamente',
    schema: {
      example: {
        ideaValidation: 72,
        userExperience: 68,
        marketFit: 55,
        monetization: 48,
        totalAverage: 60,
      },
    },
  })
  async getAverageByUserId(@Param('userId') userId: string) {
    return await this.userMaturityScoresService.getAverageByUserId(userId);
  }

  /**
   * GET /user-maturity-scores/user/:userId/evolution
   * Obtener la evolución de scores de un usuario
   */
  @Get('user/:userId/evolution')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener la evolución de scores de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Evolución de scores obtenida exitosamente',
    schema: {
      example: {
        scores: [
          /* array de scores */
        ],
        trend: {
          ideaValidation: 'up',
          userExperience: 'stable',
          marketFit: 'down',
          monetization: 'up',
          total: 'stable',
        },
      },
    },
  })
  async getEvolutionByUserId(@Param('userId') userId: string) {
    return await this.userMaturityScoresService.getEvolutionByUserId(userId);
  }

  /**
   * PATCH /user-maturity-scores/:id
   * Actualizar un score
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un score de madurez' })
  @ApiParam({
    name: 'id',
    description: 'ID del score (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Score actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Score no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserMaturityScoreDto,
  ) {
    return await this.userMaturityScoresService.update(id, updateDto);
  }

  /**
   * DELETE /user-maturity-scores/:id
   * Eliminar un score
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un score de madurez' })
  @ApiParam({
    name: 'id',
    description: 'ID del score (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Score eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Score no encontrado' })
  async delete(@Param('id') id: string) {
    return await this.userMaturityScoresService.delete(id);
  }
}
