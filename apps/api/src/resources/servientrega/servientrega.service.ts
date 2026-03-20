import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DataSource, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { QuoteShippingDto } from './dto/quote-shipping.dto';
import { GenerateGuideDto, GenerateGuideResponse, GuideResult, ShippingDataDto } from './dto/generate-guide.dto';
import { CartItem } from '../cart-items/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { ArtisanShop } from '../artisan-shops/entities/artisan-shop.entity';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { MailService } from '../mail/mail.service';
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
  private readonly logger = new Logger(ServientregaService.name);
  private readonly authUrl: string;
  private readonly quoteUrl: string;
  private readonly soapUrl: string;
  private readonly soapActionCargue: string;
  private readonly soapActionSticker: string;
  private readonly login: string;
  private readonly password: string;
  private readonly codFacturacion: string;

  constructor(
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    @Inject('CART_ITEM_REPOSITORY')
    private readonly cartItemRepository: Repository<CartItem>,
    @Inject('PRODUCT_REPOSITORY')
    private readonly productRepository: Repository<Product>,
    @Inject('ARTISAN_SHOP_REPOSITORY')
    private readonly artisanShopRepository: Repository<ArtisanShop>,
    @Inject('USER_PROFILE_REPOSITORY')
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly mailService: MailService,
  ) {
    // Cargar credenciales desde variables de entorno
    this.authUrl =
      this.configService.get<string>('SERVIENTREGA_AUTH_URL') ||
      'http://web.servientrega.com:8058/CotizadorCorporativo/api/autenticacion/login';
    this.quoteUrl =
      this.configService.get<string>('SERVIENTREGA_QUOTE_URL') ||
      'http://web.servientrega.com:8058/CotizadorCorporativo/api/cotizacion/cotizar';
    this.soapUrl = this.configService.get<string>('SERVIENTREGA_SOAP_URL') || '';
    this.soapActionCargue = this.configService.get<string>('SERVIENTREGA_SOAP_ACTION_CARGUE') || '';
    this.soapActionSticker = this.configService.get<string>('SERVIENTREGA_SOAP_ACTION_STICKER') || '';
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

    try {
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
        this.httpService.post<ServientregaQuoteResponse>(
          this.quoteUrl,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
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
      error = error || 'Cotización no disponible, usando tarifa estándar';
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
          : item.price > 0
            ? item.price
            : 50000;

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

  /**
   * ========================================
   * MÉTODOS DE GENERACIÓN DE GUÍAS
   * ========================================
   */

  /**
   * Genera guías de Servientrega para un carrito (llamado después del pago)
   */
  async generateGuides(dto: GenerateGuideDto): Promise<GenerateGuideResponse> {
    this.logger.log(`[Servientrega] Iniciando generación de guías para cart: ${dto.cart_id}`);

    try {
      // 1. Obtener items del carrito con productos y tiendas
      const cartItems = await this.cartItemRepository.find({
        where: { cartId: dto.cart_id },
        relations: ['product'],
      });

      if (cartItems.length === 0) {
        return {
          success: false,
          guides: [],
          error: 'No se encontraron items en el carrito',
        };
      }

      this.logger.log(`[Servientrega] Encontrados ${cartItems.length} items`);

      // 2. Agrupar items por tienda
      const itemsByShop = await this.groupItemsByShopForGuides(cartItems);
      this.logger.log(`[Servientrega] Items agrupados en ${itemsByShop.size} tiendas`);

      // 3. Generar guía para cada tienda
      const guides: GuideResult[] = [];
      for (const [shopId, group] of itemsByShop) {
        try {
          const guideResult = await this.generateGuideForShop(shopId, group, dto.shipping_data);
          guides.push(guideResult);
        } catch (error) {
          this.logger.error(`[Servientrega] Error generando guía para tienda ${shopId}`, error instanceof Error ? error.stack : String(error));
          guides.push({
            shop_id: shopId,
            shop_name: group.shop.shopName,
            num_guia: null,
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
          });
        }
      }

      const allSuccess = guides.length > 0 && guides.every((g) => g.success);
      const someSuccess = guides.some((g) => g.success);

      this.logger.log(`[Servientrega] Completado. Éxito: ${allSuccess || someSuccess}`);

      return {
        success: allSuccess || someSuccess,
        guides,
      };
    } catch (error) {
      this.logger.error('[Servientrega] Error en generateGuides', error instanceof Error ? error.stack : String(error));
      return {
        success: false,
        guides: [],
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Agrupa items del carrito por tienda (para generación de guías)
   */
  private async groupItemsByShopForGuides(cartItems: CartItem[]): Promise<Map<string, any>> {
    const itemsByShop = new Map<string, any>();

    for (const item of cartItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product || !product.shopId) {
        this.logger.warn(`[Servientrega] Producto ${item.productId} sin tienda`);
        continue;
      }

      if (!itemsByShop.has(product.shopId)) {
        const shop = await this.hydrateArtisanShop(product.shopId);
        itemsByShop.set(product.shopId, {
          shop,
          items: [],
          totalValue: 0,
          totalWeight: 0,
          maxDimensions: { width: 20, height: 20, length: 20 },
        });
      }

      const group = itemsByShop.get(product.shopId)!;
      group.items.push({ ...item, product });

      // Calcular valores
      const unitPrice = parseInt(item.unitPriceMinor, 10) / 100;
      group.totalValue += unitPrice * item.quantity;
      group.totalWeight += (product.weight || 1) * item.quantity;

      // Actualizar dimensiones máximas
      if (product.dimensions) {
        const dims = product.dimensions as any;
        group.maxDimensions.width = Math.max(group.maxDimensions.width, dims.width || 20);
        group.maxDimensions.height = Math.max(group.maxDimensions.height, dims.height || 20);
        group.maxDimensions.length = Math.max(group.maxDimensions.length, dims.length || 20);
      }
    }

    return itemsByShop;
  }

  /**
   * Obtiene datos completos de una tienda artesanal (con contacto)
   */
  private async hydrateArtisanShop(shopId: string): Promise<any> {
    const shop = await this.artisanShopRepository.findOne({
      where: { id: shopId },
    });

    if (!shop) {
      throw new Error(`Shop ${shopId} not found`);
    }

    const shopWithContact: any = { ...shop };

    // Extraer contacto de contactInfo (JSONB)
    if (shop.contactInfo) {
      const contactInfo = shop.contactInfo as Record<string, any>;
      shopWithContact.phone = contactInfo.phone || contactInfo.telefono || contactInfo.celular || contactInfo.whatsapp;
      shopWithContact.email = contactInfo.email || contactInfo.correo;
      shopWithContact.address = contactInfo.address || contactInfo.direccion;
    }

    return shopWithContact;
  }

  /**
   * Genera una guía para una tienda específica
   */
  private async generateGuideForShop(shopId: string, group: any, shippingData: ShippingDataDto): Promise<GuideResult> {
    // Construir descripción de productos (max 20 chars)
    const productNames = group.items
      .map((i: any) => i.product?.name || 'Artesania')
      .join(', ')
      .substring(0, 20);

    const declaredValue = Math.max(30000, group.totalValue);
    const weight = Math.max(1, group.totalWeight);

    // Construir SOAP envelope
    const soapEnvelope = this.buildSoapEnvelope(
      shippingData,
      group.shop,
      declaredValue,
      productNames,
      weight,
      group.maxDimensions,
    );

    this.logger.log(`[Servientrega] Enviando solicitud SOAP para tienda ${shopId}`);

    // Llamar a la API SOAP
    const response = await fetch(this.soapUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: this.soapActionCargue,
      },
      body: soapEnvelope,
    });

    const responseText = await response.text();
    this.logger.log(`[Servientrega] Response status: ${response.status}`);
    this.logger.log(`[Servientrega] Response text: ${responseText}`);
    this.logger.log(`[Servientrega] SOAP URL: ${this.soapUrl}`);
    this.logger.log(`[Servientrega] SOAP Action: ${this.soapActionCargue}`);


    if (!response.ok) {
      return {
        shop_id: shopId,
        shop_name: group.shop.shopName,
        num_guia: null,
        success: false,
        error: `HTTP ${response.status}`,
      };
    }

    // Parsear número de guía
    const numGuia = this.parseGuideFromResponse(responseText);

    if (!numGuia) {
      return {
        shop_id: shopId,
        shop_name: group.shop.shopName,
        num_guia: null,
        success: false,
        error: 'No se encontró número de guía',
      };
    }

    this.logger.log(`[Servientrega] Guía generada: ${numGuia}`);

    // Obtener PDF del sticker
    const stickerBytes = await this.fetchGuideSticker(numGuia);

    // Enviar notificaciones
    await this.sendNotifications(numGuia, group.shop, shippingData, stickerBytes);

    return {
      shop_id: shopId,
      shop_name: group.shop.shopName,
      num_guia: numGuia,
      success: true,
    };
  }

  /**
   * Construye el SOAP envelope para generar guía
   */
  private buildSoapEnvelope(
    shippingData: ShippingDataDto,
    shop: any,
    productValue: number,
    productDescription: string,
    weight: number,
    dimensions: { width: number; height: number; length: number },
  ): string {
    const destCityCode = `${shippingData.dane_ciudad}000`;
    const destDeptCode = String(shippingData.dane_ciudad).substring(0, 2);
    const originRegion = shop.region || '11001';
    const originCityCode = `${originRegion}000`;
    const originDeptCode = originRegion.substring(0, 2);

    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/">
   <soap:Header>
      <tem:AuthHeader>
         <tem:login>${this.login}</tem:login>
         <tem:pwd>${this.password}</tem:pwd>
         <tem:Id_CodFacturacion>${this.codFacturacion}</tem:Id_CodFacturacion>
         <tem:Nombre_Cargue>TELAR MARKETPLACE</tem:Nombre_Cargue>
      </tem:AuthHeader>
   </soap:Header>
   <soap:Body>
      <tem:CargueMasivoExterno>
         <tem:envios>
            <tem:CargueMasivoExternoDTO>
               <tem:objEnvios>
                  <tem:EnviosExterno id_zonificacion="?" des_codigopostal="?">
                     <tem:Num_Guia>0</tem:Num_Guia>
                     <tem:Ide_CodFacturacion>${this.codFacturacion}</tem:Ide_CodFacturacion>
                     <tem:Des_FormaPago>2</tem:Des_FormaPago>
                     <tem:Num_Piezas>1</tem:Num_Piezas>
                     <tem:Num_Alto>${dimensions.height}</tem:Num_Alto>
                     <tem:Num_Ancho>${dimensions.width}</tem:Num_Ancho>
                     <tem:Num_Largo>${dimensions.length}</tem:Num_Largo>
                     <tem:Num_PesoTotal>${weight}</tem:Num_PesoTotal>
                     <tem:Num_ValorDeclaradoTotal>${productValue}</tem:Num_ValorDeclaradoTotal>
                     <tem:Num_VlrFlete>${shippingData.valor_flete || 0}</tem:Num_VlrFlete>
                     <tem:Des_Telefono>${shippingData.phone}</tem:Des_Telefono>
                     <tem:Des_Ciudad>${destCityCode}</tem:Des_Ciudad>
                     <tem:Des_DepartamentoDestino>${destDeptCode}</tem:Des_DepartamentoDestino>
                     <tem:Des_Direccion>${shippingData.address}</tem:Des_Direccion>
                     <tem:Nom_Contacto>${shippingData.full_name}</tem:Nom_Contacto>
                     <tem:Des_DiceContener>${productDescription}</tem:Des_DiceContener>
                     <tem:Des_CorreoElectronico>${shippingData.email}</tem:Des_CorreoElectronico>
                     <tem:Des_CiudadRemitente>${originCityCode}</tem:Des_CiudadRemitente>
                     <tem:Des_DireccionRemitente>${shop.address || 'TELAR MARKETPLACE'}</tem:Des_DireccionRemitente>
                     <tem:Num_TelefonoRemitente>${shop.phone || '3000000000'}</tem:Num_TelefonoRemitente>
                     <tem:nombrecontacto_remitente>${shop.shopName}</tem:nombrecontacto_remitente>
                     <tem:correo_remitente>${shop.email || 'ventas@telar.co'}</tem:correo_remitente>
                  </tem:EnviosExterno>
               </tem:objEnvios>
            </tem:CargueMasivoExternoDTO>
         </tem:envios>
      </tem:CargueMasivoExterno>
   </soap:Body>
</soap:Envelope>`;
  }

  /**
   * Parsea el número de guía de la respuesta SOAP
   */
  private parseGuideFromResponse(xmlResponse: string): string | null {
    const numGuiaMatch = xmlResponse.match(/<Num_Guia>(\d+)<\/Num_Guia>/);
    if (numGuiaMatch && numGuiaMatch[1] && numGuiaMatch[1] !== '0') {
      return numGuiaMatch[1];
    }
    const arrayGuiasMatch = xmlResponse.match(/<string>(\d+)<\/string>/);
    if (arrayGuiasMatch && arrayGuiasMatch[1]) {
      return arrayGuiasMatch[1];
    }
    return null;
  }

  /**
   * Obtiene el PDF del sticker
   */
  private async fetchGuideSticker(numGuia: string): Promise<Buffer | null> {
    this.logger.log(`[Servientrega] Obteniendo PDF para guía: ${numGuia}`);

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
   <soapenv:Header>
      <tem:AuthHeader>
         <tem:login>${this.login}</tem:login>
         <tem:pwd>${this.password}</tem:pwd>
         <tem:Id_CodFacturacion>${this.codFacturacion}</tem:Id_CodFacturacion>
      </tem:AuthHeader>
   </soapenv:Header>
   <soapenv:Body>
      <tem:GenerarGuiaSticker>
         <tem:num_Guia>${numGuia}</tem:num_Guia>
         <tem:num_GuiaFinal>${numGuia}</tem:num_GuiaFinal>
         <tem:ide_CodFacturacion>${this.codFacturacion}</tem:ide_CodFacturacion>
         <tem:sFormatoImpresionGuia>4</tem:sFormatoImpresionGuia>
      </tem:GenerarGuiaSticker>
   </soapenv:Body>
</soapenv:Envelope>`;

    try {
      const response = await fetch(this.soapUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: this.soapActionSticker,
        },
        body: soapEnvelope,
      });

      const responseText = await response.text();

      if (!response.ok) {
        this.logger.warn(`[Servientrega] Error obteniendo PDF: HTTP ${response.status}`);
        return null;
      }

      const bytesMatch = responseText.match(/<bytesReport>([^<]+)<\/bytesReport>/);
      if (bytesMatch && bytesMatch[1]) {
        return Buffer.from(bytesMatch[1], 'base64');
      }

      return null;
    } catch (error) {
      this.logger.error('[Servientrega] Error obteniendo PDF', error);
      return null;
    }
  }

  /**
   * Envía notificaciones por email
   */
  private async sendNotifications(
    numGuia: string,
    shop: any,
    shippingData: ShippingDataDto,
    pdfBytes: Buffer | null,
  ): Promise<void> {
    // Email al destinatario (comprador)
    try {
      await this.mailService.sendShippingNotificationToRecipient(
        shippingData.email,
        shippingData.full_name,
        numGuia,
        shop.shopName,
      );
      this.logger.log(`[Servientrega] Email enviado al destinatario: ${shippingData.email}`);
    } catch (error) {
      this.logger.error('[Servientrega] Error enviando email al destinatario', error);
    }

    // Email al artesano con PDF
    if (shop.email) {
      try {
        let artisanName = shop.shopName;
        if (shop.userId) {
          const userProfile = await this.userProfileRepository.findOne({
            where: { id: shop.userId },
          });
          if (userProfile?.fullName) {
            artisanName = userProfile.fullName;
          }
        }

        await this.mailService.sendShippingNotificationToArtisan(
          shop.email,
          artisanName,
          shop.shopName,
          numGuia,
          shippingData.full_name,
          shippingData.desc_ciudad,
          pdfBytes,
        );
        this.logger.log(`[Servientrega] Email enviado al artesano: ${shop.email}`);
      } catch (error) {
        this.logger.error('[Servientrega] Error enviando email al artesano', error);
      }
    }
  }
}
