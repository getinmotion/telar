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
import { ArtisanShopsService } from './artisan-shops.service';
import { CreateArtisanShopDto } from './dto/create-artisan-shop.dto';
import { UpdateArtisanShopDto } from './dto/update-artisan-shop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('artisan-shops')
@Controller('artisan-shops')
export class ArtisanShopsController {
  constructor(private readonly artisanShopsService: ArtisanShopsService) {}

  /**
   * POST /artisan-shops
   * Crear una nueva tienda de artesano
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear una nueva tienda de artesano' })
  @ApiResponse({
    status: 201,
    description: 'Tienda creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 409,
    description: 'El slug ya existe o el usuario ya tiene una tienda',
  })
  async create(@Body() createDto: CreateArtisanShopDto) {
    return await this.artisanShopsService.create(createDto);
  }

  /**
   * GET /artisan-shops
   * Obtener todas las tiendas
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todas las tiendas de artesanos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tiendas obtenida exitosamente',
  })
  async getAll() {
    return await this.artisanShopsService.getAll();
  }

  /**
   * GET /artisan-shops/active
   * Obtener tiendas activas
   */
  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener tiendas activas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tiendas activas obtenida exitosamente',
  })
  async getActive() {
    return await this.artisanShopsService.getActive();
  }

  /**
   * GET /artisan-shops/featured
   * Obtener tiendas destacadas
   */
  @Get('featured')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener tiendas destacadas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tiendas destacadas obtenida exitosamente',
  })
  async getFeatured() {
    return await this.artisanShopsService.getFeatured();
  }

  /**
   * GET /artisan-shops/completed-profile
   * Obtener tiendas con perfil completo
   */
  @Get('completed-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener tiendas con perfil de artesano completo' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tiendas con perfil completo obtenida exitosamente',
  })
  async getWithCompletedProfile() {
    return await this.artisanShopsService.getWithCompletedProfile();
  }

  /**
   * GET /artisan-shops/user/:userId
   * Obtener tienda por usuario (relación 1:1)
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener tienda de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tienda del usuario obtenida exitosamente (puede ser null)',
  })
  async getByUserId(@Param('userId') userId: string) {
    return await this.artisanShopsService.getByUserId(userId);
  }

  /**
   * GET /artisan-shops/slug/:slug
   * Obtener tienda por slug
   */
  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener tienda por slug (URL amigable)' })
  @ApiParam({
    name: 'slug',
    description: 'Slug único de la tienda',
    example: 'artesanias-del-valle',
  })
  @ApiResponse({
    status: 200,
    description: 'Tienda encontrada',
  })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async getBySlug(@Param('slug') slug: string) {
    return await this.artisanShopsService.getBySlug(slug);
  }

  /**
   * GET /artisan-shops/department/:department
   * Obtener tiendas por departamento
   */
  @Get('department/:department')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener tiendas por departamento' })
  @ApiParam({
    name: 'department',
    description: 'Nombre del departamento',
    example: 'Valle del Cauca',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tiendas del departamento obtenida exitosamente',
  })
  async getByDepartment(@Param('department') department: string) {
    return await this.artisanShopsService.getByDepartment(department);
  }

  /**
   * GET /artisan-shops/municipality/:municipality
   * Obtener tiendas por municipio
   */
  @Get('municipality/:municipality')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener tiendas por municipio' })
  @ApiParam({
    name: 'municipality',
    description: 'Nombre del municipio',
    example: 'Cali',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tiendas del municipio obtenida exitosamente',
  })
  async getByMunicipality(@Param('municipality') municipality: string) {
    return await this.artisanShopsService.getByMunicipality(municipality);
  }

  /**
   * GET /artisan-shops/:id
   * Obtener una tienda por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una tienda por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la tienda (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tienda encontrada',
  })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async getById(@Param('id') id: string) {
    return await this.artisanShopsService.getById(id);
  }

  /**
   * PATCH /artisan-shops/:id
   * Actualizar una tienda
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar una tienda' })
  @ApiParam({
    name: 'id',
    description: 'ID de la tienda (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tienda actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateArtisanShopDto,
  ) {
    return await this.artisanShopsService.update(id, updateDto);
  }

  /**
   * DELETE /artisan-shops/:id
   * Eliminar una tienda
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar una tienda' })
  @ApiParam({
    name: 'id',
    description: 'ID de la tienda (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tienda eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async delete(@Param('id') id: string) {
    return await this.artisanShopsService.delete(id);
  }
}
