import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Enviar email de verificación de cuenta
   */
  async sendEmailVerification(
    email: string,
    name: string,
    verificationToken: string,
  ): Promise<void> {
    const baseUrl = (
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:1010'
    ).replace(/\/$/, '');
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verifica tu cuenta - GetInMotion',
      template: './verify-email',
      context: {
        name,
        verificationUrl,
        logoUrl: this.configService.get<string>('LOGO_URL') || null,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async sendPasswordRecovery(
    email: string,
    name: string,
    recoveryToken: string,
  ): Promise<void> {
    const recoveryUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${recoveryToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Recupera tu contraseña - GetInMotion',
      template: './password-recovery',
      context: {
        name,
        recoveryUrl,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Enviar email de bienvenida
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: '¡Bienvenido a GetInMotion!',
      template: './welcome',
      context: {
        name,
        loginUrl: `${this.configService.get<string>('FRONTEND_URL')}/login`,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Enviar email de confirmación de cambio de contraseña
   */
  async sendPasswordChangedConfirmation(
    email: string,
    name: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Tu contraseña ha sido cambiada - GetInMotion',
      template: './password-changed',
      context: {
        name,
        supportEmail: this.configService.get<string>('MAIL_FROM_EMAIL'),
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Enviar email personalizado (genérico)
   */
  async sendCustomEmail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      template: `./${template}`,
      context: {
        ...context,
        year: new Date().getFullYear(),
      },
    });
  }
}

