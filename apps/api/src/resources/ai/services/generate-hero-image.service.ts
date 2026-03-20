import {
  Injectable,
  Logger,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OpenAIService } from './openai.service';
import {
  GenerateHeroImageDto,
  GenerateHeroImageResponse,
} from '../dto/generate-hero-image.dto';

@Injectable()
export class GenerateHeroImageService {
  private readonly logger = new Logger(GenerateHeroImageService.name);

  constructor(private readonly openaiService: OpenAIService) {}

  /**
   * Genera una imagen hero culturalmente precisa para un slide de tienda artesanal
   */
  async generateHeroImage(
    dto: GenerateHeroImageDto,
  ): Promise<GenerateHeroImageResponse> {
    const slideIndex = dto.slideIndex ?? 0;

    this.logger.log(
      `Generando imagen hero ${slideIndex + 1} para: ${dto.shopName} - "${dto.title}"`,
    );

    const prompt = this.buildPrompt(dto);

    try {
      // Llamar a DALL-E 3 de OpenAI
      const imageUrl = await this.openaiService.generateImage({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1792x1024', // Horizontal banner (closest to 1536x1024)
        quality: 'hd',
        style: 'natural', // More realistic, photographic style
      });

      this.logger.log(`Imagen generada, descargando desde URL: ${imageUrl}`);

      // Descargar la imagen y convertirla a base64
      const imageBase64 = await this.downloadImageAsBase64(imageUrl);

      this.logger.log(
        `Imagen hero ${slideIndex + 1} generada exitosamente para: ${dto.shopName}`,
      );

      return {
        imageBase64,
        slideIndex,
      };
    } catch (error) {
      this.logger.error(
        `Error generando imagen hero para ${dto.shopName}`,
        error instanceof Error ? error.stack : String(error),
      );

      // Manejar errores específicos de OpenAI
      if (error instanceof Error) {
        if (error.message.includes('Rate limit')) {
          throw new HttpException(
            {
              error: 'RATE_LIMIT',
              message:
                'Límite de generación alcanzado. Intenta de nuevo en unos momentos.',
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        if (error.message.includes('insufficient_quota')) {
          throw new HttpException(
            {
              error: 'NO_CREDITS',
              message: 'Sin créditos disponibles. Por favor, recarga tu cuenta.',
            },
            HttpStatus.PAYMENT_REQUIRED,
          );
        }

        if (error.message.includes('content_policy_violation')) {
          throw new HttpException(
            {
              error: 'CONTENT_POLICY_VIOLATION',
              message:
                'El contenido solicitado viola las políticas de uso. Intenta con una descripción diferente.',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      throw new InternalServerErrorException({
        error: 'GENERATION_ERROR',
        message: 'Error al generar la imagen',
      });
    }
  }

  /**
   * Construye el prompt detallado con énfasis en precisión cultural
   */
  private buildPrompt(dto: GenerateHeroImageDto): string {
    const colorContext =
      dto.brandColors && dto.brandColors.length > 0
        ? `usando los colores de marca: ${dto.brandColors.join(', ')}. `
        : '';

    // Sección de contexto cultural (máxima prioridad)
    const culturalSection = dto.culturalContext
      ? `\n\nCONTEXTO CULTURAL ESPECÍFICO (CRÍTICO - RESPETAR FIELMENTE):\n${dto.culturalContext}\n`
      : '';

    let basePrompt = `Crea una imagen hero profesional y atractiva para una tienda artesanal.
${culturalSection}
Tienda: "${dto.shopName}"${dto.brandClaim ? ` - "${dto.brandClaim}"` : ''}
Tipo de artesanía: ${dto.craftType}
Tema de este slide: "${dto.title}" - "${dto.subtitle}"
${colorContext}

INSTRUCCIONES CRÍTICAS DE PRECISIÓN CULTURAL:
- La imagen DEBE representar FIELMENTE la cultura, región y productos específicos mencionados en el contexto
- NO mezclar ni confundir culturas diferentes (ej: si es arhuaco, NO mostrar diseños incas, mayas o de otras culturas)
- Los patrones, colores y estilos deben coincidir EXACTAMENTE con la tradición artesanal específica
- Si hay productos mencionados, la imagen debe mostrar productos similares o del mismo tipo
- Respetar las técnicas, materiales y características únicas de la región mencionada
- La autenticidad cultural es más importante que la perfección estética genérica

Estilo requerido:
- Fotografía de producto artesanal de alta calidad
- Iluminación natural y cálida que realce las texturas artesanales
- Composición profesional que destaque la autenticidad cultural
- Enfoque en materiales, texturas y patrones tradicionales específicos
- Ambiente que refleje el contexto geográfico y cultural del artesano

IMPORTANTE:
- NO incluir texto en la imagen
- NO usar diseños genéricos o de otras culturas
- La imagen debe ser culturalmente precisa y específica
- Formato horizontal optimizado para hero banner`;

    // Agregar referencias del usuario si existen
    if (dto.referenceText) {
      basePrompt += `\n\nGUÍA ADICIONAL DEL USUARIO:\n${dto.referenceText}\n\nToma en cuenta esta descripción para refinar la imagen manteniendo la precisión cultural.`;
    }

    // Agregar nota sobre imágenes de productos reales si están disponibles
    if (dto.productImageUrls && dto.productImageUrls.length > 0) {
      basePrompt += `\n\nNOTA: El usuario ha proporcionado ${dto.productImageUrls.length} imagen(es) de productos reales como referencia visual. Asegúrate de que la imagen generada refleje fielmente el estilo, patrones y características de esos productos artesanales.`;
    }

    // DALL-E 3 tiene un límite de 4000 caracteres en el prompt
    if (basePrompt.length > 4000) {
      this.logger.warn(
        `Prompt muy largo (${basePrompt.length} chars), truncando a 4000`,
      );
      basePrompt = basePrompt.substring(0, 3997) + '...';
    }

    return basePrompt;
  }

  /**
   * Descarga una imagen desde una URL y la convierte a base64
   */
  private async downloadImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');

      // Detectar el tipo de imagen (OpenAI retorna PNG)
      const contentType = response.headers.get('content-type') || 'image/png';
      const dataUri = `data:${contentType};base64,${base64}`;

      return dataUri;
    } catch (error) {
      this.logger.error(
        'Error descargando imagen',
        error instanceof Error ? error.message : String(error),
      );
      throw new InternalServerErrorException('Error al descargar la imagen generada');
    }
  }
}
