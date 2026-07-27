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
import { UsersPassportService } from './users-passport.service';
import { CreateUsersPassportDto } from './dto/create-users-passport.dto';
import { UpdateUsersPassportDto } from './dto/update-users-passport.dto';
import { RegisterWithIdentityKeyDto } from './dto/register-with-identity-key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users-passport')
@Controller('users-passport')
export class UsersPassportController {
  constructor(private readonly usersPassportService: UsersPassportService) {}

  /**
   * POST /users-passport
   * Crear un nuevo usuario comprador
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear un nuevo usuario comprador' })
  @ApiResponse({
    status: 201,
    description: 'Usuario comprador creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createDto: CreateUsersPassportDto) {
    return await this.usersPassportService.create(createDto);
  }

  /**
   * POST /users-passport/register-with-key
   * Registrar usuario comprador con identityKey (PÚBLICO - sin autenticación)
   * Crea el usuario y la relación con product_identity automáticamente
   */
  @Post('register-with-key')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar usuario comprador con certificado digital (público)',
    description:
      'Endpoint público para que los compradores registren sus datos y reclamen el certificado digital usando el identityKey recibido por email.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado y certificado asociado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 404,
    description: 'Certificado no encontrado o inactivo',
  })
  async registerWithKey(@Body() registerDto: RegisterWithIdentityKeyDto) {
    return await this.usersPassportService.registerWithIdentityKey(registerDto);
  }

  /**
   * GET /users-passport
   * Obtener todos los usuarios compradores
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los usuarios compradores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
  })
  async getAll() {
    return await this.usersPassportService.getAll();
  }

  /**
   * GET /users-passport/:id
   * Obtener un usuario comprador por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un usuario comprador por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario comprador (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario comprador encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario comprador no encontrado',
  })
  async getById(@Param('id') id: string) {
    return await this.usersPassportService.getById(id);
  }

  /**
   * GET /users-passport/identification/:numIdentificacion
   * Obtener usuarios por número de identificación
   */
  @Get('identification/:numIdentificacion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener usuarios por número de identificación',
  })
  @ApiParam({
    name: 'numIdentificacion',
    description: 'Número de identificación del comprador',
    example: '1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
  })
  async getByNumIdentificacion(
    @Param('numIdentificacion') numIdentificacion: string,
  ) {
    return await this.usersPassportService.getByNumIdentificacion(
      numIdentificacion,
    );
  }

  /**
   * GET /users-passport/email/:email
   * Obtener usuarios por email
   */
  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener usuarios por email' })
  @ApiParam({
    name: 'email',
    description: 'Email del comprador',
    example: 'juan.perez@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
  })
  async getByEmail(@Param('email') email: string) {
    return await this.usersPassportService.getByEmail(email);
  }

  /**
   * PATCH /users-passport/:id
   * Actualizar un usuario comprador
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar un usuario comprador' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario comprador (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario comprador actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario comprador no encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUsersPassportDto,
  ) {
    return await this.usersPassportService.update(id, updateDto);
  }

  /**
   * DELETE /users-passport/:id
   * Eliminar un usuario comprador
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar un usuario comprador' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario comprador (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario comprador eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario comprador no encontrado',
  })
  async delete(@Param('id') id: string) {
    return await this.usersPassportService.delete(id);
  }
}
