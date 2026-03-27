import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsNewService } from './products-new.service';
import { CreateProductsNewDto } from './dto/create-products-new.dto';
import { UpdateProductsNewDto } from './dto/update-products-new.dto';

@Controller('products-new')
export class ProductsNewController {
  constructor(private readonly productsNewService: ProductsNewService) {}

  @Post()
  create(@Body() createProductsNewDto: CreateProductsNewDto) {
    return this.productsNewService.create(createProductsNewDto);
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
