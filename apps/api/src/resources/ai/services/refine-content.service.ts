import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { OpenAIService } from './openai.service';
import {
  RefineContentDto,
  RefineContentResponse,
  ContentContext,
} from '../dto/refine-content.dto';

@Injectable()
export class RefineContentService {
  constructor(private readonly openaiService: OpenAIService) {}

  /**
   * Refina contenido usando OpenAI según el contexto específico
   */
  async refineContent(
    dto: RefineContentDto,
  ): Promise<RefineContentResponse> {
    const { context, currentValue, userPrompt, additionalContext } = dto;

    if (!currentValue || currentValue.trim().length === 0) {
      throw new BadRequestException('El contenido actual no puede estar vacío');
    }

    try {
      const systemPrompt = this.getSystemPrompt(context);

      // Construir mensaje de usuario con contexto adicional
      let userMessage = `Contenido actual: "${currentValue}"

Instrucción de refinamiento: ${userPrompt}`;

      if (additionalContext) {
        if (additionalContext.productName) {
          userMessage += `\n\nNombre del producto: ${additionalContext.productName}`;
        }
        if (additionalContext.hasImages) {
          userMessage += `\nEl producto tiene ${additionalContext.imageCount || 1} imagen(es)`;
        }
      }

      userMessage += '\n\nRefina el contenido siguiendo la instrucción.';

      // Llamar a OpenAI
      const response = await this.openaiService.chatCompletion({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const refinedContent = response.trim();

      if (!refinedContent) {
        throw new InternalServerErrorException(
          'No se pudo generar contenido refinado',
        );
      }

      return { refinedContent };
    } catch (error: any) {
      console.error('Error al refinar contenido:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      // Manejar errores específicos de OpenAI
      if (error.response?.status === 429) {
        throw new InternalServerErrorException(
          'Límite de uso de OpenAI alcanzado. Intenta nuevamente en unos minutos.',
        );
      }

      throw new InternalServerErrorException(
        `Error al refinar el contenido: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene el system prompt según el contexto
   */
  private getSystemPrompt(context: ContentContext): string {
    switch (context) {
      case 'product_name':
        return `Eres un experto en marketing de productos artesanales. Tu trabajo es refinar nombres de productos para que sean más atractivos, memorables y comerciales.

INSTRUCCIONES:
- Responde SOLO con el nombre refinado, sin explicaciones
- Mantén la esencia del producto original
- El nombre debe ser en español
- Máximo 60 caracteres
- Debe ser comercial pero auténtico
- Evita palabras muy técnicas o complicadas`;

      case 'product_description':
        return `Eres un copywriter especializado en productos artesanales. Tu trabajo es crear descripciones que conecten emocionalmente con los clientes y destaquen el valor artesanal.

INSTRUCCIONES:
- Responde SOLO con la descripción refinada, sin explicaciones adicionales
- Usa un lenguaje cálido y auténtico
- Destaca la artesanía y calidad
- Incluye beneficios emocionales
- Mantén entre 100-300 palabras
- Usa párrafos cortos para facilidad de lectura
- En español`;

      case 'shop_story':
        return `Eres un escritor experto en historias de marca artesanales. Tu trabajo es refinar la historia que el usuario escribió, corrigiendo errores ortográficos y gramaticales mientras mantienes la autenticidad.

INSTRUCCIONES:
- Responde SOLO con el texto refinado, sin explicaciones
- Corrige TODOS los errores ortográficos (ej: "tejeduria" → "tejeduría", "coperativa" → "cooperativa")
- Corrige errores gramaticales y puntuación
- Mejora la fluidez del texto sin cambiar el mensaje original
- Mantén el tono auténtico y personal del artesano
- Usa mayúsculas en nombres propios (ej: "nabusimake" → "Nabusimake")
- Mantén la estructura original de párrafos
- En español`;

      case 'shop_mission':
        return `Eres un escritor experto en declaraciones de misión para marcas artesanales. Tu trabajo es refinar la misión escrita por el usuario.

INSTRUCCIONES:
- Responde SOLO con el texto refinado, sin explicaciones
- Corrige errores ortográficos y gramaticales
- Mejora la claridad y precisión del texto
- Mantén la esencia y objetivos originales
- Usa un lenguaje inspirador pero auténtico
- Mantén entre 50-150 palabras
- En español`;

      case 'shop_vision':
        return `Eres un escritor experto en declaraciones de visión para marcas artesanales. Tu trabajo es refinar la visión escrita por el usuario.

INSTRUCCIONES:
- Responde SOLO con el texto refinado, sin explicaciones
- Corrige errores ortográficos y gramaticales
- Mejora la claridad y aspiraciones expresadas
- Mantén la esencia y metas originales
- Usa un lenguaje aspiracional pero genuino
- Mantén entre 50-150 palabras
- En español`;

      case 'shop_description':
        return `Eres un editor experto especializado en descripciones de tiendas artesanales. Tu trabajo es corregir y mejorar la descripción de una tienda.

INSTRUCCIONES CRÍTICAS:
- Corrige TODOS los errores ortográficos (ej: "prodcuto" → "producto", "que gao" → "que hago", "estoyn" → "estoy")
- Corrige errores gramaticales y puntuación
- Mejora la claridad y fluidez del texto
- Mantén el mensaje y tono original del artesano
- Mantén en primera persona si el usuario la usó
- NO inventes información ni añadas detalles que no estén en el texto original
- Convierte texto conversacional en descripción profesional (ej: "mi nombre es X, básicamente estamos..." → "Somos X, ubicados en...")
- Responde SOLO con el texto corregido, sin explicaciones
- En español`;

      case 'shop_name':
        return `Eres un experto en naming de marcas artesanales. Tu trabajo es refinar nombres de tiendas.

INSTRUCCIONES:
- Responde SOLO con el nombre refinado
- Corrige errores ortográficos y capitalización
- Mantén la esencia del nombre original
- Elimina palabras innecesarias como "mi nombre es", "somos", "se llama", etc.
- Usa Title Case apropiado (ej: "vinilos macondo" → "Vinilos Macondo")
- NO cambies el nombre completamente, solo refínalo
- Máximo 50 caracteres
- En español`;

      default:
        return `Eres un asistente experto en refinamiento de contenido. Ayuda a mejorar el texto según las instrucciones del usuario, manteniendo la esencia original pero haciéndolo más efectivo.`;
    }
  }
}
