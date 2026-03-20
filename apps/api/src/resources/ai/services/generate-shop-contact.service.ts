import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { OpenAIService } from './openai.service';
import {
  GenerateShopContactDto,
  GenerateShopContactResponse,
} from '../dto/generate-shop-contact.dto';

@Injectable()
export class GenerateShopContactService {
  private readonly logger = new Logger(GenerateShopContactService.name);

  constructor(private readonly openaiService: OpenAIService) {}

  /**
   * Genera textos profesionales para la página de contacto de una tienda
   */
  async generateContactContent(
    dto: GenerateShopContactDto,
  ): Promise<GenerateShopContactResponse> {
    this.logger.log(
      `Generando contenido de contacto para: ${dto.shopName} (${dto.craftType})`,
    );

    const prompt = this.buildPrompt(dto);

    try {
      const response = await this.openaiService.chatCompletion({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'Eres un experto en copywriting para tiendas artesanales. Generas textos cálidos, profesionales y acogedores que invitan a la comunicación.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      const result = this.parseResponse(response, dto);

      this.logger.log(
        `Contenido de contacto generado para: ${dto.shopName}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error generando contenido de contacto para ${dto.shopName}`,
        error instanceof Error ? error.stack : String(error),
      );

      // Retornar valores por defecto en caso de error
      return this.getFallbackContent(dto);
    }
  }

  /**
   * Construye el prompt para OpenAI
   */
  private buildPrompt(dto: GenerateShopContactDto): string {
    const claimContext = dto.brandClaim
      ? `El claim de marca es: "${dto.brandClaim}". `
      : '';
    const regionContext = dto.region
      ? `La tienda está ubicada en ${dto.region}. `
      : '';

    return `Genera textos profesionales y acogedores para la página de contacto de "${dto.shopName}", una tienda de ${dto.craftType}. ${regionContext}${claimContext}

Los textos deben ser cálidos, invitar a la comunicación y reflejar la personalidad artesanal de la marca.

Responde SOLO con un JSON válido en este formato exacto:
{
  "welcomeMessage": "mensaje de bienvenida cálido y personal (80-120 palabras, invitando al cliente a contactar)",
  "formIntroText": "texto breve antes del formulario de contacto (40-60 palabras, explicando qué tipo de consultas pueden hacer)",
  "suggestedHours": "horario de atención sugerido apropiado para este tipo de negocio artesanal (ej: 'Lun-Vie 9:00-18:00, Sáb 10:00-14:00')",
  "contactPageTitle": "título atractivo para la página de contacto (ej: 'Conecta con Nosotros', 'Hablemos', 'Estamos Aquí para Ti')"
}`;
  }

  /**
   * Parsea y valida la respuesta de OpenAI
   */
  private parseResponse(
    response: string,
    dto: GenerateShopContactDto,
  ): GenerateShopContactResponse {
    try {
      const parsed = JSON.parse(response);

      // Validar que tenga todos los campos requeridos
      if (
        !parsed.welcomeMessage ||
        !parsed.formIntroText ||
        !parsed.suggestedHours ||
        !parsed.contactPageTitle
      ) {
        throw new Error('Respuesta incompleta de OpenAI');
      }

      return parsed as GenerateShopContactResponse;
    } catch (parseError) {
      this.logger.warn(
        'Error parseando respuesta de OpenAI, usando contenido de fallback',
        parseError instanceof Error ? parseError.message : String(parseError),
      );

      return this.getFallbackContent(dto);
    }
  }

  /**
   * Retorna contenido de fallback en caso de error
   */
  private getFallbackContent(
    dto: GenerateShopContactDto,
  ): GenerateShopContactResponse {
    return {
      welcomeMessage: `¡Bienvenido a ${dto.shopName}! Nos encantaría saber de ti. Ya sea que tengas preguntas sobre nuestros productos de ${dto.craftType}, quieras hacer un pedido personalizado o simplemente quieras conocer más sobre nuestro trabajo artesanal, estamos aquí para ayudarte. Cada pieza que creamos es única y especial, y nos apasiona compartir nuestra historia contigo. No dudes en contactarnos, estaremos encantados de atenderte.`,
      formIntroText: `Completa el formulario a continuación y nos pondremos en contacto contigo lo antes posible. Cuéntanos qué necesitas y cómo podemos ayudarte con tus proyectos de ${dto.craftType}.`,
      suggestedHours: 'Lun-Vie 9:00-18:00, Sáb 10:00-14:00',
      contactPageTitle: 'Contáctanos',
    };
  }
}
