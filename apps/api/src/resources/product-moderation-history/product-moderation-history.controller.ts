import {
  Controller,
  Get,
  Post,
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
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProductModerationHistoryService } from './product-moderation-history.service';
import { CreateProductModerationHistoryDto } from './dto/create-product-moderation-history.dto';
import { ProductModerationHistory } from './entities/product-moderation-history.entity';

/**
 * Historial de moderación de productos.
 *
 * Este recurso es un log de AUDITORÍA — es append-only por diseño.
 * No se exponen endpoints PATCH ni DELETE para preservar la integridad
 * del historial. Todas las operaciones requieren autenticación.
 */
@ApiTags('product-moderation-history')
@Controller('product-moderation-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ProductModerationHistoryController {
  constructor(
    private readonly productModerationHistoryService: ProductModerationHistoryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('moderator', 'admin')
  @ApiOperation({
    summary: 'Crear un nuevo registro de historial de moderación',
    description:
      'Crea un nuevo registro en el historial de moderación. Solo moderadores y admins.',
  })
  @ApiResponse({
    status: 201,
    description: 'Registro creado exitosamente',
    type: ProductModerationHistory,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos de moderador' })
  async create(
    @Body() createDto: CreateProductModerationHistoryDto,
  ): Promise<ProductModerationHistory> {
    return this.productModerationHistoryService.create(createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin')
  @ApiOperation({
    summary: 'Obtener todos los registros de historial de moderación',
    description:
      'Retorna todos los registros ordenados por fecha. Solo moderadores y admins.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros de historial',
    type: [ProductModerationHistory],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async findAll(): Promise<ProductModerationHistory[]> {
    return this.productModerationHistoryService.findAll();
  }

  @Get('product/:productId')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin')
  @ApiOperation({
    summary: 'Obtener historial de moderación de un producto',
    description:
      'Retorna todos los registros de moderación de un producto específico.',
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
  async findByProductId(
    @Param('productId') productId: string,
  ): Promise<ProductModerationHistory[]> {
    return this.productModerationHistoryService.findByProductId(productId);
  }

  @Get('moderator/:moderatorId')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin')
  @ApiOperation({
    summary: 'Obtener historial de moderación por moderador',
    description:
      'Retorna todos los registros de moderación realizados por un moderador.',
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
  async findByModeratorId(
    @Param('moderatorId') moderatorId: string,
  ): Promise<ProductModerationHistory[]> {
    return this.productModerationHistoryService.findByModeratorId(moderatorId);
  }

  @Get('artisan/:artisanId')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin')
  @ApiOperation({
    summary: 'Obtener historial de moderación por artesano',
    description:
      'Retorna todos los registros de moderación de productos de un artesano.',
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
  async findByArtisanId(
    @Param('artisanId') artisanId: string,
  ): Promise<ProductModerationHistory[]> {
    return this.productModerationHistoryService.findByArtisanId(artisanId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('moderator', 'admin')
  @ApiOperation({
    summary: 'Obtener un registro por ID',
    description: 'Retorna un registro específico de historial de moderación.',
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

  // NOTA: Los métodos PATCH y DELETE han sido eliminados intencionalmente.
  // El historial de moderación es un log de auditoría append-only.
  // Modificar o eliminar registros comprometería la integridad de la auditoría.
}
