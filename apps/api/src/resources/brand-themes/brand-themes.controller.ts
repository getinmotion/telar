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
import { BrandThemesService } from './brand-themes.service';
import { CreateBrandThemeDto } from './dto/create-brand-theme.dto';
import { UpdateBrandThemeDto } from './dto/update-brand-theme.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('brand-themes')
@Controller('brand-themes')
export class BrandThemesController {
  constructor(private readonly brandThemesService: BrandThemesService) {}

  /**
   * POST /brand-themes
   * Crear un nuevo tema de marca
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo tema de marca' })
  @ApiResponse({
    status: 201,
    description: 'Tema creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El tema ya existe' })
  async create(@Body() createDto: CreateBrandThemeDto) {
    return await this.brandThemesService.create(createDto);
  }

  /**
   * GET /brand-themes
   * Obtener todos los temas
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los temas de marca' })
  @ApiResponse({
    status: 200,
    description: 'Lista de temas obtenida exitosamente',
  })
  async getAll() {
    return await this.brandThemesService.getAll();
  }

  /**
   * GET /brand-themes/active
   * Obtener temas activos
   */
  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener temas activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de temas activos obtenida exitosamente',
  })
  async getActive() {
    return await this.brandThemesService.getActive();
  }

  /**
   * GET /brand-themes/user/:userId
   * Obtener temas por usuario
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener temas de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de temas del usuario obtenida exitosamente',
  })
  async getByUserId(@Param('userId') userId: string) {
    return await this.brandThemesService.getByUserId(userId);
  }

  /**
   * GET /brand-themes/theme/:themeId
   * Obtener un tema por themeId
   */
  @Get('theme/:themeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un tema por themeId' })
  @ApiParam({
    name: 'themeId',
    description: 'ID único del tema',
    example: 'theme-ocean-blue-2024',
  })
  @ApiResponse({
    status: 200,
    description: 'Tema encontrado',
  })
  @ApiResponse({ status: 404, description: 'Tema no encontrado' })
  async getByThemeId(@Param('themeId') themeId: string) {
    return await this.brandThemesService.getByThemeId(themeId);
  }

  /**
   * GET /brand-themes/:id
   * Obtener un tema por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un tema por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del tema (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tema encontrado',
  })
  @ApiResponse({ status: 404, description: 'Tema no encontrado' })
  async getById(@Param('id') id: string) {
    return await this.brandThemesService.getById(id);
  }

  /**
   * PATCH /brand-themes/:id
   * Actualizar un tema
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un tema' })
  @ApiParam({
    name: 'id',
    description: 'ID del tema (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tema actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tema no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBrandThemeDto,
  ) {
    return await this.brandThemesService.update(id, updateDto);
  }

  /**
   * DELETE /brand-themes/:id
   * Eliminar un tema
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un tema' })
  @ApiParam({
    name: 'id',
    description: 'ID del tema (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tema eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Tema no encontrado' })
  async delete(@Param('id') id: string) {
    return await this.brandThemesService.delete(id);
  }
}
