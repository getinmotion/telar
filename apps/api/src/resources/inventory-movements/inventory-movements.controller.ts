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
} from '@nestjs/swagger';
import { InventoryMovementsService } from './inventory-movements.service';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { UpdateInventoryMovementDto } from './dto/update-inventory-movement.dto';
import { QueryInventoryMovementDto } from './dto/query-inventory-movement.dto';
import { InventoryMovement } from './entities/inventory-movement.entity';

@ApiTags('inventory-movements')
@Controller('inventory-movements')
export class InventoryMovementsController {
  constructor(
    private readonly inventoryMovementsService: InventoryMovementsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo movimiento de inventario' })
  @ApiResponse({
    status: 201,
    description: 'Movimiento creado exitosamente',
    type: InventoryMovement,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos (cantidad negativa, variante inexistente)',
  })
  create(
    @Body() createDto: CreateInventoryMovementDto,
  ): Promise<InventoryMovement> {
    return this.inventoryMovementsService.create(createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los movimientos con filtros y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de movimientos',
    type: [InventoryMovement],
  })
  findAll(@Query() queryDto: QueryInventoryMovementDto) {
    return this.inventoryMovementsService.findAll(queryDto);
  }

  @Get('variant/:productVariantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los movimientos de una variante de producto',
  })
  @ApiParam({
    name: 'productVariantId',
    description: 'ID de la variante de producto',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de movimientos de la variante',
    type: [InventoryMovement],
  })
  findByProductVariant(
    @Param('productVariantId') productVariantId: string,
  ): Promise<InventoryMovement[]> {
    return this.inventoryMovementsService.findByProductVariant(
      productVariantId,
    );
  }

  @Get('variant/:productVariantId/balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calcular balance de inventario para una variante',
  })
  @ApiParam({
    name: 'productVariantId',
    description: 'ID de la variante de producto',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance calculado',
    schema: {
      type: 'object',
      properties: {
        productVariantId: { type: 'string' },
        totalIn: { type: 'number' },
        totalOut: { type: 'number' },
        totalAdjust: { type: 'number' },
        balance: { type: 'number' },
      },
    },
  })
  calculateBalance(@Param('productVariantId') productVariantId: string) {
    return this.inventoryMovementsService.calculateBalance(productVariantId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un movimiento por ID' })
  @ApiParam({ name: 'id', description: 'ID del movimiento' })
  @ApiResponse({
    status: 200,
    description: 'Movimiento encontrado',
    type: InventoryMovement,
  })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  findOne(@Param('id') id: string): Promise<InventoryMovement> {
    return this.inventoryMovementsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Actualizar un movimiento (NO RECOMENDADO - usar con precaución)',
  })
  @ApiParam({ name: 'id', description: 'ID del movimiento' })
  @ApiResponse({
    status: 200,
    description: 'Movimiento actualizado',
    type: InventoryMovement,
  })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInventoryMovementDto,
  ): Promise<InventoryMovement> {
    return this.inventoryMovementsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un movimiento (NO RECOMENDADO - usar con precaución)',
  })
  @ApiParam({ name: 'id', description: 'ID del movimiento' })
  @ApiResponse({
    status: 200,
    description: 'Movimiento eliminado',
  })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.inventoryMovementsService.remove(id);
  }
}
