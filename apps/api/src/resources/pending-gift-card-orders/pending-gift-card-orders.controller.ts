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
import { PendingGiftCardOrdersService } from './pending-gift-card-orders.service';
import { CreatePendingGiftCardOrderDto } from './dto/create-pending-gift-card-order.dto';
import { UpdatePendingGiftCardOrderDto } from './dto/update-pending-gift-card-order.dto';
import { PendingGiftCardOrder } from './entities/pending-gift-card-order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Pending Gift Card Orders')
@Controller('pending-gift-card-orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PendingGiftCardOrdersController {
  constructor(
    private readonly pendingGiftCardOrdersService: PendingGiftCardOrdersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva orden pendiente de gift card' })
  @ApiResponse({
    status: 201,
    description: 'Orden pendiente creada exitosamente',
    type: PendingGiftCardOrder,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 404,
    description: 'Carrito o usuario no encontrados',
  })
  create(
    @Body() createPendingGiftCardOrderDto: CreatePendingGiftCardOrderDto,
  ): Promise<PendingGiftCardOrder> {
    return this.pendingGiftCardOrdersService.create(
      createPendingGiftCardOrderDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las órdenes pendientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes pendientes',
    type: [PendingGiftCardOrder],
  })
  findAll(): Promise<PendingGiftCardOrder[]> {
    return this.pendingGiftCardOrdersService.findAll();
  }

  @Get('unprocessed')
  @ApiOperation({ summary: 'Obtener órdenes pendientes no procesadas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes pendientes no procesadas',
    type: [PendingGiftCardOrder],
  })
  findUnprocessed(): Promise<PendingGiftCardOrder[]> {
    return this.pendingGiftCardOrdersService.findUnprocessed();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener órdenes pendientes por userId' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes pendientes del usuario',
    type: [PendingGiftCardOrder],
  })
  @ApiResponse({ status: 400, description: 'userId inválido' })
  findByUserId(@Param('userId') userId: string): Promise<PendingGiftCardOrder[]> {
    return this.pendingGiftCardOrdersService.findByUserId(userId);
  }

  @Get('cart/:cartId')
  @ApiOperation({ summary: 'Obtener órdenes pendientes por cartId' })
  @ApiParam({ name: 'cartId', description: 'ID del carrito' })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes pendientes del carrito',
    type: [PendingGiftCardOrder],
  })
  @ApiResponse({ status: 400, description: 'cartId inválido' })
  findByCartId(@Param('cartId') cartId: string): Promise<PendingGiftCardOrder[]> {
    return this.pendingGiftCardOrdersService.findByCartId(cartId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una orden pendiente por ID' })
  @ApiParam({ name: 'id', description: 'ID de la orden pendiente' })
  @ApiResponse({
    status: 200,
    description: 'Orden pendiente encontrada',
    type: PendingGiftCardOrder,
  })
  @ApiResponse({ status: 404, description: 'Orden pendiente no encontrada' })
  findOne(@Param('id') id: string): Promise<PendingGiftCardOrder> {
    return this.pendingGiftCardOrdersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una orden pendiente' })
  @ApiParam({ name: 'id', description: 'ID de la orden pendiente' })
  @ApiResponse({
    status: 200,
    description: 'Orden pendiente actualizada exitosamente',
    type: PendingGiftCardOrder,
  })
  @ApiResponse({ status: 404, description: 'Orden pendiente no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updatePendingGiftCardOrderDto: UpdatePendingGiftCardOrderDto,
  ): Promise<PendingGiftCardOrder> {
    return this.pendingGiftCardOrdersService.update(
      id,
      updatePendingGiftCardOrderDto,
    );
  }

  @Patch(':id/mark-processed')
  @ApiOperation({ summary: 'Marcar orden pendiente como procesada' })
  @ApiParam({ name: 'id', description: 'ID de la orden pendiente' })
  @ApiResponse({
    status: 200,
    description: 'Orden pendiente marcada como procesada',
    type: PendingGiftCardOrder,
  })
  @ApiResponse({ status: 404, description: 'Orden pendiente no encontrada' })
  markAsProcessed(@Param('id') id: string): Promise<PendingGiftCardOrder> {
    return this.pendingGiftCardOrdersService.markAsProcessed(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una orden pendiente' })
  @ApiParam({ name: 'id', description: 'ID de la orden pendiente' })
  @ApiResponse({
    status: 200,
    description: 'Orden pendiente eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Orden pendiente no encontrada' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.pendingGiftCardOrdersService.remove(id);
  }
}
