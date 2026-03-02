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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { QueryProductVariantDto } from './dto/query-product-variant.dto';
import { ProductVariant, VariantStatus } from './entities/product-variant.entity';

@ApiTags('product-variants')
@Controller('product-variants')
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva variante de producto' })
  @ApiResponse({
    status: 201,
    description: 'Variante creada exitosamente',
    type: ProductVariant,
  })
  @ApiResponse({ status: 409, description: 'SKU ya existe' })
  create(
    @Body() createDto: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    return this.productVariantsService.create(createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todas las variantes con filtros y paginación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de variantes',
    type: [ProductVariant],
  })
  findAll(@Query() queryDto: QueryProductVariantDto) {
    return this.productVariantsService.findAll(queryDto);
  }

  @Get('low-stock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener variantes con stock bajo' })
  @ApiResponse({
    status: 200,
    description: 'Lista de variantes con stock bajo',
    type: [ProductVariant],
  })
  findLowStock(): Promise<ProductVariant[]> {
    return this.productVariantsService.findLowStock();
  }

  @Get('sku/:sku')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una variante por SKU' })
  @ApiParam({ name: 'sku', description: 'SKU de la variante' })
  @ApiResponse({
    status: 200,
    description: 'Variante encontrada',
    type: ProductVariant,
  })
  @ApiResponse({ status: 404, description: 'Variante no encontrada' })
  findBySku(@Param('sku') sku: string): Promise<ProductVariant> {
    return this.productVariantsService.findBySku(sku);
  }

  @Get('product/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todas las variantes de un producto' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiResponse({
    status: 200,
    description: 'Lista de variantes del producto',
    type: [ProductVariant],
  })
  findByProductId(
    @Param('productId') productId: string,
  ): Promise<ProductVariant[]> {
    return this.productVariantsService.findByProductId(productId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una variante por ID' })
  @ApiParam({ name: 'id', description: 'ID de la variante' })
  @ApiResponse({
    status: 200,
    description: 'Variante encontrada',
    type: ProductVariant,
  })
  @ApiResponse({ status: 404, description: 'Variante no encontrada' })
  findOne(@Param('id') id: string): Promise<ProductVariant> {
    return this.productVariantsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una variante' })
  @ApiParam({ name: 'id', description: 'ID de la variante' })
  @ApiResponse({
    status: 200,
    description: 'Variante actualizada',
    type: ProductVariant,
  })
  @ApiResponse({ status: 404, description: 'Variante no encontrada' })
  @ApiResponse({ status: 409, description: 'SKU ya existe' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    return this.productVariantsService.update(id, updateDto);
  }

  @Patch(':id/stock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar stock de una variante' })
  @ApiParam({ name: 'id', description: 'ID de la variante' })
  @ApiQuery({
    name: 'quantity',
    description: 'Cantidad a agregar/restar/establecer',
    example: 10,
  })
  @ApiQuery({
    name: 'operation',
    description: 'Operación a realizar: add, subtract, set',
    enum: ['add', 'subtract', 'set'],
    example: 'add',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock actualizado',
    type: ProductVariant,
  })
  updateStock(
    @Param('id') id: string,
    @Query('quantity') quantity: number,
    @Query('operation') operation: 'add' | 'subtract' | 'set',
  ): Promise<ProductVariant> {
    return this.productVariantsService.updateStock(id, +quantity, operation);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar el estado de una variante' })
  @ApiParam({ name: 'id', description: 'ID de la variante' })
  @ApiQuery({
    name: 'status',
    description: 'Nuevo estado',
    enum: VariantStatus,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado',
    type: ProductVariant,
  })
  changeStatus(
    @Param('id') id: string,
    @Query('status') status: VariantStatus,
  ): Promise<ProductVariant> {
    return this.productVariantsService.changeStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar variante como discontinuada (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID de la variante' })
  @ApiResponse({
    status: 200,
    description: 'Variante marcada como discontinuada',
  })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.productVariantsService.remove(id);
  }

  @Delete(':id/hard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar permanentemente una variante (hard delete)' })
  @ApiParam({ name: 'id', description: 'ID de la variante' })
  @ApiResponse({
    status: 200,
    description: 'Variante eliminada permanentemente',
  })
  hardDelete(@Param('id') id: string): Promise<{ message: string }> {
    return this.productVariantsService.hardDelete(id);
  }
}
