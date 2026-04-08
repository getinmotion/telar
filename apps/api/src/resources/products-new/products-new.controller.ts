import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { ProductsNewService } from './products-new.service';
import { ProductsNewAnalyticsService } from './products-new-analytics.service';
import { CreateProductsNewDto } from './dto/create-products-new.dto';
import { UpdateProductsNewDto } from './dto/update-products-new.dto';
import { CreateProductStep1Dto } from './dto/create-product-step1.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('products-new')
@Controller('products-new')
export class ProductsNewController {
  constructor(
    private readonly productsNewService: ProductsNewService,
    private readonly analyticsService: ProductsNewAnalyticsService,
  ) {}

  /**
   * POST /products-new
   * Crear o actualizar producto (Upsert)
   * - Si existe un producto en 'draft' para el storeId -> UPDATE
   * - Si no existe -> CREATE
   * Soporta creación incremental por steps
   */
  @Post()
  create(@Body() createProductsNewDto: CreateProductsNewDto) {
    return this.productsNewService.create(createProductsNewDto);
  }

  /**
   * POST /products-new/step1
   * Endpoint específico para el Step 1 del formulario
   * Crea o actualiza ProductCore + ProductMedia
   */
  @Post('step1')
  createStep1(@Body() createProductStep1Dto: CreateProductStep1Dto) {
    // Convertir a CreateProductsNewDto para usar el mismo servicio
    return this.productsNewService.create(createProductStep1Dto as any);
  }

  /**
   * GET /products-new/analytics
   * Panel de analytics global de productos migrados
   */
  @Get('analytics')
  @ApiOperation({ summary: 'Analytics global de productos migrados' })
  @ApiResponse({ status: 200, description: 'Analytics obtenidos exitosamente' })
  getAnalytics() {
    return this.analyticsService.getAnalytics();
  }

  /**
   * GET /products-new
   * Obtener todos los productos con sus capas y relaciones
   * Query params opcionales: page, limit, storeId, categoryId, status
   */
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('storeId') storeId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
  ) {
    // Si se especifican parámetros de paginación, usar método paginado
    if (page || limit || storeId || categoryId || status) {
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 20;

      return this.productsNewService.findWithPagination(pageNum, limitNum, {
        storeId,
        categoryId,
        status,
      });
    }

    // De lo contrario, obtener todos
    return this.productsNewService.findAll();
  }

 

    /**
   * GET /products-new/store/:storeId
   * Obtener productos de una tienda específica
   */
  @Get('store/:storeId')
  findByStoreId(@Param('storeId') storeId: string) {
    return this.productsNewService.findByStoreId(storeId);
  }

  /**
   * GET /products-new/user/:userId
   * Obtener productos de un usuario específico (artesano)
   * Busca productos cuyo artisan_shop pertenezca al userId especificado
   */
  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.productsNewService.findByUserId(userId);
  }

  /**
   * GET /products-new/category/:categoryId
   * Obtener productos de una categoría específica
   */
  @Get('category/:categoryId')
  findByCategoryId(@Param('categoryId') categoryId: string) {
    return this.productsNewService.findByCategoryId(categoryId);
  }

  /**
   * GET /products-new/status/:status
   * Obtener productos por status (draft, published, archived)
   */
  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.productsNewService.findByStatus(status);
  }

  /**
   * GET /products-new/legacy/:legacyId
   * Obtener un producto por su legacy_product_id (ID de shop.products legacy)
   */
  @Get('legacy/:legacyId')
  findByLegacyId(@Param('legacyId') legacyId: string) {
    return this.productsNewService.findByLegacyId(legacyId);
  }

  /**
   * GET /products-new/marketplace
   * Obtener productos para marketplace (solo aprobados y publicados)
   */
  @Get('marketplace')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener productos para marketplace',
    description:
      'Endpoint para marketplace. ' +
      'Incluye solo productos aprobados de tiendas publicadas y aprobadas para marketplace',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos de marketplace obtenida exitosamente',
  })
  async getMarketplaceProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('featured') featured?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    const featuredBool = featured === 'true' ? true : undefined;

    return await this.productsNewService.getMarketplaceProducts({
      page: pageNum,
      limit: limitNum,
      categoryId,
      featured: featuredBool,
      sortBy,
      order,
    });
  }

  /**
   * GET /products-new/marketplace/featured
   * Obtener productos destacados para marketplace
   */
  @Get('marketplace/featured')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener productos destacados para marketplace',
    description: 'Productos destacados aprobados para marketplace',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos destacados obtenida exitosamente',
  })
  async getMarketplaceFeaturedProducts() {
    return await this.productsNewService.getMarketplaceFeaturedProducts();
  }

  /**
   * GET /products-new/marketplace/shop/:shopId
   * Obtener productos de una tienda para marketplace
   */
  @Get('marketplace/shop/:shopId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener productos de una tienda para marketplace',
    description: 'Productos aprobados de una tienda específica',
  })
  @ApiParam({ name: 'shopId', description: 'ID de la tienda' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos de la tienda obtenida exitosamente',
  })
  async getMarketplaceProductsByShop(@Param('shopId') shopId: string) {
    return await this.productsNewService.getMarketplaceProductsByShop(shopId);
  }

   /**
   * GET /products-new/store/:storeId
   * Obtener productos de una tienda específica
   */
  @Get('marketplace/store/:storeId')
  findByStoreIdForMarketplace(@Param('storeId') storeId: string) {
    return this.productsNewService.findByStoreIdForMarketplace(storeId);
  }

  /**
   * GET /products-new/marketplace/user/:userId
   * Obtener productos de un usuario para marketplace
   */
  @Get('marketplace/user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener productos de un usuario para marketplace',
    description: 'Productos aprobados del usuario (a través de su tienda)',
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos del usuario obtenida exitosamente',
  })
  async getMarketplaceProductsByUser(@Param('userId') userId: string) {
    return await this.productsNewService.getMarketplaceProductsByUser(userId);
  }

  /**
   * GET /products-new/marketplace/:id
   * Obtener un producto individual para marketplace
   */
  @Get('marketplace/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un producto para marketplace',
    description: 'Producto individual aprobado para marketplace',
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({
    status: 200,
    description: 'Producto obtenido exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async getMarketplaceProductById(@Param('id') id: string) {
    return await this.productsNewService.getMarketplaceProductById(id);
  }

  /**
   * GET /products-new/:id
   * Obtener un producto por ID con todas sus capas y relaciones
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsNewService.findOne(id);
  }

  /**
   * PATCH /products-new/:id
   * Actualizar un producto
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductsNewDto: UpdateProductsNewDto,
  ) {
    return this.productsNewService.update(id, updateProductsNewDto);
  }

  /**
   * PATCH /products-new/:id/status
   * Cambiar el status de un producto
   */
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.productsNewService.updateStatus(id, status);
  }

  /**
   * DELETE /products-new/:id
   * Soft delete de un producto
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsNewService.remove(id);
  }
}
