import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { OpenAIService } from './openai.service';
import {
  GenerateShopHeroSlideDto,
  GenerateShopHeroSlideResponse,
} from '../dto/generate-shop-hero-slide.dto';

@Injectable()
export class GenerateShopHeroSlideService {
  private readonly logger = new Logger(GenerateShopHeroSlideService.name);

  constructor(private readonly openaiService: OpenAIService) {}

  /**
   * Genera slides de hero culturalmente precisos para una tienda artesanal
   */
  async generateHeroSlides(
    dto: GenerateShopHeroSlideDto,
  ): Promise<GenerateShopHeroSlideResponse> {
    const count = dto.count || 1;

    this.logger.log(
      `Generando ${count} slides de hero para: ${dto.shopName} (${dto.craftType})`,
    );

    const prompt = this.buildPrompt(dto, count);

    try {
      const response = await this.openaiService.chatCompletion({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      });

      const result = this.parseResponse(response, dto);

      this.logger.log(
        `${result.slides.length} slides generados para: ${dto.shopName}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error generando slides para ${dto.shopName}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Error al generar los slides de hero',
      );
    }
  }

  /**
   * System prompt que enfatiza precisión cultural
   */
  private getSystemPrompt(): string {
    return `Eres un experto en copywriting para tiendas artesanales con profundo respeto por las tradiciones culturales.
Tu especialidad es crear textos que honren la autenticidad y especificidad cultural de cada artesano.

PRINCIPIOS CLAVE:
- Ser culturalmente preciso y específico
- Nunca usar términos genéricos cuando existe terminología específica
- Respetar y destacar el origen cultural auténtico
- Mencionar técnicas, comunidades o características únicas cuando sea relevante
- Evitar descripciones vagas que puedan confundirse con otras culturas
- Los textos deben ser emotivos pero siempre auténticos`;
  }

  /**
   * Construye el prompt con todo el contexto
   */
  private buildPrompt(dto: GenerateShopHeroSlideDto, count: number): string {
    const colorContext =
      dto.brandColors && dto.brandColors.length > 0
        ? `Los colores de marca son: ${dto.brandColors.join(', ')}. `
        : '';

    const claimContext = dto.brandClaim
      ? `El claim de marca es: "${dto.brandClaim}". `
      : '';

    const productsContext =
      dto.products && dto.products.length > 0
        ? `Productos destacados: ${dto.products
            .map((p) => `"${p.name}" - ${p.description}`)
            .join(', ')}. `
        : '';

    const culturalContextSection = dto.culturalContext
      ? `\n\nCONTEXTO CULTURAL DEL ARTESANO (RESPETAR FIELMENTE):\n${dto.culturalContext}\n`
      : '';

    return `Genera ${count} slides de hero para una tienda artesanal llamada "${dto.shopName}" que se especializa en ${dto.craftType}. ${dto.description}. ${colorContext}${claimContext}${productsContext}${culturalContextSection}

INSTRUCCIONES CRÍTICAS:
- Los títulos y subtítulos DEBEN ser culturalmente precisos y específicos
- Si el artesano hace "mochilas arhuacas", NO usar términos genéricos como "tejidos tradicionales"
- Usar la terminología específica de la región y cultura mencionada en el contexto
- Mencionar técnicas, comunidades o características únicas cuando sea relevante
- Destacar la autenticidad y el origen cultural específico
- Evitar descripciones vagas o que puedan confundirse con otras culturas

Cada slide debe ser único y destacar diferentes aspectos:
1. Primer slide: Presentación de marca con origen cultural específico
2. Segundo slide: Productos específicos con técnicas tradicionales
3. Tercer slide: Call to action destacando autenticidad cultural

Responde SOLO con un JSON válido en este formato exacto:
{
  "slides": [
    {
      "title": "título específico y culturalmente preciso (máximo 50 caracteres)",
      "subtitle": "descripción que mencione técnicas, región o características únicas (máximo 100 caracteres)",
      "ctaText": "texto del botón de acción",
      "ctaLink": "#productos",
      "suggestedImage": "descripción detallada de la imagen ideal, mencionando patrones, colores y estilo cultural específico"
    }
  ]
}`;
  }

  /**
   * Parsea y valida la respuesta de OpenAI
   */
  private parseResponse(
    response: string,
    dto: GenerateShopHeroSlideDto,
  ): GenerateShopHeroSlideResponse {
    try {
      const parsed = JSON.parse(response);

      // Validar que tenga slides
      if (!parsed.slides || !Array.isArray(parsed.slides)) {
        throw new Error('Respuesta sin slides válidos');
      }

      // Validar que cada slide tenga los campos requeridos
      for (const slide of parsed.slides) {
        if (
          !slide.title ||
          !slide.subtitle ||
          !slide.ctaText ||
          !slide.ctaLink ||
          !slide.suggestedImage
        ) {
          throw new Error('Slide incompleto en la respuesta');
        }
      }

      return parsed as GenerateShopHeroSlideResponse;
    } catch (parseError) {
      this.logger.error(
        'Error parseando respuesta de OpenAI',
        parseError instanceof Error ? parseError.message : String(parseError),
      );

      throw new InternalServerErrorException(
        'Error al procesar la respuesta de IA',
      );
    }
  }
}
