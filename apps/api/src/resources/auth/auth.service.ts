import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserProfilesService } from '../user-profiles/user-profiles.service';
import { UserProgressService } from '../user-progress/user-progress.service';
import { EmailVerificationsService } from '../email-verifications/email-verifications.service';
import { UserMasterContextService } from '../user-master-context/user-master-context.service';
import { ArtisanShopsService } from '../artisan-shops/artisan-shops.service';
import { UserMaturityActionsService } from '../user-maturity-actions/user-maturity-actions.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userProfilesService: UserProfilesService,
    private readonly userProgressService: UserProgressService,
    private readonly emailVerificationsService: EmailVerificationsService,
    private readonly userMasterContextService: UserMasterContextService,
    private readonly artisanShopsService: ArtisanShopsService,
    private readonly userMaturityActionsService: UserMaturityActionsService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Registrar un nuevo usuario con perfil, progreso y verificación de email
   */
  async register(registerDto: RegisterDto): Promise<{
    success: boolean;
    message: string;
    userId: string;
    user?: Partial<User>;
  }> {
    // Validar que las contraseñas coincidan
    if (registerDto.password !== registerDto.passwordConfirmation) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Validar que acepta términos y condiciones
    if (!registerDto.acceptTerms) {
      throw new BadRequestException('Debes aceptar los términos y condiciones');
    }

    // Normalizar email
    const normalizedEmail = registerDto.email.toLowerCase().trim();

    let createdUserId: string | null = null;

    try {
      // 1. Crear el usuario en auth.users
      const newUser = await this.usersService.create({
        email: normalizedEmail,
        password: registerDto.password,
        phone: registerDto.whatsapp,
        role: 'user',
        rawUserMetaData: {
          first_name: registerDto.firstName.trim(),
          last_name: registerDto.lastName.trim(),
          full_name: `${registerDto.firstName.trim()} ${registerDto.lastName.trim()}`,
        },
      });

      createdUserId = newUser.id;

      // 2. Crear el perfil en artesanos.user_profiles
      const businessLocation =
        registerDto.city && registerDto.department
          ? `${registerDto.city.trim()}, ${registerDto.department.trim()}, Colombia`
          : undefined;

      try {
        await this.userProfilesService.create({
          userId: newUser.id,
          firstName: registerDto.firstName.trim(),
          lastName: registerDto.lastName.trim(),
          fullName: `${registerDto.firstName.trim()} ${registerDto.lastName.trim()}`,
          whatsappE164: registerDto.whatsapp,
          department: registerDto.department.trim(),
          city: registerDto.city.trim(),
          businessLocation,
          rut:
            registerDto.hasRUT && registerDto.rut
              ? registerDto.rut.trim()
              : undefined,
          rutPendiente: !registerDto.hasRUT,
          newsletterOptIn: registerDto.newsletterOptIn || false,
        });
      } catch (profileError) {
        // Si falla la creación del perfil, eliminar el usuario
        await this.usersService.hardDelete(createdUserId);
        throw new InternalServerErrorException(
          'Error al crear el perfil de usuario',
        );
      }

      // 3. Crear el progreso inicial en artesanos.user_progress
      try {
        await this.userProgressService.create({
          userId: newUser.id,
          level: 1,
          experiencePoints: 0,
          nextLevelXp: 100,
        });
      } catch (progressError) {
        // Si falla, eliminar usuario (CASCADE eliminará el perfil)
        await this.usersService.hardDelete(createdUserId);
        throw new InternalServerErrorException(
          'Error al inicializar el progreso del usuario',
        );
      }

      // 4. Generar token de verificación de email (24 horas)
      let verificationToken: string;
      try {
        const tokenData =
          await this.emailVerificationsService.createVerificationToken(
            newUser.id,
            24,
          );
        verificationToken = tokenData.token;
      } catch (tokenError) {
        // Si falla, eliminar usuario (CASCADE eliminará perfil y progreso)
        await this.usersService.hardDelete(createdUserId);
        throw new InternalServerErrorException(
          'Error al generar token de verificación',
        );
      }

      // 5. Enviar correo de verificación
      try {
        await this.mailService.sendEmailVerification(
          normalizedEmail,
          registerDto.firstName.trim(),
          verificationToken,
        );
      } catch (emailError) {
        // Si falla el envío de email, no eliminamos el usuario
        // pero registramos el error para que se pueda reenviar después
        console.error('Error sending verification email:', emailError);
      }

      // Retornar usuario sin datos sensibles
      const { encryptedPassword, ...userWithoutPassword } = newUser;

      return {
        success: true,
        message:
          'Cuenta creada exitosamente. Revisa tu correo para verificar tu cuenta.',
        userId: newUser.id,
        user: userWithoutPassword,
      };
    } catch (error) {
      // Si es un error que ya manejamos, lo relanzamos
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Error inesperado
      // Intentar limpiar si se creó el usuario
      if (createdUserId) {
        try {
          await this.usersService.hardDelete(createdUserId);
        } catch (cleanupError) {
          console.error(
            'Error cleaning up user after failed registration:',
            cleanupError,
          );
        }
      }

      throw new InternalServerErrorException(
        'Error interno del servidor durante el registro',
      );
    }
  }

  /**
   * Login de usuario
   */
  async login(
    email: string,
    password: string,
  ): Promise<{
    user: Partial<User>;
    userMasterContext: any | null;
    artisanShop: any | null;
    userMaturityActions: any[];
    access_token: string;
  }> {
    // Validar credenciales
    const user = await this.usersService.validateCredentials(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el usuario no esté eliminado
    if (user.deletedAt) {
      throw new UnauthorizedException('Esta cuenta ha sido desactivada');
    }

    // Verificar si el usuario está baneado
    if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
      throw new UnauthorizedException(
        `Esta cuenta está suspendida hasta ${user.bannedUntil.toLocaleDateString()}`,
      );
    }

    // Actualizar última fecha de inicio de sesión
    await this.usersService.update(user.id, {
      lastSignInAt: new Date(),
    } as any);

    // Obtener información adicional del usuario
    // Obtener user_master_context (relación 1:1)
    const userMasterContext = await this.userMasterContextService
      .getByUserId(user.id)
      .catch(() => null);

    // Obtener artisan_shop (relación 1:1)
    const artisanShop = await this.artisanShopsService
      .getByUserId(user.id)
      .catch(() => null);

    // Obtener user_maturity_actions (relación 1:N, retorna array)
    const userMaturityActions = await this.userMaturityActionsService
      .getByUserId(user.id)
      .catch(() => []);

    // Generar el token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
    };
    const access_token = await this.jwtService.signAsync(payload);

    // Retornar usuario sin datos sensibles
    const { encryptedPassword, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      userMasterContext,
      artisanShop,
      userMaturityActions,
      access_token,
    };
  }

  /**
   * Validar token JWT y retornar el usuario
   */
  async validateToken(token: string): Promise<User> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.usersService.getById(payload.sub);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Refrescar token (generar nuevo token)
   */
  async refreshToken(userId: string): Promise<{ access_token: string }> {
    const user = await this.usersService.getById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Generar nuevo token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
    };
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.usersService.getById(userId);
    const { encryptedPassword, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.getById(userId);

    // Verificar que la contraseña actual sea correcta
    const isPasswordValid = await this.usersService.verifyPassword(
      oldPassword,
      user.encryptedPassword!,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Actualizar la contraseña
    await this.usersService.update(userId, {
      password: newPassword,
    } as any);

    // Enviar email de confirmación
    try {
      await this.mailService.sendPasswordChangedConfirmation(
        user.email!,
        user.email!, // Usar email como nombre si no hay otro campo
      );
    } catch (error) {
      // Si falla el envío del email, seguir sin afectar la operación
    }

    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }

  /**
   * Solicitar recuperación de contraseña (generar token de recuperación)
   */
  async requestPasswordRecovery(
    email: string,
  ): Promise<{ message: string; recoveryToken?: string }> {
    const user = await this.usersService.getByEmail(email);

    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return {
        message:
          'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
      };
    }

    // Generar token de recuperación
    const recoveryToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'recovery' },
      { expiresIn: '1h' },
    );

    // Guardar el token en la base de datos
    await this.usersService.update(user.id, {
      recoveryToken,
      recoverySentAt: new Date(),
    } as any);

    // Enviar email de recuperación
    try {
      await this.mailService.sendPasswordRecovery(
        user.email!,
        user.email!, // Usar email como nombre si no hay otro campo
        recoveryToken,
      );
    } catch (error) {
      // Si falla el envío del email, seguir sin revelar el error por seguridad
    }

    return {
      message:
        'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
      // En desarrollo, retornar el token. Comentar en producción:
      recoveryToken,
    };
  }

  /**
   * Restablecer contraseña con token de recuperación
   */
  async resetPassword(
    recoveryToken: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      // Verificar el token
      const payload = await this.jwtService.verifyAsync(recoveryToken);

      if (payload.type !== 'recovery') {
        throw new UnauthorizedException('Token inválido');
      }

      // Buscar usuario por ID
      const user = await this.usersService.getById(payload.sub);

      // Verificar que el token coincida con el guardado
      if (user.recoveryToken !== recoveryToken) {
        throw new UnauthorizedException('Token inválido o ya utilizado');
      }

      // Actualizar la contraseña y limpiar el token
      await this.usersService.update(user.id, {
        password: newPassword,
        recoveryToken: null,
        recoverySentAt: null,
      } as any);

      return {
        message: 'Contraseña restablecida exitosamente',
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
