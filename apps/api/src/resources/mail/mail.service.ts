import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { ImageUrlBuilder } from '../../common/utils/image-url-builder.util';

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
        logoUrl: ImageUrlBuilder.buildUrl(
          this.configService.get<string>('LOGO_URL') ||
            '/images/platform/telar-logo.png',
        ),
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
   * Enviar email de confirmación de compra exitosa
   */
  async sendPaymentConfirmation(
    email: string,
    buyerName: string,
    orderData: {
      cartId: string;
      transactionId: string;
      currency: string;
      items: Array<{
        productName: string;
        quantity: number;
        formattedPrice: string;
      }>;
      totalFormatted: string;
    },
  ): Promise<void> {
    const baseUrl = (
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:1010'
    ).replace(/\/$/, '');
    const ordersUrl = `${baseUrl}/orders`;

    await this.mailerService.sendMail({
      to: email,
      subject: '¡Compra Confirmada! - GetInMotion',
      template: './payment-confirmation',
      context: {
        buyerName,
        ...orderData,
        ordersUrl,
        logoUrl: ImageUrlBuilder.buildUrl(
          this.configService.get<string>('LOGO_URL') ||
            '/images/platform/telar-logo.png',
        ),
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

  /**
   * Enviar notificación de guía de envío al destinatario (comprador)
   */
  async sendShippingNotificationToRecipient(
    email: string,
    recipientName: string,
    numGuia: string,
    shopName: string,
  ): Promise<void> {
    const trackingUrl = `https://www.servientrega.com/wps/portal/rastreo-envio?guia=${numGuia}`;
    const baseUrl = (
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:1010'
    ).replace(/\/$/, '');

    await this.mailerService.sendMail({
      to: email,
      subject: `🚚 Tu guía de envío ha sido generada - ${numGuia}`,
      template: './shipping-notification-recipient',
      context: {
        recipientName,
        numGuia,
        shopName,
        trackingUrl,
        ordersUrl: `${baseUrl}/orders`,
        logoUrl: ImageUrlBuilder.buildUrl(
          this.configService.get<string>('LOGO_URL') ||
            '/images/platform/telar-logo.png',
        ),
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Enviar notificación de guía de envío al artesano (vendedor) con PDF adjunto
   */
  async sendShippingNotificationToArtisan(
    email: string,
    artisanName: string,
    shopName: string,
    numGuia: string,
    recipientName: string,
    recipientCity: string,
    pdfBytes: Buffer | null,
  ): Promise<void> {
    const mailOptions: any = {
      to: email,
      subject: `📦 Nueva guía de envío - ${numGuia} | Acción requerida`,
      template: './shipping-notification-artisan',
      context: {
        artisanName,
        shopName,
        numGuia,
        recipientName,
        recipientCity,
        manualEmpaqueUrl:
          'https://marketplacetelar.lovable.app/manual-empaque-servientrega.pdf',
        oficinasUrl: 'https://www.servientrega.com/wps/portal/oficinas',
        logoUrl: ImageUrlBuilder.buildUrl(
          this.configService.get<string>('LOGO_URL') ||
            '/images/platform/telar-logo.png',
        ),
        year: new Date().getFullYear(),
      },
    };

    // Agregar PDF adjunto si está disponible
    if (pdfBytes && pdfBytes.length > 0) {
      mailOptions.attachments = [
        {
          filename: `guia-servientrega-${numGuia}.pdf`,
          content: pdfBytes,
          contentType: 'application/pdf',
        },
      ];
    }

    await this.mailerService.sendMail(mailOptions);
  }

  /**
   * Enviar notificación de venta al artesano
   */
  async sendSaleNotificationToArtisan(
    email: string,
    artisanName: string,
    shopName: string,
    cartId: string,
    buyerName: string,
    items: Array<{
      productName: string;
      quantity: number;
      formattedPrice: string;
      formattedSubtotal: string;
    }>,
    totalFormatted: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: `🎉 ¡Nueva Venta en ${shopName}!`,
      template: './sale-notification-artisan',
      context: {
        artisanName,
        shopName,
        cartId,
        buyerName,
        items,
        totalFormatted,
        logoUrl: ImageUrlBuilder.buildUrl(
          this.configService.get<string>('LOGO_URL') ||
            '/images/platform/telar-logo.png',
        ),
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Notificar al comprador que su pago no pudo procesarse
   */
  async sendPaymentFailureNotification(
    email: string,
    data: { cartId: string; transactionId: string },
  ): Promise<void> {
    const baseUrl = (
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:1010'
    ).replace(/\/$/, '');

    await this.mailerService.sendMail({
      to: email,
      subject: 'Tu pago no pudo ser procesado - Telar',
      template: './payment-confirmation',
      context: {
        buyerName: email.split('@')[0],
        cartId: data.cartId,
        transactionId: data.transactionId,
        failed: true,
        retryUrl: `${baseUrl}/cart`,
        logoUrl: ImageUrlBuilder.buildUrl(
          this.configService.get<string>('LOGO_URL') ||
            '/images/platform/telar-logo.png',
        ),
        year: new Date().getFullYear(),
      },
    });
  }
}
