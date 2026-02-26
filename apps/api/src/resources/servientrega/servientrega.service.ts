import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DataSource } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { QuoteShippingDto } from './dto/quote-shipping.dto';
import {
  ServientregaAuthResponse,
  ServientregaQuoteRequest,
  ServientregaQuoteResponse,
  ShopGroup,
  ShopQuoteResult,
  QuoteShippingResponse,
  ServientregaPiece,
} from './interfaces/servientrega.interface';

@Injectable()
export class ServientregaService {
  private readonly authUrl: string;
  private readonly quoteUrl: string;
  private readonly login: string;
  private readonly password: string;
  private readonly codFacturacion: string;

  constructor(
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    // Cargar credenciales desde variables de entorno
    this.authUrl =
      this.configService.get<string>('SERVIENTREGA_AUTH_URL') ||
      'http://web.servientrega.com:8058/CotizadorCorporativo/api/autenticacion/login';
    this.quoteUrl =
      this.configService.get<string>('SERVIENTREGA_QUOTE_URL') ||
      'http://web.servientrega.com:8058/CotizadorCorporativo/api/cotizacion/cotizar';
    this.login = this.configService.get<string>('SERVIENTREGA_LOGIN') || '';
    this.password =
      this.configService.get<string>('SERVIENTREGA_PASSWORD') || '';
    this.codFacturacion =
      this.configService.get<string>('SERVIENTREGA_COD_FACTURACION') || '';
  }

  /**
   * Autenticar con Servientrega y obtener token
   */
  private async getServientregaToken(): Promise<string> {
    const payload = {
      login: this.login,
      password: this.password,
      codFacturacion: this.codFacturacion,
    };

    console.log('Payload:', payload);

    try {

       console.log('AuthUrl Servientrega :', this.authUrl);
      const response = await firstValueFrom(
        this.httpService.post<ServientregaAuthResponse>(this.authUrl, payload),
      );



      if (!response.data || !response.data.token) {
        throw new Error('No se recibió token de Servientrega');
      }

      return response.data.token;
    } catch (error: any) {
      throw new Error(`Error autenticando con Servientrega: ${error.message}`);
    }
  }

  /**
   * Cotizar envío para un grupo de productos (tienda específica)
   */
  private async quoteForShop(
    token: string,
    shopGroup: ShopGroup,
    destinationCity: string,
  ): Promise<ShopQuoteResult> {
    const payload: ServientregaQuoteRequest = {
      IdProducto: 2, // Entrega en punto
      NumeroPiezas: shopGroup.itemsCount,
      Piezas: shopGroup.pieces,
      ValorDeclarado: shopGroup.totalValue,
      IdDaneCiudadOrigen: `${shopGroup.originCity}000`,
      IdDaneCiudadDestino: `${destinationCity}000`,
      EnvioConCobro: false,
      FormaPago: 2, // Crédito
      TiempoEntrega: 1, // Normal
      MedioTransporte: 1, // Terrestre
      NumRecaudo: 123456,
    };

    let shippingCost = 0;
    let estimatedDays = 5;
    let error: string | undefined;
    let rawResponse: ServientregaQuoteResponse | undefined;

    try {
      const response = await firstValueFrom(
        this.httpService.post<ServientregaQuoteResponse>(this.quoteUrl, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      rawResponse = response.data;

      // Extraer costo de envío (Servientrega puede usar diferentes campos)
      if (rawResponse.ValorFlete) {
        shippingCost = parseFloat(rawResponse.ValorFlete.toString()) || 0;
      } else if (rawResponse.valorTotal) {
        shippingCost = parseFloat(rawResponse.valorTotal.toString()) || 0;
      } else if (rawResponse.valor) {
        shippingCost = parseFloat(rawResponse.valor.toString()) || 0;
      }

      // Extraer tiempo de entrega
      if (rawResponse.TiempoEntrega) {
        estimatedDays = parseInt(rawResponse.TiempoEntrega.toString()) || 5;
      }
    } catch (err: any) {
      error = err.message;
      rawResponse = { error: err.message };
    }

    // Si no hay costo válido, usar tarifa por defecto
    if (shippingCost <= 0) {
      shippingCost = 15000; // Default 15,000 COP
      error =
        error || 'Cotización no disponible, usando tarifa estándar';
    }

    return {
      shopId: shopGroup.shopId,
      shopName: shopGroup.shopName,
      originCity: shopGroup.originCity,
      destinationCity,
      shippingCost,
      estimatedDays,
      error,
      rawResponse,
    };
  }

  /**
   * Cotizar envío para un carrito
   */
  async quoteShipping(dto: QuoteShippingDto): Promise<QuoteShippingResponse> {
    const { cart_id, idCityDestino } = dto;

    try {
      // 1. Autenticar con Servientrega
      const token = await this.getServientregaToken();

      // 2. Obtener items del carrito con productos
      const cartItemsQuery = `
        SELECT
          ci.quantity,
          ci.product_id,
          ci.seller_shop_id,
          ci.unit_price_minor,
          ci.currency,
          p.name as product_name,
          p.weight,
          p.price,
          p.dimensions,
          s.shop_name,
          s.department,
          s.municipality
        FROM payments.cart_items ci
        INNER JOIN shop.products p ON ci.product_id = p.id
        INNER JOIN shop.artisan_shops s ON ci.seller_shop_id = s.id
        WHERE ci.cart_id = $1
      `;

      const cartItems = await this.dataSource.query(cartItemsQuery, [cart_id]);

      if (!cartItems || cartItems.length === 0) {
        return {
          success: false,
          cart_id,
          destination_city: idCityDestino,
          quotes: [],
          totalShipping: 0,
          error: 'El carrito está vacío o no existe',
        };
      }

      // 3. Agrupar productos por tienda
      const shopsMap = new Map<string, ShopGroup>();

      for (const item of cartItems) {
        const shopId = item.seller_shop_id || 'default';
        const shopName = item.shop_name || shopId;

        // Mapear department a código DANE (simplificado - en producción usar tabla de códigos)
        // Por ahora usar Bogotá por defecto
        const originCity = '11001'; // TODO: Mapear department/municipality a código DANE

        if (!shopsMap.has(shopId)) {
          shopsMap.set(shopId, {
            shopId,
            shopName,
            originCity,
            totalValue: 0,
            itemsCount: 0,
            pieces: [],
          });
        }

        const group = shopsMap.get(shopId)!;

        // Calcular valor total (precio * cantidad)
        // unit_price_minor está en centavos (menores), dividir por 100
        const priceInPesos = item.unit_price_minor
          ? parseInt(item.unit_price_minor) / 100
          : (item.price > 0 ? item.price : 50000);

        group.totalValue += priceInPesos * item.quantity;

        // Asegurar valor mínimo de 30000 COP
        if (group.totalValue < 30000) {
          group.totalValue = 30000;
        }

        // Obtener dimensiones del producto (jsonb: { width, height, length })
        const dimensions = item.dimensions || {};
        const largo = dimensions.length > 0 ? dimensions.length : 20;
        const ancho = dimensions.width > 0 ? dimensions.width : 20;
        const alto = dimensions.height > 0 ? dimensions.height : 20;

        // Agregar piezas (una por cada unidad)
        for (let i = 0; i < item.quantity; i++) {
          group.itemsCount += 1;
          group.pieces.push({
            Peso: item.weight > 0 ? item.weight : 1, // Usar peso real o default 1 kg
            Largo: largo,
            Ancho: ancho,
            Alto: alto,
          });
        }
      }

      // 4. Cotizar con Servientrega para cada tienda
      const quotesPromises = Array.from(shopsMap.values()).map((group) =>
        this.quoteForShop(token, group, idCityDestino),
      );

      const quotesResults = await Promise.all(quotesPromises);

      // 5. Calcular total
      const totalShipping = quotesResults.reduce(
        (sum, quote) => sum + quote.shippingCost,
        0,
      );

      return {
        success: true,
        cart_id,
        destination_city: idCityDestino,
        quotes: quotesResults,
        totalShipping,
      };
    } catch (error: any) {
      return {
        success: false,
        cart_id,
        destination_city: idCityDestino,
        quotes: [],
        totalShipping: 0,
        error: error.message || 'Error interno del servidor',
      };
    }
  }
}
