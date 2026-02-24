import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderItem } from './entities/order-item.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Order Items')
@Controller('order-items')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo item en la orden' })
  @ApiResponse({
    status: 201,
    description: 'Item de orden creado exitosamente',
    type: OrderItem,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 404,
    description: 'Orden o producto no encontrados',
  })
  create(@Body() createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
    return this.orderItemsService.create(createOrderItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los items de órdenes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de items de órdenes',
    type: [OrderItem],
  })
  findAll(): Promise<OrderItem[]> {
    return this.orderItemsService.findAll();
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Obtener items por orderId' })
  @ApiParam({ name: 'orderId', description: 'ID de la orden' })
  @ApiResponse({
    status: 200,
    description: 'Lista de items de la orden',
    type: [OrderItem],
  })
  @ApiResponse({ status: 400, description: 'orderId inválido' })
  findByOrderId(@Param('orderId') orderId: string): Promise<OrderItem[]> {
    return this.orderItemsService.findByOrderId(orderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un item de orden por ID' })
  @ApiParam({ name: 'id', description: 'ID del item' })
  @ApiResponse({
    status: 200,
    description: 'Item de orden encontrado',
    type: OrderItem,
  })
  @ApiResponse({ status: 404, description: 'Item de orden no encontrado' })
  findOne(@Param('id') id: string): Promise<OrderItem> {
    return this.orderItemsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un item de orden' })
  @ApiParam({ name: 'id', description: 'ID del item' })
  @ApiResponse({
    status: 200,
    description: 'Item de orden actualizado exitosamente',
    type: OrderItem,
  })
  @ApiResponse({ status: 404, description: 'Item de orden no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ): Promise<OrderItem> {
    return this.orderItemsService.update(id, updateOrderItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un item de orden' })
  @ApiParam({ name: 'id', description: 'ID del item' })
  @ApiResponse({
    status: 200,
    description: 'Item de orden eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Item de orden no encontrado' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.orderItemsService.remove(id);
  }

  @Delete('order/:orderId/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar todos los items de una orden' })
  @ApiParam({ name: 'orderId', description: 'ID de la orden' })
  @ApiResponse({
    status: 200,
    description: 'Items de la orden eliminados exitosamente',
  })
  @ApiResponse({ status: 400, description: 'orderId inválido' })
  removeByOrderId(
    @Param('orderId') orderId: string,
  ): Promise<{ message: string }> {
    return this.orderItemsService.removeByOrderId(orderId);
  }
}
