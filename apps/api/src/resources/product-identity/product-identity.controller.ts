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
import { ProductIdentityService } from './product-identity.service';
import { CreateProductIdentityDto } from './dto/create-product-identity.dto';
import { UpdateProductIdentityDto } from './dto/update-product-identity.dto';
import { SendCertificateInvitationDto } from './dto/send-certificate-invitation.dto';
import { CreateProductIdentityWithEmailDto } from './dto/create-product-identity-with-email.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('product-identity')
@Controller('product-identity')
export class ProductIdentityController {
  constructor(
    private readonly productIdentityService: ProductIdentityService,
  ) {}

  /**
   * POST /product-identity
   * Crear una nueva identidad de producto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear una nueva identidad de producto' })
  @ApiResponse({
    status: 201,
    description: 'Identidad de producto creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 409,
    description: 'La clave de identidad ya existe',
  })
  async create(@Body() createDto: CreateProductIdentityDto) {
    return await this.productIdentityService.create(createDto);
  }

  /**
   * POST /product-identity/create-with-email
   * Crear identidad de producto con productId y email
   * Busca automáticamente store_id y artisan_id, genera identityKey y envía invitación
   */
  @Post('create-with-email')
  @HttpCode(HttpStatus.CREATED)
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear identidad de producto con email de invitación',
    description:
      'Crea un registro de product_identity buscando automáticamente store_id y artisan_id desde el producto. Genera un identityKey único y envía email de invitación al comprador.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Identidad de producto creada e invitación enviada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async createWithEmail(@Body() createDto: CreateProductIdentityWithEmailDto) {
    return await this.productIdentityService.createWithEmail(
      createDto.productId,
      createDto.email,
    );
  }

  /**
   * GET /product-identity
   * Obtener todas las identidades de productos
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todas las identidades de productos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de identidades obtenida exitosamente',
  })
  async getAll() {
    return await this.productIdentityService.getAll();
  }

  /**
   * GET /product-identity/:id
   * Obtener una identidad de producto por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una identidad de producto por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la identidad del producto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Identidad de producto encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Identidad de producto no encontrada',
  })
  async getById(@Param('id') id: string) {
    return await this.productIdentityService.getById(id);
  }

  /**
   * GET /product-identity/key/:identityKey
   * Obtener una identidad de producto por clave única
   */
  @Get('key/:identityKey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener una identidad de producto por clave única',
  })
  @ApiParam({
    name: 'identityKey',
    description: 'Clave única de la identidad del producto',
    example: 'TELAR-CERT-2026-ABC123XYZ',
  })
  @ApiResponse({
    status: 200,
    description: 'Identidad de producto encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Identidad de producto no encontrada',
  })
  async getByIdentityKey(@Param('identityKey') identityKey: string) {
    return await this.productIdentityService.getByIdentityKey(identityKey);
  }

  /**
   * GET /product-identity/product/:productId
   * Obtener identidades por ID de producto
   */
  @Get('product/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener identidades por ID de producto' })
  @ApiParam({
    name: 'productId',
    description: 'ID del producto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de identidades obtenida exitosamente',
  })
  async getByProductId(@Param('productId') productId: string) {
    return await this.productIdentityService.getByProductId(productId);
  }

  /**
   * GET /product-identity/store/:storeId
   * Obtener identidades por ID de tienda
   */
  @Get('store/:storeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener identidades por ID de tienda' })
  @ApiParam({
    name: 'storeId',
    description: 'ID de la tienda (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de identidades obtenida exitosamente',
  })
  async getByStoreId(@Param('storeId') storeId: string) {
    return await this.productIdentityService.getByStoreId(storeId);
  }

  /**
   * GET /product-identity/artisan/:artisanId
   * Obtener identidades por ID de artesano
   */
  @Get('artisan/:artisanId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener identidades por ID de artesano' })
  @ApiParam({
    name: 'artisanId',
    description: 'ID del artesano (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de identidades obtenida exitosamente',
  })
  async getByArtisanId(@Param('artisanId') artisanId: string) {
    return await this.productIdentityService.getByArtisanId(artisanId);
  }

  /**
   * PATCH /product-identity/:id
   * Actualizar una identidad de producto
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar una identidad de producto' })
  @ApiParam({
    name: 'id',
    description: 'ID de la identidad del producto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Identidad de producto actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Identidad de producto no encontrada',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductIdentityDto,
  ) {
    return await this.productIdentityService.update(id, updateDto);
  }

  /**
   * DELETE /product-identity/:id
   * Eliminar una identidad de producto
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar una identidad de producto' })
  @ApiParam({
    name: 'id',
    description: 'ID de la identidad del producto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Identidad de producto eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Identidad de producto no encontrada',
  })
  async delete(@Param('id') id: string) {
    return await this.productIdentityService.delete(id);
  }

  /**
   * POST /product-identity/:id/send-certificate-invitation
   * Enviar invitación de certificado digital por email
   */
  @Post(':id/send-certificate-invitation')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Enviar invitación de certificado digital por email',
    description:
      'Envía un email al comprador con el link para registrarse y reclamar el certificado digital del producto',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la identidad del producto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitación enviada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Identidad de producto no encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'Email inválido',
  })
  async sendCertificateInvitation(
    @Param('id') id: string,
    @Body() sendInvitationDto: SendCertificateInvitationDto,
  ) {
    return await this.productIdentityService.sendCertificateInvitation(
      id,
      sendInvitationDto.email,
    );
  }
}
