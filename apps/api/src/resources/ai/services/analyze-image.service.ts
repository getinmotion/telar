import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { OpenAIService } from './openai.service';
import {
  AnalyzeImageDto,
  AnalyzeImageResponse,
} from '../dto/analyze-image.dto';

@Injectable()
export class AnalyzeImageService {
  constructor(private readonly openaiService: OpenAIService) {}

  /**
   * Analiza imágenes de productos artesanales usando OpenAI Vision
   * y genera sugerencias de nombre, descripción, categoría y tags
   */
  async analyzeImage(dto: AnalyzeImageDto): Promise<AnalyzeImageResponse> {
    const { images } = dto;

    if (!images || images.length === 0) {
      throw new BadRequestException('Se requiere al menos una imagen');
    }

    if (images.length > 3) {
      throw new BadRequestException(
        'Se pueden analizar máximo 3 imágenes a la vez',
      );
    }

    try {
      // Construir mensaje con múltiples imágenes para Vision API
      const imageMessages = images.map((url) => ({
        type: 'image_url' as const,
        image_url: {
          url: url,
          detail: 'high' as const, // Análisis detallado
        },
      }));

      const systemPrompt = `Eres un experto en artesanías colombianas y productos artesanales. Tu tarea es analizar las imágenes de productos artesanales y generar:

1. **suggestedName**: Un nombre descriptivo y atractivo para el producto (máximo 60 caracteres)
2. **suggestedDescription**: Una descripción detallada del producto que incluya:
   - Materiales utilizados
   - Técnica de elaboración
   - Características distintivas
   - Tamaño aproximado si es visible
   - Origen cultural o regional si es identificable
   (Entre 150-300 palabras)
3. **detectedCategory**: La categoría principal del producto (ejemplos: "Textiles", "Cerámica", "Joyería", "Madera", "Cestería", "Cuero", "Metales", "Papel", "Vidrio", "Otros")
4. **suggestedTags**: Array de 5-10 tags relevantes en español que describan el producto, materiales, técnica, estilo, región, etc.

**IMPORTANTE**:
- Responde ÚNICAMENTE con un objeto JSON válido
- NO incluyas texto adicional, explicaciones ni formato markdown
- Analiza cuidadosamente los detalles visuales de las imágenes
- Si hay múltiples imágenes, considera todas para generar una descripción completa
- Enfócate en características verificables visualmente
- Usa un tono profesional pero cálido, destacando el valor artesanal

**Formato de respuesta esperado**:
{
  "suggestedName": "Nombre del producto",
  "suggestedDescription": "Descripción detallada...",
  "detectedCategory": "Categoría",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

      const userPrompt =
        images.length === 1
          ? 'Analiza esta imagen de producto artesanal y genera las sugerencias.'
          : `Analiza estas ${images.length} imágenes del producto artesanal y genera las sugerencias. Las imágenes muestran diferentes ángulos o detalles del mismo producto.`;

      // Llamar a OpenAI Vision con gpt-4o-mini
      const response = await this.openaiService.visionCompletion({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              ...imageMessages,
            ] as any,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || '';

      if (!content) {
        throw new InternalServerErrorException(
          'OpenAI no retornó contenido en la respuesta',
        );
      }

      // Intentar parsear JSON
      let result: AnalyzeImageResponse;

      try {
        // Limpiar respuesta en caso de que incluya markdown
        const cleanedContent = content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        result = JSON.parse(cleanedContent);

        // Validar estructura
        if (
          !result.suggestedName ||
          !result.suggestedDescription ||
          !result.detectedCategory ||
          !Array.isArray(result.suggestedTags)
        ) {
          throw new Error('Estructura JSON incompleta');
        }
      } catch (parseError) {
        // Fallback: Si el parsing falla, intentar extraer información básica
        console.error('Error al parsear respuesta JSON:', parseError);
        console.error('Contenido recibido:', content);

        result = this.extractFallbackAnalysis(content);
      }

      return result;
    } catch (error: any) {
      console.error('Error al analizar imagen:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      // Manejar errores específicos de OpenAI
      if (error.response?.status === 429) {
        throw new InternalServerErrorException(
          'Límite de uso de OpenAI alcanzado. Intenta nuevamente en unos minutos.',
        );
      }

      if (error.response?.status === 400) {
        throw new BadRequestException(
          'Las imágenes no pudieron ser procesadas. Verifica que las URLs sean válidas y accesibles.',
        );
      }

      throw new InternalServerErrorException(
        `Error al analizar las imágenes: ${error.message}`,
      );
    }
  }

  /**
   * Análisis fallback si el parsing JSON falla
   */
  private extractFallbackAnalysis(content: string): AnalyzeImageResponse {
    return {
      suggestedName: 'Producto Artesanal',
      suggestedDescription:
        content.substring(0, 300) ||
        'Producto artesanal hecho a mano con técnicas tradicionales.',
      detectedCategory: 'Otros',
      suggestedTags: [
        'artesanía',
        'hecho a mano',
        'tradicional',
        'colombia',
        'único',
      ],
    };
  }
}
