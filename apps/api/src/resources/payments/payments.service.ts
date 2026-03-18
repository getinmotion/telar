import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart-items/entities/cart-item.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject('CART_REPOSITORY')
    private readonly cartRepository: Repository<Cart>,
    @Inject('CART_ITEMS_REPOSITORY')
    private readonly cartItemRepository: Repository<CartItem>,
    @Inject('USERS_REPOSITORY')
    private readonly userRepository: Repository<User>,
    @Inject('PRODUCTS_REPOSITORY')
    private readonly productRepository: Repository<Product>,
    private readonly mailService: MailService,
  ) {}

  /**
   * Procesa la notificación del webhook de pago
   *
   * Este método recibe notificaciones del servicio payment-svc
   * cuando un pago es confirmado (PAID) o rechazado (FAILED).
   *
   * @param webhookData - Datos del webhook
   */
  async processPaymentWebhook(webhookData: PaymentWebhookDto): Promise<void> {
    this.logger.log(
      `[Webhook] Recibido evento de pago - Status: ${webhookData.status}, Cart ID: ${webhookData.cart_id}, Gateway: ${webhookData.gateway_code}`,
    );

    try {
      // TODO: Implementar lógica según el estado del pago
      if (webhookData.status === 'PAID') {
        await this.handlePaidPayment(webhookData);
      } else if (webhookData.status === 'FAILED') {
        await this.handleFailedPayment(webhookData);
      }

      this.logger.log(
        `[Webhook] Procesado exitosamente - Cart ID: ${webhookData.cart_id}`,
      );
    } catch (error) {
      this.logger.error(
        `[Webhook] Error procesando webhook - Cart ID: ${webhookData.cart_id}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Maneja pagos exitosos (PAID)
   *
   * Implementa:
   * - Obtener datos del carrito y comprador
   * - Obtener items del carrito con detalles de productos
   * - Enviar email de confirmación al comprador
   *
   * TODO pendientes:
   * - Actualizar estado del checkout en BD
   * - Crear orden a partir del carrito
   * - Generar guías de envío
   * - Actualizar inventario
   */
  private async handlePaidPayment(
    webhookData: PaymentWebhookDto,
  ): Promise<void> {
    this.logger.log(
      `[PAID] Procesando pago exitoso para cart: ${webhookData.cart_id}`,
    );

    try {
      // 1. Obtener el carrito con relación al usuario comprador
      const cart = await this.cartRepository.findOne({
        where: { id: webhookData.cart_id },
        relations: ['buyer'],
      });

      if (!cart) {
        throw new NotFoundException(
          `Cart not found: ${webhookData.cart_id}`,
        );
      }

      // 2. Obtener el usuario comprador
      const buyer = await this.userRepository.findOne({
        where: { id: cart.buyerUserId },
      });

      if (!buyer || !buyer.email) {
        this.logger.warn(
          `[PAID] Buyer not found or email missing for cart: ${webhookData.cart_id}`,
        );
        return;
      }

      // 3. Obtener los items del carrito con detalles de productos
      const cartItems = await this.cartItemRepository.find({
        where: { cartId: webhookData.cart_id },
        relations: ['product'],
      });

      if (cartItems.length === 0) {
        this.logger.warn(
          `[PAID] No items found for cart: ${webhookData.cart_id}`,
        );
        return;
      }

      // 4. Formatear los items para el email
      const formattedItems = cartItems.map((item) => {
        const unitPrice = parseInt(item.unitPriceMinor, 10);
        const formattedPrice = this.formatCurrency(
          unitPrice,
          item.currency,
        );

        return {
          productName: item.product?.name || 'Producto sin nombre',
          quantity: item.quantity,
          formattedPrice,
        };
      });

      // 5. Calcular el total
      const total = cartItems.reduce((sum, item) => {
        return sum + parseInt(item.unitPriceMinor, 10) * item.quantity;
      }, 0);

      const totalFormatted = this.formatCurrency(total, cart.currency);

      // 6. Preparar datos para el email
      const buyerName =
        cart.buyer?.email?.split('@')[0] || buyer.email.split('@')[0];

      const orderData = {
        cartId: cart.id,
        transactionId: webhookData.transaction_id,
        gatewayCode: webhookData.gateway_code.toUpperCase(),
        currency: cart.currency,
        items: formattedItems,
        totalFormatted,
      };

      // 7. Enviar email de confirmación
      await this.mailService.sendPaymentConfirmation(
        buyer.email,
        buyerName,
        orderData,
      );

      this.logger.log(
        `[PAID] Email de confirmación enviado a ${buyer.email} para cart: ${webhookData.cart_id}`,
      );

      // TODO: Implementar lógica adicional
      // - await this.checkoutsService.updateStatus(cartId, 'PAID');
      // - await this.ordersService.createFromCart(cartId);
      // - await this.shippingService.generateShippingLabels(cartId);
      // - await this.inventoryService.updateStock(cartId);
    } catch (error) {
      this.logger.error(
        `[PAID] Error procesando pago exitoso para cart: ${webhookData.cart_id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Formatea un monto en centavos a formato de moneda legible
   */
  private formatCurrency(amountMinor: number, currency: string): string {
    const amount = amountMinor / 100;

    // Formatear según la moneda
    const formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return formatter.format(amount);
  }

  /**
   * Maneja pagos fallidos (FAILED)
   *
   * TODO: Implementar la lógica específica:
   * - Actualizar estado del checkout en BD
   * - Enviar notificación al usuario
   * - Liberar inventario reservado (si aplica)
   */
  private async handleFailedPayment(
    webhookData: PaymentWebhookDto,
  ): Promise<void> {
    this.logger.log(
      `[FAILED] Procesando pago fallido para cart: ${webhookData.cart_id}`,
    );

    // TODO: Implementar lógica de pago fallido
    // Ejemplo:
    // - await this.checkoutsService.updateStatus(cartId, 'FAILED');
    // - await this.notificationsService.notifyPaymentFailure(cartId);
    // - await this.inventoryService.releaseReservation(cartId);
  }
}
