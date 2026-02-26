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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva orden' })
  @ApiResponse({
    status: 201,
    description: 'Orden creada exitosamente',
    type: Order,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las órdenes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes',
    type: [Order],
  })
  findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get('checkout/:checkoutId')
  @ApiOperation({ summary: 'Obtener órdenes por checkoutId' })
  @ApiParam({ name: 'checkoutId', description: 'ID del checkout' })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes del checkout',
    type: [Order],
  })
  @ApiResponse({ status: 400, description: 'checkoutId inválido' })
  findByCheckoutId(@Param('checkoutId') checkoutId: string): Promise<Order[]> {
    return this.ordersService.findByCheckoutId(checkoutId);
  }

  @Get('seller/:sellerShopId')
  @ApiOperation({
    summary: 'Obtener órdenes por sellerShopId con sus items',
    description:
      'Retorna todas las órdenes de una tienda vendedora incluyendo los order_items y productos asociados',
  })
  @ApiParam({ name: 'sellerShopId', description: 'ID de la tienda vendedora' })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes de la tienda con sus items y productos',
    type: [Order],
  })
  @ApiResponse({ status: 400, description: 'sellerShopId inválido' })
  findBySellerShopId(
    @Param('sellerShopId') sellerShopId: string,
  ): Promise<Order[]> {
    return this.ordersService.findBySellerShopId(sellerShopId);
  }

  @Get('buyer/:buyerUserId/with-items')
  @ApiOperation({
    summary: 'Obtener órdenes de un usuario con sus items',
    description:
      'Retorna todas las órdenes de un usuario (buyer_user_id) incluyendo los order_items de cada orden',
  })
  @ApiParam({
    name: 'buyerUserId',
    description: 'ID del usuario comprador',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes del usuario con sus items',
    type: [Order],
  })
  @ApiResponse({ status: 400, description: 'buyerUserId inválido' })
  findByBuyerUserIdWithItems(
    @Param('buyerUserId') buyerUserId: string,
  ): Promise<Order[]> {
    return this.ordersService.findByBuyerUserIdWithItems(buyerUserId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una orden por ID' })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiResponse({
    status: 200,
    description: 'Orden encontrada',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  findOne(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una orden' })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiResponse({
    status: 200,
    description: 'Orden actualizada exitosamente',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de la orden' })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiResponse({
    status: 200,
    description: 'Estado de la orden actualizado exitosamente',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una orden' })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiResponse({ status: 200, description: 'Orden eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.ordersService.remove(id);
  }
}
