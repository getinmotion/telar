import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Webhook para recibir notificaciones de pago del servicio payment-svc
   *
   * Este endpoint es llamado por el servicio de Go (payment-svc) cuando:
   * - Un pago es confirmado (status: PAID)
   * - Un pago falla (status: FAILED)
   *
   * Ruta: POST /payments/webhook/payments
   *
   * NOTA: Este endpoint NO requiere autenticación JWT porque es llamado
   * por el servicio interno payment-svc.
   *
   * TODO: Implementar validación de firma o token secreto compartido
   * para verificar que la petición viene del servicio payment-svc legítimo.
   */
  @Post('webhook/payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook de notificación de pago',
    description:
      'Recibe notificaciones del servicio payment-svc cuando un pago es confirmado o rechazado',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook procesado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Payload inválido',
  })
  @ApiResponse({
    status: 500,
    description: 'Error procesando el webhook',
  })
  async handlePaymentWebhook(
    @Headers('x-webhook-secret') webhookSecret: string | undefined,
    @Body() webhookData: PaymentWebhookDto,
  ): Promise<{ success: boolean; message: string }> {
    const expectedSecret = process.env.PAYMENTS_WEBHOOK_SECRET;
    if (expectedSecret && webhookSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
    this.logger.log(
      `[Webhook] Recibida notificación de pago - Cart ID: ${webhookData.cart_id}, Status: ${webhookData.status}`,
    );

    try {
      await this.paymentsService.processPaymentWebhook(webhookData);

      return {
        success: true,
        message: 'Webhook procesado exitosamente',
      };
    } catch (error) {
      this.logger.error(
        `[Webhook] Error procesando notificación - Cart ID: ${webhookData.cart_id}`,
        error.stack,
      );

      // Aún devolvemos 200 para que payment-svc no reintente
      // (los errores se loguean internamente)
      return {
        success: false,
        message: 'Error procesando webhook (ver logs)',
      };
    }
  }
}
