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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PassportUserService } from './passport-user.service';
import { CreatePassportUserDto } from './dto/create-passport-user.dto';
import { UpdatePassportUserDto } from './dto/update-passport-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('passport-user')
@Controller('passport-user')
export class PassportUserController {
  constructor(private readonly passportUserService: PassportUserService) {}

  /**
   * POST /passport-user
   * Crear una nueva relación entre identidad de producto y usuario comprador
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Crear una nueva relación entre identidad de producto y usuario comprador',
  })
  @ApiResponse({
    status: 201,
    description: 'Relación creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'La relación ya existe' })
  async create(@Body() createDto: CreatePassportUserDto) {
    return await this.passportUserService.create(createDto);
  }

  /**
   * GET /passport-user
   * Obtener todas las relaciones
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todas las relaciones' })
  @ApiResponse({
    status: 200,
    description: 'Lista de relaciones obtenida exitosamente',
  })
  async getAll() {
    return await this.passportUserService.getAll();
  }

  /**
   * GET /passport-user/exists
   * Verificar si existe una relación activa
   */
  @Get('exists')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar si existe una relación activa' })
  @ApiQuery({
    name: 'passportIdentityId',
    description: 'ID de la identidad del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'userPassportId',
    description: 'ID del usuario comprador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la verificación',
  })
  async existsActiveRelation(
    @Query('passportIdentityId') passportIdentityId: string,
    @Query('userPassportId') userPassportId: string,
  ) {
    const exists = await this.passportUserService.existsActiveRelation(
      passportIdentityId,
      userPassportId,
    );
    return { exists };
  }

  /**
   * GET /passport-user/:id
   * Obtener una relación por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una relación por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la relación (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Relación encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Relación no encontrada',
  })
  async getById(@Param('id') id: string) {
    return await this.passportUserService.getById(id);
  }

  /**
   * GET /passport-user/product-identity/:passportIdentityId
   * Obtener relaciones por ID de identidad de producto
   */
  @Get('product-identity/:passportIdentityId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener relaciones por ID de identidad de producto',
  })
  @ApiParam({
    name: 'passportIdentityId',
    description: 'ID de la identidad del producto (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de relaciones obtenida exitosamente',
  })
  async getByProductIdentityId(
    @Param('passportIdentityId') passportIdentityId: string,
  ) {
    return await this.passportUserService.getByProductIdentityId(
      passportIdentityId,
    );
  }

  /**
   * GET /passport-user/user-passport/:userPassportId
   * Obtener relaciones por ID de usuario comprador
   */
  @Get('user-passport/:userPassportId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener relaciones por ID de usuario comprador',
  })
  @ApiParam({
    name: 'userPassportId',
    description: 'ID del usuario comprador (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de relaciones obtenida exitosamente',
  })
  async getByUserPassportId(@Param('userPassportId') userPassportId: string) {
    return await this.passportUserService.getByUserPassportId(userPassportId);
  }

  /**
   * PATCH /passport-user/:id
   * Actualizar una relación
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar una relación' })
  @ApiParam({
    name: 'id',
    description: 'ID de la relación (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Relación actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Relación no encontrada',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePassportUserDto,
  ) {
    return await this.passportUserService.update(id, updateDto);
  }

  /**
   * DELETE /passport-user/:id
   * Eliminar una relación
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar una relación' })
  @ApiParam({
    name: 'id',
    description: 'ID de la relación (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Relación eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Relación no encontrada',
  })
  async delete(@Param('id') id: string) {
    return await this.passportUserService.delete(id);
  }
}
