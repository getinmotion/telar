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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CartShippingInfoService } from './cart-shipping-info.service';
import { CreateCartShippingInfoDto } from './dto/create-cart-shipping-info.dto';
import { UpdateCartShippingInfoDto } from './dto/update-cart-shipping-info.dto';
import { CartShippingInfo } from './entities/cart-shipping-info.entity';

@ApiTags('cart-shipping-info')
@Controller('cart-shipping-info')
export class CartShippingInfoController {
  constructor(
    private readonly cartShippingInfoService: CartShippingInfoService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear información de envío para un carrito',
    description:
      'Crea un nuevo registro de información de envío asociado a un carrito específico.',
  })
  @ApiResponse({
    status: 201,
    description: 'Información de envío creada exitosamente',
    type: CartShippingInfo,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async create(
    @Body() createCartShippingInfoDto: CreateCartShippingInfoDto,
  ): Promise<CartShippingInfo> {
    return this.cartShippingInfoService.create(createCartShippingInfoDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las informaciones de envío',
    description:
      'Retorna una lista de todas las informaciones de envío registradas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de informaciones de envío',
    type: [CartShippingInfo],
  })
  async findAll(): Promise<CartShippingInfo[]> {
    return this.cartShippingInfoService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener información de envío por ID',
    description:
      'Retorna los detalles de una información de envío específica por su ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la información de envío',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de envío encontrada',
    type: CartShippingInfo,
  })
  @ApiResponse({
    status: 404,
    description: 'Información de envío no encontrada',
  })
  async findOne(@Param('id') id: string): Promise<CartShippingInfo> {
    return this.cartShippingInfoService.findOne(id);
  }

  @Get('cart/:cartId')
  @ApiOperation({
    summary: 'Obtener información de envío por ID de carrito',
    description:
      'Retorna la información de envío asociada a un carrito específico.',
  })
  @ApiParam({
    name: 'cartId',
    description: 'ID del carrito',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de envío encontrada',
    type: CartShippingInfo,
  })
  @ApiResponse({
    status: 404,
    description: 'Información de envío no encontrada para este carrito',
  })
  async findByCartId(
    @Param('cartId') cartId: string,
  ): Promise<CartShippingInfo | null> {
    return this.cartShippingInfoService.findByCartId(cartId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar información de envío',
    description:
      'Actualiza parcialmente los datos de una información de envío existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la información de envío',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de envío actualizada exitosamente',
    type: CartShippingInfo,
  })
  @ApiResponse({
    status: 404,
    description: 'Información de envío no encontrada',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCartShippingInfoDto: UpdateCartShippingInfoDto,
  ): Promise<CartShippingInfo> {
    return this.cartShippingInfoService.update(id, updateCartShippingInfoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar información de envío',
    description:
      'Elimina permanentemente una información de envío del sistema.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la información de envío',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Información de envío eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Información de envío no encontrada',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.cartShippingInfoService.remove(id);
  }
}
