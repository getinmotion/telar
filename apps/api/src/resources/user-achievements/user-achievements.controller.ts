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
import { UserAchievementsService } from './user-achievements.service';
import { CreateUserAchievementDto } from './dto/create-user-achievement.dto';
import { UpdateUserAchievementDto } from './dto/update-user-achievement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('user-achievements')
@Controller('user-achievements')
export class UserAchievementsController {
  constructor(
    private readonly userAchievementsService: UserAchievementsService,
  ) {}

  /**
   * POST /user-achievements
   * Crear un nuevo logro de usuario
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo logro de usuario' })
  @ApiResponse({
    status: 201,
    description: 'Logro creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El usuario ya tiene este logro' })
  async create(@Body() createUserAchievementDto: CreateUserAchievementDto) {
    return await this.userAchievementsService.create(createUserAchievementDto);
  }

  /**
   * GET /user-achievements
   * Obtener todos los logros
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todos los logros de usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de logros obtenida exitosamente',
  })
  async getAll() {
    return await this.userAchievementsService.getAll();
  }

  /**
   * GET /user-achievements/user/:userId
   * Obtener logros por usuario
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener logros por usuario',
    description: 'Obtiene todos los logros desbloqueados por un usuario',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Logros del usuario obtenidos exitosamente',
  })
  @ApiResponse({ status: 400, description: 'ID de usuario inválido' })
  async getByUserId(@Param('userId') userId: string) {
    return await this.userAchievementsService.getByUserId(userId);
  }

  /**
   * GET /user-achievements/achievement/:achievementId
   * Obtener usuarios por logro
   */
  @Get('achievement/:achievementId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener usuarios por logro',
    description: 'Obtiene todos los usuarios que han desbloqueado un logro específico',
  })
  @ApiParam({
    name: 'achievementId',
    description: 'ID del logro',
    example: 'first_product_created',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuarios con el logro obtenidos exitosamente',
  })
  @ApiResponse({ status: 400, description: 'ID de logro inválido' })
  async getByAchievementId(@Param('achievementId') achievementId: string) {
    return await this.userAchievementsService.getByAchievementId(achievementId);
  }

  /**
   * GET /user-achievements/check/:userId/:achievementId
   * Verificar si un usuario tiene un logro
   */
  @Get('check/:userId/:achievementId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Verificar si un usuario tiene un logro',
    description: 'Verifica si un usuario específico ha desbloqueado un logro específico',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'achievementId',
    description: 'ID del logro',
    example: 'first_product_created',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la verificación',
    schema: {
      type: 'object',
      properties: {
        hasAchievement: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  async checkAchievement(
    @Param('userId') userId: string,
    @Param('achievementId') achievementId: string,
  ) {
    const hasAchievement = await this.userAchievementsService.hasAchievement(
      userId,
      achievementId,
    );
    return { hasAchievement };
  }

  /**
   * GET /user-achievements/:id
   * Obtener un logro por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener un logro por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del logro (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Logro encontrado',
  })
  @ApiResponse({ status: 404, description: 'Logro no encontrado' })
  async getById(@Param('id') id: string) {
    return await this.userAchievementsService.getById(id);
  }

  /**
   * PATCH /user-achievements/:id
   * Actualizar un logro
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un logro' })
  @ApiParam({
    name: 'id',
    description: 'ID del logro (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Logro actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Logro no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateUserAchievementDto: UpdateUserAchievementDto,
  ) {
    return await this.userAchievementsService.update(
      id,
      updateUserAchievementDto,
    );
  }

  /**
   * DELETE /user-achievements/:id
   * Eliminar un logro
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un logro' })
  @ApiParam({
    name: 'id',
    description: 'ID del logro (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Logro eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Logro no encontrado' })
  async delete(@Param('id') id: string) {
    return await this.userAchievementsService.delete(id);
  }
}
