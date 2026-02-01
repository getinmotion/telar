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
import { UserMaturityActionsService } from './user-maturity-actions.service';
import { CreateUserMaturityActionDto } from './dto/create-user-maturity-action.dto';
import { UpdateUserMaturityActionDto } from './dto/update-user-maturity-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('user-maturity-actions')
@Controller('user-maturity-actions')
export class UserMaturityActionsController {
  constructor(
    private readonly userMaturityActionsService: UserMaturityActionsService,
  ) {}

  /**
   * POST /user-maturity-actions
   * Crear una nueva acción de madurez
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Registrar una nueva acción de madurez' })
  @ApiResponse({
    status: 201,
    description: 'Acción registrada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createDto: CreateUserMaturityActionDto) {
    return await this.userMaturityActionsService.create(createDto);
  }

  /**
   * GET /user-maturity-actions
   * Obtener todas las acciones
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todas las acciones de madurez' })
  @ApiResponse({
    status: 200,
    description: 'Lista de acciones obtenida exitosamente',
  })
  async getAll() {
    return await this.userMaturityActionsService.getAll();
  }

  /**
   * GET /user-maturity-actions/category/:category
   * Obtener acciones por categoría
   */
  @Get('category/:category')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener acciones por categoría' })
  @ApiParam({
    name: 'category',
    description: 'Categoría de madurez',
    example: 'userExperience',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de acciones por categoría obtenida exitosamente',
  })
  async getByCategory(@Param('category') category: string) {
    return await this.userMaturityActionsService.getByCategory(category);
  }

  /**
   * GET /user-maturity-actions/action-type/:actionType
   * Obtener acciones por tipo de acción
   */
  @Get('action-type/:actionType')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener acciones por tipo de acción' })
  @ApiParam({
    name: 'actionType',
    description: 'Tipo de acción',
    example: 'task_completed',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de acciones por tipo obtenida exitosamente',
  })
  async getByActionType(@Param('actionType') actionType: string) {
    return await this.userMaturityActionsService.getByActionType(actionType);
  }

  /**
   * GET /user-maturity-actions/user/:userId
   * Obtener acciones de un usuario
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener acciones de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de acciones del usuario obtenida exitosamente',
  })
  async getByUserId(@Param('userId') userId: string) {
    return await this.userMaturityActionsService.getByUserId(userId);
  }

  /**
   * GET /user-maturity-actions/user/:userId/category/:category
   * Obtener acciones de un usuario por categoría
   */
  @Get('user/:userId/category/:category')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener acciones de un usuario por categoría' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'category',
    description: 'Categoría de madurez',
    example: 'userExperience',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de acciones del usuario por categoría obtenida exitosamente',
  })
  async getByUserIdAndCategory(
    @Param('userId') userId: string,
    @Param('category') category: string,
  ) {
    return await this.userMaturityActionsService.getByUserIdAndCategory(
      userId,
      category,
    );
  }

  /**
   * GET /user-maturity-actions/user/:userId/points
   * Obtener puntos totales de un usuario
   */
  @Get('user/:userId/points')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener puntos totales de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Puntos totales obtenidos exitosamente',
    schema: {
      example: { totalPoints: 450 },
    },
  })
  async getTotalPoints(@Param('userId') userId: string) {
    const totalPoints =
      await this.userMaturityActionsService.getTotalPointsByUserId(userId);
    return { totalPoints };
  }

  /**
   * GET /user-maturity-actions/user/:userId/points/category/:category
   * Obtener puntos de un usuario por categoría
   */
  @Get('user/:userId/points/category/:category')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener puntos de un usuario por categoría' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'category',
    description: 'Categoría de madurez',
    example: 'userExperience',
  })
  @ApiResponse({
    status: 200,
    description: 'Puntos por categoría obtenidos exitosamente',
    schema: {
      example: { category: 'userExperience', points: 120 },
    },
  })
  async getPointsByCategory(
    @Param('userId') userId: string,
    @Param('category') category: string,
  ) {
    const points =
      await this.userMaturityActionsService.getPointsByUserIdAndCategory(
        userId,
        category,
      );
    return { category, points };
  }

  /**
   * GET /user-maturity-actions/user/:userId/recent
   * Obtener acciones recientes de un usuario
   */
  @Get('user/:userId/recent')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener acciones recientes de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de acciones a retornar (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Acciones recientes obtenidas exitosamente',
  })
  async getRecentByUserId(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return await this.userMaturityActionsService.getRecentByUserId(
      userId,
      limitNumber,
    );
  }

  /**
   * GET /user-maturity-actions/:id
   * Obtener una acción por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener una acción por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la acción (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Acción encontrada',
  })
  @ApiResponse({ status: 404, description: 'Acción no encontrada' })
  async getById(@Param('id') id: string) {
    return await this.userMaturityActionsService.getById(id);
  }

  /**
   * PATCH /user-maturity-actions/:id
   * Actualizar una acción
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar una acción' })
  @ApiParam({
    name: 'id',
    description: 'ID de la acción (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Acción actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Acción no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserMaturityActionDto,
  ) {
    return await this.userMaturityActionsService.update(id, updateDto);
  }

  /**
   * DELETE /user-maturity-actions/:id
   * Eliminar una acción
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar una acción' })
  @ApiParam({
    name: 'id',
    description: 'ID de la acción (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Acción eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Acción no encontrada' })
  async delete(@Param('id') id: string) {
    return await this.userMaturityActionsService.delete(id);
  }
}
