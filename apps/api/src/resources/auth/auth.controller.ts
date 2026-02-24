import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestPasswordRecoveryDto } from './dto/request-password-recovery.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CompleteProfileResponseDto } from './dto/complete-profile-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Registrar un nuevo usuario con perfil, progreso y verificación de email
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Registrar un nuevo usuario (crea user, profile, progress y envía email de verificación)',
  })
  @ApiResponse({
    status: 201,
    description:
      'Usuario registrado exitosamente. Se envió un correo de verificación.',
    schema: {
      example: {
        success: true,
        message:
          'Cuenta creada exitosamente. Revisa tu correo para verificar tu cuenta.',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          phone: '+573001234567',
          role: 'user',
          createdAt: '2026-01-14T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o las contraseñas no coinciden',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al crear perfil, progreso o token de verificación',
  })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   * Iniciar sesión
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al usuario y retorna su información completa incluyendo user_master_context, artisan_shop y user_maturity_actions',
  })
  @ApiResponse({
    status: 200,
    description:
      'Inicio de sesión exitoso con información completa del usuario',
    schema: {
      example: {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          phone: '+573001234567',
          role: 'user',
          isSuperAdmin: false,
          emailConfirmedAt: '2026-01-14T10:00:00.000Z',
          lastSignInAt: '2026-01-20T15:30:00.000Z',
          createdAt: '2026-01-14T10:00:00.000Z',
        },
        userMasterContext: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174000',
          languagePreference: 'es',
          businessContext: { industry: 'Artesanía', size: 'small' },
          goalsAndObjectives: { goal: 'Expandir ventas online' },
          businessProfile: { products: ['Cerámica', 'Textiles'] },
          contextVersion: 1,
          lastAssessmentDate: '2026-01-14T10:00:00.000Z',
        },
        artisanShop: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174000',
          shopName: 'Artesanías Don Pedro',
          shopSlug: 'artesanias-don-pedro',
          department: 'Cundinamarca',
          municipality: 'Bogotá',
          active: true,
          featured: false,
        },
        userMaturityActions: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            userId: '123e4567-e89b-12d3-a456-426614174000',
            actionType: 'profile_completion',
            category: 'digital_presence',
            description: 'Completó su perfil de artesano',
            points: 10,
            createdAt: '2026-01-14T10:00:00.000Z',
          },
        ],
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto.email, loginDto.password);
  }

  /**
   * GET /auth/profile
   * Obtener perfil del usuario autenticado
   * Requiere token JWT
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario obtenido exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  async getProfile(@CurrentUser() user: any) {
    return await this.authService.getProfile(user.sub);
  }

  /**
   * GET /auth/me
   * Obtener perfil completo del usuario autenticado
   * Incluye: user, userMasterContext, artisanShop, userMaturityActions, access_token
   * Requiere token JWT
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener perfil completo del usuario autenticado',
    description:
      'Retorna información completa del usuario incluyendo user, userMasterContext, artisanShop, userMaturityActions y un nuevo access_token (refreshed)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Perfil completo del usuario obtenido exitosamente con token refreshed',
    type: CompleteProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  async getCompleteProfile(@CurrentUser() user: any) {
    return await this.authService.getCompleteProfile(user.sub);
  }

  /**
   * POST /auth/refresh
   * Refrescar token JWT
   * Requiere token JWT
   */
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Refrescar token JWT' })
  @ApiResponse({
    status: 200,
    description: 'Token refrescado exitosamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  async refreshToken(@CurrentUser() user: any) {
    return await this.authService.refreshToken(user.sub);
  }

  /**
   * POST /auth/change-password
   * Cambiar contraseña del usuario autenticado
   * Requiere token JWT
   */
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
    schema: {
      example: {
        message: 'Contraseña actualizada exitosamente',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'La contraseña actual es incorrecta',
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(
      user.sub,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  /**
   * POST /auth/request-password-recovery
   * Solicitar recuperación de contraseña
   * Público (no requiere autenticación)
   */
  @Post('request-password-recovery')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Solicitud procesada (no revela si el email existe)',
    schema: {
      example: {
        message:
          'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
        recoveryToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  async requestPasswordRecovery(
    @Body() requestPasswordRecoveryDto: RequestPasswordRecoveryDto,
  ) {
    return await this.authService.requestPasswordRecovery(
      requestPasswordRecoveryDto.email,
    );
  }

  /**
   * POST /auth/reset-password
   * Restablecer contraseña con token de recuperación
   * Público (no requiere autenticación)
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con token de recuperación' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida exitosamente',
    schema: {
      example: {
        message: 'Contraseña restablecida exitosamente',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(
      resetPasswordDto.recoveryToken,
      resetPasswordDto.newPassword,
    );
  }

  /**
   * GET /auth/validate
   * Validar si el token JWT es válido
   * Requiere token JWT
   */
  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Validar si el token JWT es válido' })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    schema: {
      example: {
        valid: true,
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          role: 'admin',
          isSuperAdmin: false,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async validateToken(@CurrentUser() user: any) {
    return {
      valid: true,
      user: {
        id: user.sub,
        email: user.email,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
      },
    };
  }

  /**
   * GET /auth/google
   * Inicia el flujo de autenticación con Google
   * Redirige al usuario a Google OAuth consent screen
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Iniciar autenticación con Google',
    description: 'Redirige al usuario a Google para autenticarse',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirección a Google OAuth',
  })
  async googleAuth() {
    // Guard maneja la redirección
  }

  /**
   * GET /auth/google/callback
   * Callback de Google OAuth
   * Maneja la respuesta de Google y retorna sesión (JWT + usuario)
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Callback de Google OAuth',
    description: 'Maneja la respuesta de Google OAuth y autentica al usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario autenticado exitosamente con Google',
    schema: {
      example: {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          phone: null,
          role: 'user',
          isSuperAdmin: false,
          emailConfirmedAt: '2026-02-12T10:00:00.000Z',
          lastSignInAt: '2026-02-12T15:30:00.000Z',
          createdAt: '2026-02-12T10:00:00.000Z',
        },
        userMasterContext: null,
        artisanShop: null,
        userMaturityActions: [],
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error durante la autenticación con Google',
  })
  async googleAuthCallback(@CurrentUser() user: any, @Res() res: Response) {
    // Manejar el callback de Google
    const result = await this.authService.handleGoogleCallback(user);

    // Retornar el usuario autenticado con JWT
    // Opcionalmente, también puedes establecer un cookie con el JWT
    // res.cookie('access_token', result.access_token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    // });

    return res.json(result);
  }
}
