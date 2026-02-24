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
import { EmailVerificationsService } from './email-verifications.service';
import { CreateEmailVerificationDto } from './dto/create-email-verification.dto';
import { UpdateEmailVerificationDto } from './dto/update-email-verification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('email-verifications')
@Controller('email-verifications')
export class EmailVerificationsController {
  constructor(
    private readonly emailVerificationsService: EmailVerificationsService,
  ) {}

  /**
   * POST /email-verifications
   * Crear un nuevo token de verificación
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo token de verificación de email' })
  @ApiResponse({
    status: 201,
    description: 'Token de verificación creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createDto: CreateEmailVerificationDto) {
    return await this.emailVerificationsService.create(createDto);
  }

  /**
   * POST /email-verifications/generate/:userId
   * Generar token de verificación para un usuario
   */
  @Post('generate/:userId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Generar token de verificación para un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'expirationHours',
    required: false,
    type: Number,
    description: 'Horas hasta la expiración (default: 24)',
    example: 24,
  })
  @ApiResponse({
    status: 201,
    description: 'Token generado exitosamente',
  })
  async generateToken(
    @Param('userId') userId: string,
    @Query('expirationHours') expirationHours?: string,
  ) {
    const hours = expirationHours ? parseInt(expirationHours, 10) : 24;
    return await this.emailVerificationsService.createVerificationToken(
      userId,
      hours,
    );
  }

  /**
   * GET /email-verifications
   * Obtener todos los tokens de verificación
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todos los tokens de verificación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tokens obtenida exitosamente',
  })
  async getAll() {
    return await this.emailVerificationsService.getAll();
  }

  /**
   * GET /email-verifications/valid
   * Obtener tokens válidos (no usados y no expirados)
   */
  @Get('valid')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener tokens válidos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tokens válidos obtenida exitosamente',
  })
  async getValidTokens() {
    return await this.emailVerificationsService.getValidTokens();
  }

  /**
   * POST /email-verifications/verify/:token
   * Verificar email con token (proceso completo)
   * Replica la lógica de la edge function verify-email de Supabase
   */
  @Post('verify/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar email con token y confirmar cuenta',
    description:
      'Verifica el token, actualiza email_confirmed_at en auth.users y marca el token como usado',
  })
  @ApiParam({
    name: 'token',
    description: 'Token de verificación enviado por email',
    example: 'abc123def456ghi789',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verificado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Email verificado exitosamente',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        emailConfirmedAt: '2026-01-19T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido, ya usado o expirado',
    schema: {
      example: {
        statusCode: 400,
        message: 'Token inválido o ya utilizado',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error al confirmar el email',
  })
  async verifyEmailWithToken(@Param('token') token: string) {
    return await this.emailVerificationsService.verifyEmailWithToken(token);
  }

  /**
   * POST /email-verifications/use/:token
   * Marcar token como usado
   */
  @Post('use/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar token como usado' })
  @ApiParam({
    name: 'token',
    description: 'Token de verificación',
    example: 'abc123def456ghi789',
  })
  @ApiResponse({
    status: 200,
    description: 'Token marcado como usado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Token expirado' })
  @ApiResponse({ status: 404, description: 'Token no encontrado' })
  @ApiResponse({ status: 409, description: 'Token ya usado' })
  async useToken(@Param('token') token: string) {
    return await this.emailVerificationsService.markAsUsed(token);
  }

  /**
   * GET /email-verifications/user/:userId
   * Obtener tokens de un usuario
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener tokens de verificación de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tokens del usuario obtenida exitosamente',
  })
  async getByUserId(@Param('userId') userId: string) {
    return await this.emailVerificationsService.getByUserId(userId);
  }

  /**
   * GET /email-verifications/:id
   * Obtener un token por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener un token de verificación por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del token (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Token encontrado',
  })
  @ApiResponse({ status: 404, description: 'Token no encontrado' })
  async getById(@Param('id') id: string) {
    return await this.emailVerificationsService.getById(id);
  }

  /**
   * PATCH /email-verifications/:id
   * Actualizar un token de verificación
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un token de verificación' })
  @ApiParam({
    name: 'id',
    description: 'ID del token (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Token actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Token no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmailVerificationDto,
  ) {
    return await this.emailVerificationsService.update(id, updateDto);
  }

  /**
   * DELETE /email-verifications/:id
   * Eliminar un token de verificación
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un token de verificación' })
  @ApiParam({
    name: 'id',
    description: 'ID del token (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Token eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Token no encontrado' })
  async delete(@Param('id') id: string) {
    return await this.emailVerificationsService.delete(id);
  }

  /**
   * DELETE /email-verifications/clean/expired
   * Limpiar tokens expirados
   */
  @Delete('clean/expired')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Limpiar tokens expirados y no usados' })
  @ApiResponse({
    status: 200,
    description: 'Tokens expirados eliminados exitosamente',
  })
  async cleanExpiredTokens() {
    return await this.emailVerificationsService.cleanExpiredTokens();
  }

  /**
   * POST /email-verifications/invalidate/:userId
   * Invalidar todos los tokens de un usuario
   */
  @Post('invalidate/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Invalidar todos los tokens de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens invalidados exitosamente',
  })
  async invalidateUserTokens(@Param('userId') userId: string) {
    return await this.emailVerificationsService.invalidateUserTokens(userId);
  }
}
