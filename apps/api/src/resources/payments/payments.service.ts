import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart-items/entities/cart-item.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CartShippingInfo } from '../cart-shipping-info/entities/cart-shipping-info.entity';
import { MailService } from '../mail/mail.service';
import { ServientregaService } from '../servientrega/servientrega.service';

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
    @Inject('CART_SHIPPING_INFO_REPOSITORY')
    private readonly cartShippingInfoRepository: Repository<CartShippingInfo>,
    private readonly mailService: MailService,
    private readonly servientregaService: ServientregaService,
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
      `[Webhook] Recibido evento de pago - Status: ${webhookData.status}, Cart ID: ${webhookData.cart_id}`,
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

      // 8. Generar guías de envío con Servientrega
      await this.generateShippingGuides(webhookData.cart_id);

      // TODO: Implementar lógica adicional
      // - await this.checkoutsService.updateStatus(cartId, 'PAID');
      // - await this.ordersService.createFromCart(cartId);
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

  /**
   * Genera guías de envío con Servientrega después de un pago exitoso
   */
  private async generateShippingGuides(cartId: string): Promise<void> {
    try {
      this.logger.log(
        `[Servientrega] Iniciando generación de guías para cart: ${cartId}`,
      );

      // 1. Obtener información de envío
      const shippingInfo = await this.cartShippingInfoRepository.findOne({
        where: { cartId },
      });

      if (!shippingInfo) {
        this.logger.warn(
          `[Servientrega] No se encontró información de envío para cart: ${cartId}`,
        );
        return;
      }

      // 2. Convertir los valores de flete de string a number (están en menores/centavos)
      const valorFlete = shippingInfo.valorFleteMinor
        ? parseInt(shippingInfo.valorFleteMinor, 10) / 100
        : null;
      const valorSobreFlete = shippingInfo.valorSobreFleteMinor
        ? parseInt(shippingInfo.valorSobreFleteMinor, 10) / 100
        : null;
      const valorTotalFlete = shippingInfo.valorTotalFleteMinor
        ? parseInt(shippingInfo.valorTotalFleteMinor, 10) / 100
        : null;

      // 3. Preparar datos para Servientrega
      const generateGuideDto = {
        cart_id: cartId,
        shipping_data: {
          id: shippingInfo.id,
          cart_id: cartId,
          full_name: shippingInfo.fullName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          dane_ciudad: shippingInfo.daneCiudad,
          desc_ciudad: shippingInfo.descCiudad,
          desc_depart: shippingInfo.descDepart,
          postal_code: shippingInfo.postalCode,
          desc_envio: shippingInfo.descEnvio,
          valor_flete: valorFlete ?? undefined,
          valor_sobre_flete: valorSobreFlete ?? undefined,
          valor_total_flete: valorTotalFlete ?? undefined,
        },
      };

      // 4. Llamar al servicio de Servientrega
      const result = await this.servientregaService.generateGuides(
        generateGuideDto,
      );

      if (result.success && result.guides.length > 0) {
        // 5. Actualizar números de guía en shipping_info
        const guideNumbers = result.guides
          .filter((g) => g.success && g.num_guia)
          .map((g) => g.num_guia)
          .join(', ');

        if (guideNumbers) {
          await this.cartShippingInfoRepository.update(
            { cartId },
            { numGuia: guideNumbers },
          );

          this.logger.log(
            `[Servientrega] Guías generadas y guardadas: ${guideNumbers} para cart: ${cartId}`,
          );
        }
      } else {
        this.logger.warn(
          `[Servientrega] No se generaron guías exitosas para cart: ${cartId}`,
        );
      }
    } catch (error) {
      // No lanzar el error para no interrumpir el flujo del pago
      // Las guías pueden generarse manualmente si falla
      this.logger.error(
        `[Servientrega] Error generando guías para cart: ${cartId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
