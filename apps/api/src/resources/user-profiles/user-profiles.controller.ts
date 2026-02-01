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
import { UserProfilesService } from './user-profiles.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('user-profiles')
@Controller('user-profiles')
export class UserProfilesController {
  constructor(
    private readonly userProfilesService: UserProfilesService,
  ) {}

  /**
   * POST /user-profiles
   * Crear un nuevo perfil de usuario
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo perfil de usuario' })
  @ApiResponse({
    status: 201,
    description: 'Perfil de usuario creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un perfil para este usuario',
  })
  async create(@Body() createDto: CreateUserProfileDto) {
    return await this.userProfilesService.create(createDto);
  }

  /**
   * GET /user-profiles
   * Obtener todos los perfiles de usuario
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los perfiles de usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de perfiles obtenida exitosamente',
  })
  async getAll() {
    return await this.userProfilesService.getAll();
  }

  /**
   * GET /user-profiles/by-user/:userId
   * Obtener perfil de usuario por userId
   */
  @Get('by-user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener perfil de usuario por userId' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil encontrado',
  })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  async getByUserId(@Param('userId') userId: string) {
    return await this.userProfilesService.getByUserId(userId);
  }

  /**
   * GET /user-profiles/search/account-type
   * Buscar perfiles por tipo de cuenta
   */
  @Get('search/account-type')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar perfiles por tipo de cuenta' })
  @ApiQuery({
    name: 'type',
    description: 'Tipo de cuenta (buyer, seller, both)',
    example: 'seller',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfiles encontrados',
  })
  async findByAccountType(@Query('type') type: string) {
    return await this.userProfilesService.findByAccountType(type);
  }

  /**
   * GET /user-profiles/search/department
   * Buscar perfiles por departamento
   */
  @Get('search/department')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar perfiles por departamento' })
  @ApiQuery({
    name: 'department',
    description: 'Nombre del departamento',
    example: 'Cundinamarca',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfiles encontrados',
  })
  async findByDepartment(@Query('department') department: string) {
    return await this.userProfilesService.findByDepartment(department);
  }

  /**
   * GET /user-profiles/search/pending-rut
   * Obtener perfiles con RUT pendiente
   */
  @Get('search/pending-rut')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener perfiles con RUT pendiente' })
  @ApiResponse({
    status: 200,
    description: 'Perfiles con RUT pendiente obtenidos exitosamente',
  })
  async findWithPendingRut() {
    return await this.userProfilesService.findWithPendingRut();
  }

  /**
   * GET /user-profiles/:id
   * Obtener un perfil de usuario por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un perfil de usuario por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del perfil (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil encontrado',
  })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  async getById(@Param('id') id: string) {
    return await this.userProfilesService.getById(id);
  }

  /**
   * PATCH /user-profiles/:id
   * Actualizar un perfil de usuario
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un perfil de usuario' })
  @ApiParam({
    name: 'id',
    description: 'ID del perfil (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserProfileDto,
  ) {
    return await this.userProfilesService.update(id, updateDto);
  }

  /**
   * DELETE /user-profiles/:id
   * Eliminar un perfil de usuario
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un perfil de usuario' })
  @ApiParam({
    name: 'id',
    description: 'ID del perfil (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  async delete(@Param('id') id: string) {
    return await this.userProfilesService.delete(id);
  }
}

