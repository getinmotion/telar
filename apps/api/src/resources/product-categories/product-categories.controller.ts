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
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('product-categories')
@Controller('product-categories')
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
  ) {}

  /**
   * POST /product-categories
   * Crear una nueva categoría
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear una nueva categoría de producto' })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El slug ya existe' })
  async create(@Body() createDto: CreateProductCategoryDto) {
    return await this.productCategoriesService.create(createDto);
  }

  /**
   * GET /product-categories
   * Obtener todas las categorías
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todas las categorías de productos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías obtenida exitosamente',
  })
  async getAll() {
    return await this.productCategoriesService.getAll();
  }

  /**
   * GET /product-categories/tree
   * Obtener árbol jerárquico de categorías
   */
  @Get('tree')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener árbol jerárquico de categorías' })
  @ApiResponse({
    status: 200,
    description: 'Árbol de categorías obtenido exitosamente',
  })
  async getCategoryTree() {
    return await this.productCategoriesService.getCategoryTree();
  }

  /**
   * GET /product-categories/root
   * Obtener categorías raíz (sin padre)
   */
  @Get('root')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener categorías raíz (sin padre)' })
  @ApiResponse({
    status: 200,
    description: 'Categorías raíz obtenidas exitosamente',
  })
  async getRootCategories() {
    return await this.productCategoriesService.getRootCategories();
  }

  /**
   * GET /product-categories/active
   * Obtener categorías activas
   */
  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener categorías activas' })
  @ApiResponse({
    status: 200,
    description: 'Categorías activas obtenidas exitosamente',
  })
  async getActive() {
    return await this.productCategoriesService.getActive();
  }

  /**
   * GET /product-categories/slug/:slug
   * Obtener una categoría por slug
   */
  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una categoría por slug' })
  @ApiParam({
    name: 'slug',
    description: 'Slug único de la categoría',
    example: 'ceramica',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría encontrada',
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async getBySlug(@Param('slug') slug: string) {
    return await this.productCategoriesService.getBySlug(slug);
  }

  /**
   * GET /product-categories/:id/children
   * Obtener subcategorías de una categoría
   */
  @Get(':id/children')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener subcategorías de una categoría' })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría padre (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Subcategorías obtenidas exitosamente',
  })
  async getChildren(@Param('id') id: string) {
    return await this.productCategoriesService.getChildren(id);
  }

  /**
   * GET /product-categories/:id
   * Obtener una categoría por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría encontrada',
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async getById(@Param('id') id: string) {
    return await this.productCategoriesService.getById(id);
  }

  /**
   * PATCH /product-categories/:id
   * Actualizar una categoría
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar una categoría' })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductCategoryDto,
  ) {
    return await this.productCategoriesService.update(id, updateDto);
  }

  /**
   * DELETE /product-categories/:id
   * Eliminar una categoría
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar una categoría' })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría eliminada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'La categoría tiene subcategorías o productos',
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async delete(@Param('id') id: string) {
    return await this.productCategoriesService.delete(id);
  }
}
