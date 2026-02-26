import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * POST /products
   * Crear un nuevo producto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El SKU ya existe' })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  /**
   * GET /products
   * Obtener todos los productos
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los productos con filtros y paginación',
    description:
      'Endpoint para obtener productos con soporte de paginación, filtros múltiples, búsqueda y ordenamiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        total: {
          type: 'number',
          example: 150,
        },
        page: {
          type: 'number',
          example: 1,
        },
        limit: {
          type: 'number',
          example: 20,
        },
      },
    },
  })
  async getAll(@Query() query: ProductsQueryDto) {
    return await this.productsService.getAll(query);
  }

  /**
   * GET /products/marketplace
   * Obtener productos para marketplace (replica marketplace_products view)
   */
  @Get('marketplace')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener productos para marketplace',
    description:
      'Endpoint que replica la vista marketplace_products. ' +
      'Incluye cálculos de stock, rating, reviews y filtra solo productos aprobados de tiendas publicadas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos de marketplace obtenida exitosamente',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        total: {
          type: 'number',
          example: 150,
        },
        page: {
          type: 'number',
          example: 1,
        },
        limit: {
          type: 'number',
          example: 20,
        },
      },
    },
  })
  async getMarketplaceProducts(@Query() query: ProductsQueryDto) {
    return await this.productsService.getMarketplaceProducts(query);
  }

  /**
   * GET /products/marketplace/featured
   * Obtener productos destacados enriquecidos para marketplace
   */
  @Get('marketplace/featured')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener productos destacados para marketplace',
    description: 'Productos destacados con datos enriquecidos (stock, rating, reviews)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos destacados obtenida exitosamente',
  })
  async getMarketplaceFeaturedProducts() {
    return await this.productsService.getMarketplaceFeaturedProducts();
  }

  /**
   * GET /products/marketplace/shop/:shopId
   * Obtener productos de una tienda enriquecidos para marketplace
   */
  @Get('marketplace/shop/:shopId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener productos de una tienda para marketplace',
    description: 'Productos de una tienda específica con datos enriquecidos',
  })
  @ApiParam({ name: 'shopId', description: 'ID de la tienda' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos de la tienda obtenida exitosamente',
  })
  async getMarketplaceProductsByShop(@Param('shopId') shopId: string) {
    return await this.productsService.getMarketplaceProductsByShop(shopId);
  }

  /**
   * GET /products/marketplace/:id
   * Obtener un producto individual enriquecido para marketplace
   */
  @Get('marketplace/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un producto para marketplace',
    description: 'Producto individual con datos enriquecidos (stock, rating, reviews)',
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({
    status: 200,
    description: 'Producto obtenido exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async getMarketplaceProductById(@Param('id') id: string) {
    return await this.productsService.getMarketplaceProductById(id);
  }

  /**
   * GET /products/marketplace/user/:userId
   * Obtener productos de un usuario enriquecidos para marketplace
   */
  @Get('marketplace/user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener productos de un usuario para marketplace',
    description:
      'Productos de un usuario (a través de su tienda) con datos enriquecidos',
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos del usuario obtenida exitosamente',
  })
  async getMarketplaceProductsByUser(@Param('userId') userId: string) {
    return await this.productsService.getMarketplaceProductsByUser(userId);
  }

  /**
   * GET /products/active
   * Obtener productos activos
   */
  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener productos activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos activos obtenida exitosamente',
  })
  async getActiveProducts() {
    return await this.productsService.getActiveProducts();
  }

  /**
   * GET /products/featured
   * Obtener productos destacados
   */
  @Get('featured')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener productos destacados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos destacados obtenida exitosamente',
  })
  async getFeaturedProducts() {
    return await this.productsService.getFeaturedProducts();
  }

  /**
   * GET /products/shop/:shopId/approved-count
   * Contar productos aprobados de una tienda
   */
  @Get('shop/:shopId/approved-count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Contar productos aprobados de una tienda',
    description:
      'Retorna el número de productos con moderation_status "approved" o "approved_with_edits" de una tienda',
  })
  @ApiParam({
    name: 'shopId',
    description: 'ID de la tienda (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Cantidad de productos aprobados',
    schema: {
      example: { count: 15 },
    },
  })
  @ApiResponse({ status: 400, description: 'ID de tienda inválido' })
  async countApprovedByShopId(
    @Param('shopId') shopId: string,
  ): Promise<{ count: number }> {
    const count = await this.productsService.countApprovedByShopId(shopId);
    return { count };
  }

  /**
   * GET /products/shop/:shopId
   * Obtener productos por tienda
   */
  @Get('shop/:shopId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener productos por tienda' })
  @ApiParam({
    name: 'shopId',
    description: 'ID de la tienda (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Productos de la tienda obtenidos exitosamente',
  })
  @ApiResponse({ status: 400, description: 'ID de tienda inválido' })
  async getByShopId(@Param('shopId') shopId: string) {
    return await this.productsService.getByShopId(shopId);
  }

  /**
   * GET /products/user/:userId
   * Obtener productos por usuario (a través de artisan_shop)
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener productos por usuario',
    description:
      'Obtiene todos los productos de las tiendas del usuario especificado',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Productos del usuario obtenidos exitosamente',
  })
  @ApiResponse({ status: 400, description: 'ID de usuario inválido' })
  async getByUserId(@Param('userId') userId: string) {
    return await this.productsService.getByUserId(userId);
  }

  /**
   * GET /products/:id
   * Obtener un producto por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del producto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado',
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async getById(@Param('id') id: string) {
    return await this.productsService.getById(id);
  }

  /**
   * PATCH /products/:id
   * Actualizar un producto
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiParam({
    name: 'id',
    description: 'ID del producto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 409, description: 'El SKU ya existe' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(id, updateProductDto);
  }

  /**
   * DELETE /products/:id
   * Eliminar un producto
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiParam({
    name: 'id',
    description: 'ID del producto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async delete(@Param('id') id: string) {
    return await this.productsService.delete(id);
  }
}
