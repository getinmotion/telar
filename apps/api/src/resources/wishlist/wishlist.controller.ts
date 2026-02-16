import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  /**
   * POST /wishlist
   * Crear un nuevo item en wishlist
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Agregar producto a wishlist' })
  @ApiResponse({
    status: 201,
    description: 'Producto agregado a wishlist exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 409,
    description: 'El producto ya está en la wishlist',
  })
  async create(@Body() createDto: CreateWishlistDto) {
    return await this.wishlistService.create(createDto);
  }

  /**
   * GET /wishlist
   * Obtener todos los items de wishlist
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todos los items de wishlist' })
  @ApiResponse({
    status: 200,
    description: 'Lista de wishlist obtenida exitosamente',
  })
  async getAll() {
    return await this.wishlistService.getAll();
  }

  /**
   * GET /wishlist/user/:userId
   * Obtener wishlist de un usuario
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener wishlist de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist del usuario obtenida exitosamente',
  })
  async getByUserId(@Param('userId') userId: string) {
    return await this.wishlistService.getByUserId(userId);
  }

  /**
   * GET /wishlist/:id
   * Obtener un item de wishlist por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener un item de wishlist por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del wishlist item (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist item encontrado',
  })
  @ApiResponse({ status: 404, description: 'Wishlist item no encontrado' })
  async getById(@Param('id') id: string) {
    return await this.wishlistService.getById(id);
  }

  /**
   * PATCH /wishlist/:id
   * Actualizar un item de wishlist
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un item de wishlist' })
  @ApiParam({
    name: 'id',
    description: 'ID del wishlist item (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist item actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Wishlist item no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWishlistDto,
  ) {
    return await this.wishlistService.update(id, updateDto);
  }

  /**
   * DELETE /wishlist/:id
   * Eliminar un item de wishlist
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un item de wishlist' })
  @ApiParam({
    name: 'id',
    description: 'ID del wishlist item (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist item eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Wishlist item no encontrado' })
  async delete(@Param('id') id: string) {
    return await this.wishlistService.delete(id);
  }

  /**
   * DELETE /wishlist/user/:userId/product/:productId
   * Eliminar producto de wishlist por userId y productId
   */
  @Delete('user/:userId/product/:productId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar producto de wishlist del usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'productId',
    description: 'ID del producto (UUID)',
    example: '223e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado de wishlist exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado en wishlist',
  })
  async deleteByUserAndProduct(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return await this.wishlistService.deleteByUserAndProduct(userId, productId);
  }
}
