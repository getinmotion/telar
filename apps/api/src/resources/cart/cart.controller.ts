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
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UpdateCartStatusDto } from './dto/update-cart-status.dto';
import {
  SyncGuestCartDto,
  SyncGuestCartResponseDto,
} from './dto/sync-guest-cart.dto';
import { Cart } from './entities/cart.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo carrito' })
  @ApiResponse({
    status: 201,
    description: 'Carrito creado exitosamente',
    type: Cart,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario o tienda no encontrados' })
  create(@Body() createCartDto: CreateCartDto): Promise<Cart> {
    return this.cartService.create(createCartDto);
  }

  @Post('sync-guest')
  @ApiOperation({
    summary: 'Sincronizar carrito de invitado a usuario autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Carrito sincronizado exitosamente',
    type: SyncGuestCartResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async syncGuestCart(
    @Body() syncGuestCartDto: SyncGuestCartDto,
  ): Promise<SyncGuestCartResponseDto> {
    return await this.cartService.syncGuestCart(syncGuestCartDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los carritos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de carritos',
    type: [Cart],
  })
  findAll(): Promise<Cart[]> {
    return this.cartService.findAll();
  }

  @Get('buyer/:buyerUserId')
  @ApiOperation({ summary: 'Obtener carritos por buyerUserId' })
  @ApiParam({ name: 'buyerUserId', description: 'ID del usuario comprador' })
  @ApiResponse({
    status: 200,
    description: 'Lista de carritos del comprador',
    type: [Cart],
  })
  @ApiResponse({ status: 400, description: 'buyerUserId inválido' })
  findByBuyerId(@Param('buyerUserId') buyerUserId: string): Promise<Cart[]> {
    return this.cartService.findByBuyerId(buyerUserId);
  }

  @Get('buyer/:buyerUserId/open')
  @ApiOperation({ summary: 'Obtener carrito abierto del comprador' })
  @ApiParam({ name: 'buyerUserId', description: 'ID del usuario comprador' })
  @ApiResponse({
    status: 200,
    description: 'Carrito abierto del comprador',
    type: Cart,
  })
  @ApiResponse({ status: 400, description: 'buyerUserId inválido' })
  findOpenCartByBuyerId(
    @Param('buyerUserId') buyerUserId: string,
  ): Promise<Cart | null> {
    return this.cartService.findOpenCartByBuyerId(buyerUserId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un carrito por ID' })
  @ApiParam({ name: 'id', description: 'ID del carrito' })
  @ApiResponse({
    status: 200,
    description: 'Carrito encontrado',
    type: Cart,
  })
  @ApiResponse({ status: 404, description: 'Carrito no encontrado' })
  findOne(@Param('id') id: string): Promise<Cart> {
    return this.cartService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un carrito' })
  @ApiParam({ name: 'id', description: 'ID del carrito' })
  @ApiResponse({
    status: 200,
    description: 'Carrito actualizado exitosamente',
    type: Cart,
  })
  @ApiResponse({ status: 404, description: 'Carrito no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
  ): Promise<Cart> {
    return this.cartService.update(id, updateCartDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado del carrito' })
  @ApiParam({ name: 'id', description: 'ID del carrito' })
  @ApiResponse({
    status: 200,
    description: 'Estado del carrito actualizado exitosamente',
    type: Cart,
  })
  @ApiResponse({ status: 404, description: 'Carrito no encontrado' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCartStatusDto,
  ): Promise<Cart> {
    return this.cartService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un carrito' })
  @ApiParam({ name: 'id', description: 'ID del carrito' })
  @ApiResponse({ status: 200, description: 'Carrito eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Carrito no encontrado' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.cartService.remove(id);
  }
}
