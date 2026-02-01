import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository, IsNull, LessThan, MoreThan } from 'typeorm';
import { EmailVerification } from './entities/email-verification.entity';
import { CreateEmailVerificationDto } from './dto/create-email-verification.dto';
import { UpdateEmailVerificationDto } from './dto/update-email-verification.dto';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class EmailVerificationsService {
  constructor(
    @Inject('EMAIL_VERIFICATIONS_REPOSITORY')
    private readonly emailVerificationsRepository: Repository<EmailVerification>,
    @Inject('USERS_REPOSITORY')
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Crear un nuevo token de verificación
   */
  async create(
    createDto: CreateEmailVerificationDto,
  ): Promise<EmailVerification> {
    const newVerification =
      this.emailVerificationsRepository.create(createDto);
    return await this.emailVerificationsRepository.save(newVerification);
  }

  /**
   * Generar un token aleatorio seguro
   */
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Crear token de verificación para un usuario
   */
  async createVerificationToken(
    userId: string,
    expirationHours: number = 24,
  ): Promise<EmailVerification> {
    // Generar token único
    const token = this.generateToken();

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    const verificationDto: CreateEmailVerificationDto = {
      userId,
      token,
      expiresAt: expiresAt.toISOString(),
    };

    return await this.create(verificationDto);
  }

  /**
   * Obtener todos los tokens de verificación
   */
  async getAll(): Promise<EmailVerification[]> {
    return await this.emailVerificationsRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener token por ID
   */
  async getById(id: string): Promise<EmailVerification> {
    if (!id) {
      throw new BadRequestException('El ID es requerido');
    }

    const verification = await this.emailVerificationsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!verification) {
      throw new NotFoundException(
        `Token de verificación con ID ${id} no encontrado`,
      );
    }

    return verification;
  }

  /**
   * Obtener token por el string del token
   */
  async getByToken(token: string): Promise<EmailVerification | null> {
    if (!token) {
      throw new BadRequestException('El token es requerido');
    }

    return await this.emailVerificationsRepository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  /**
   * Obtener tokens por userId
   */
  async getByUserId(userId: string): Promise<EmailVerification[]> {
    return await this.emailVerificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Verificar si un token es válido (no usado y no expirado)
   */
  async isTokenValid(token: string): Promise<boolean> {
    const verification = await this.getByToken(token);

    if (!verification) {
      return false;
    }

    // Verificar si ya fue usado
    if (verification.usedAt) {
      return false;
    }

    // Verificar si expiró
    if (new Date() > new Date(verification.expiresAt)) {
      return false;
    }

    return true;
  }

  /**
   * Marcar token como usado
   */
  async markAsUsed(token: string): Promise<EmailVerification> {
    const verification = await this.getByToken(token);

    if (!verification) {
      throw new NotFoundException('Token no encontrado');
    }

    if (verification.usedAt) {
      throw new ConflictException('El token ya ha sido usado');
    }

    if (new Date() > new Date(verification.expiresAt)) {
      throw new BadRequestException('El token ha expirado');
    }

    verification.usedAt = new Date();
    return await this.emailVerificationsRepository.save(verification);
  }

  /**
   * Actualizar un token de verificación
   */
  async update(
    id: string,
    updateDto: UpdateEmailVerificationDto,
  ): Promise<EmailVerification> {
    await this.getById(id);
    await this.emailVerificationsRepository.update(id, updateDto);
    return await this.getById(id);
  }

  /**
   * Eliminar un token de verificación
   */
  async delete(id: string): Promise<{ message: string }> {
    await this.getById(id);
    await this.emailVerificationsRepository.delete(id);
    return {
      message: `Token de verificación con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Limpiar tokens expirados y no usados
   */
  async cleanExpiredTokens(): Promise<{ deleted: number }> {
    const result = await this.emailVerificationsRepository.delete({
      expiresAt: LessThan(new Date()),
      usedAt: IsNull(),
    });

    return {
      deleted: result.affected || 0,
    };
  }

  /**
   * Obtener tokens válidos (no usados y no expirados)
   */
  async getValidTokens(): Promise<EmailVerification[]> {
    return await this.emailVerificationsRepository.find({
      where: {
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Invalidar todos los tokens de un usuario
   */
  async invalidateUserTokens(userId: string): Promise<{ updated: number }> {
    const result = await this.emailVerificationsRepository.update(
      {
        userId,
        usedAt: IsNull(),
      },
      {
        usedAt: new Date(),
      },
    );

    return {
      updated: result.affected || 0,
    };
  }

  /**
   * Verificar email con token (proceso completo)
   * Replica la lógica de la edge function de Supabase
   */
  async verifyEmailWithToken(token: string): Promise<{
    success: boolean;
    message: string;
    userId: string;
    emailConfirmedAt: Date | null;
  }> {
    if (!token) {
      throw new BadRequestException('Token requerido');
    }

    // 1. Buscar token no usado
    const verification = await this.emailVerificationsRepository.findOne({
      where: {
        token,
        usedAt: IsNull(),
      },
      relations: ['user'],
    });

    if (!verification) {
      throw new BadRequestException('Token inválido o ya utilizado');
    }

    // 2. Verificar expiración
    if (new Date() > new Date(verification.expiresAt)) {
      throw new BadRequestException('El token ha expirado');
    }

    // 3. Actualizar email_confirmed_at en auth.users
    try {
      await this.usersRepository.update(verification.userId, {
        emailConfirmedAt: new Date(),
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al confirmar el email');
    }

    // 4. Obtener usuario actualizado para verificar
    const updatedUser = await this.usersRepository.findOne({
      where: { id: verification.userId },
    });

    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado después de actualizar');
    }

    // 5. Marcar token como usado SOLO si la confirmación fue exitosa
    await this.emailVerificationsRepository.update(verification.id, {
      usedAt: new Date(),
    });

    // 6. Retornar resultado exitoso
    return {
      success: true,
      message: 'Email verificado exitosamente',
      userId: verification.userId,
      emailConfirmedAt: updatedUser.emailConfirmedAt,
    };
  }
}
