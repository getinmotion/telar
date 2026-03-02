import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductModerationHistoryService } from './product-moderation-history.service';
import { CreateProductModerationHistoryDto } from './dto/create-product-moderation-history.dto';
import { UpdateProductModerationHistoryDto } from './dto/update-product-moderation-history.dto';
import { ProductModerationHistory } from './entities/product-moderation-history.entity';

@ApiTags('product-moderation-history')
@Controller('product-moderation-history')
export class ProductModerationHistoryController {
  constructor(
    private readonly productModerationHistoryService: ProductModerationHistoryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo registro de historial de moderación',
    description:
      'Crea un nuevo registro en el historial de moderación de productos',
  })
  @ApiResponse({
    status: 201,
    description: 'Registro creado exitosamente',
    type: ProductModerationHistory,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(
    @Body() createDto: CreateProductModerationHistoryDto,
  ): Promise<ProductModerationHistory> {
    return this.productModerationHistoryService.create(createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los registros de historial de moderación',
    description:
      'Retorna todos los registros de historial de moderación ordenados por fecha',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros de historial',
    type: [ProductModerationHistory],
  })
  async findAll(): Promise<ProductModerationHistory[]> {
    return this.productModerationHistoryService.findAll();
  }

  @Get('product/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener historial de moderación de un producto',
    description:
      'Retorna todos los registros de moderación de un producto específico',
  })
  @ApiParam({
    name: 'productId',
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros del producto',
    type: [ProductModerationHistory],
  })
  @ApiResponse({ status: 400, description: 'productId inválido' })
  async findByProductId(
    @Param('productId') productId: string,
  ): Promise<ProductModerationHistory[]> {
    return this.productModerationHistoryService.findByProductId(productId);
  }

  @Get('moderator/:moderatorId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener historial de moderación por moderador',
    description:
      'Retorna todos los registros de moderación realizados por un moderador',
  })
  @ApiParam({
    name: 'moderatorId',
    description: 'ID del moderador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros del moderador',
    type: [ProductModerationHistory],
  })
  @ApiResponse({ status: 400, description: 'moderatorId inválido' })
  async findByModeratorId(
    @Param('moderatorId') moderatorId: string,
  ): Promise<ProductModerationHistory[]> {
    return this.productModerationHistoryService.findByModeratorId(moderatorId);
  }

  @Get('artisan/:artisanId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener historial de moderación por artesano',
    description:
      'Retorna todos los registros de moderación de productos de un artesano',
  })
  @ApiParam({
    name: 'artisanId',
    description: 'ID del artesano',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros del artesano',
    type: [ProductModerationHistory],
  })
  @ApiResponse({ status: 400, description: 'artisanId inválido' })
  async findByArtisanId(
    @Param('artisanId') artisanId: string,
  ): Promise<ProductModerationHistory[]> {
    return this.productModerationHistoryService.findByArtisanId(artisanId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un registro por ID',
    description: 'Retorna un registro específico de historial de moderación',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro encontrado',
    type: ProductModerationHistory,
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async findOne(@Param('id') id: string): Promise<ProductModerationHistory> {
    return this.productModerationHistoryService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar un registro',
    description:
      'Actualiza parcialmente un registro de historial de moderación',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro actualizado exitosamente',
    type: ProductModerationHistory,
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductModerationHistoryDto,
  ): Promise<ProductModerationHistory> {
    return this.productModerationHistoryService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un registro',
    description:
      'Elimina permanentemente un registro de historial de moderación',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Registro eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productModerationHistoryService.remove(id);
  }
}
