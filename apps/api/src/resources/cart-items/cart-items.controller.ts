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
import { CartItemsService } from './cart-items.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cart Items')
@Controller('cart-items')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo item en el carrito' })
  @ApiResponse({
    status: 201,
    description: 'Item del carrito creado exitosamente',
    type: CartItem,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 404,
    description: 'Carrito, producto o tienda no encontrados',
  })
  create(@Body() createCartItemDto: CreateCartItemDto): Promise<CartItem> {
    return this.cartItemsService.create(createCartItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los items del carrito' })
  @ApiResponse({
    status: 200,
    description: 'Lista de items del carrito',
    type: [CartItem],
  })
  findAll(): Promise<CartItem[]> {
    return this.cartItemsService.findAll();
  }

  @Get('cart/:cartId')
  @ApiOperation({ summary: 'Obtener items por cartId' })
  @ApiParam({ name: 'cartId', description: 'ID del carrito' })
  @ApiResponse({
    status: 200,
    description: 'Lista de items del carrito',
    type: [CartItem],
  })
  @ApiResponse({ status: 400, description: 'cartId inválido' })
  findByCartId(@Param('cartId') cartId: string): Promise<CartItem[]> {
    return this.cartItemsService.findByCartId(cartId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un item del carrito por ID' })
  @ApiParam({ name: 'id', description: 'ID del item' })
  @ApiResponse({
    status: 200,
    description: 'Item del carrito encontrado',
    type: CartItem,
  })
  @ApiResponse({ status: 404, description: 'Item del carrito no encontrado' })
  findOne(@Param('id') id: string): Promise<CartItem> {
    return this.cartItemsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un item del carrito' })
  @ApiParam({ name: 'id', description: 'ID del item' })
  @ApiResponse({
    status: 200,
    description: 'Item del carrito actualizado exitosamente',
    type: CartItem,
  })
  @ApiResponse({ status: 404, description: 'Item del carrito no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    return this.cartItemsService.update(id, updateCartItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un item del carrito' })
  @ApiParam({ name: 'id', description: 'ID del item' })
  @ApiResponse({
    status: 200,
    description: 'Item del carrito eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Item del carrito no encontrado' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.cartItemsService.remove(id);
  }

  @Delete('cart/:cartId/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar todos los items de un carrito' })
  @ApiParam({ name: 'cartId', description: 'ID del carrito' })
  @ApiResponse({
    status: 200,
    description: 'Items del carrito eliminados exitosamente',
  })
  @ApiResponse({ status: 400, description: 'cartId inválido' })
  removeByCartId(@Param('cartId') cartId: string): Promise<{ message: string }> {
    return this.cartItemsService.removeByCartId(cartId);
  }
}
