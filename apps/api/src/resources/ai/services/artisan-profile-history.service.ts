import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { OpenAIService } from './openai.service';
import {
  GenerateArtisanProfileHistoryDto,
  ArtisanProfileHistoryResponse,
} from '../dto/artisan-profile-history.dto';
import { ArtisanProfileHistoryDbService } from 'src/resources/artisan-profile-history/artisan-profile-history.service';

@Injectable()
export class ArtisanProfileHistoryService {
  private readonly logger = new Logger(ArtisanProfileHistoryService.name);

  constructor(
    private readonly openaiService: OpenAIService,
    private readonly historyDbService: ArtisanProfileHistoryDbService,
  ) {}

  /**
   * Genera la narrativa del perfil de un artesano usando OpenAI
   */
  async generateProfileHistory(
    dto: GenerateArtisanProfileHistoryDto,
  ): Promise<ArtisanProfileHistoryResponse> {
    this.logger.log(
      `Generando historia de perfil para: ${dto.shopName} (${dto.craftType})`,
    );

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(dto);

    try {
      const response = await this.openaiService.chatCompletion({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const storyData = this.parseStoryResponse(response, dto);

      this.logger.log(
        `Historia generada exitosamente para: ${dto.shopName}`,
      );

      if (dto.artisanId) {
        await this.historyDbService.save(dto.artisanId, dto, storyData);
      }

      return storyData;
    } catch (error) {
      this.logger.error(
        `Error generando historia para ${dto.shopName}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Error al generar la historia del artesano',
      );
    }
  }

  /**
   * Construye el prompt del sistema
   */
  private buildSystemPrompt(): string {
    return `Eres un escritor de perfiles artesanales para una plataforma de comercio artesanal colombiana.
Tu tarea es crear una narrativa documental, emotiva y auténtica sobre el artesano, basándote en los datos proporcionados.

IMPORTANTE:
- Escribe en español colombiano natural
- Usa un tono cálido, respetuoso y que honre la tradición
- No inventes datos, usa solo la información proporcionada
- Crea textos que emocionen y conecten con el lector
- Respeta profundamente el contexto cultural y étnico
- Genera un JSON válido con la estructura solicitada`;
  }

  /**
   * Construye el prompt del usuario con los datos del artesano
   */
  private buildUserPrompt(dto: GenerateArtisanProfileHistoryDto): string {
    const { profile, shopName, craftType, region } = dto;

    return `Genera el perfil narrativo para este artesano:

DATOS DEL ARTESANO:
- Nombre: ${profile.artisanName}
- Nombre Artístico: ${profile.artisticName}
- Tienda: ${shopName}
- Tipo de Artesanía: ${craftType}
- Región: ${region}

ORIGEN DEL OFICIO:
- Aprendió de: ${profile.learnedFrom}
- Edad de inicio: ${profile.startAge} años
- Significado cultural: ${profile.culturalMeaning}
- Motivación: ${profile.motivation}

HISTORIA CULTURAL:
- Historia regional/étnica: ${profile.culturalHistory}
- Relación étnica: ${profile.ethnicRelation}
- Conocimiento ancestral: ${profile.ancestralKnowledge}
- Importancia territorial: ${profile.territorialImportance}

EL TALLER:
- Ubicación: ${profile.workshopAddress}
- Descripción: ${profile.workshopDescription}

LA ARTESANÍA:
- Técnicas: ${profile.techniques.join(', ')}
- Materiales: ${profile.materials.join(', ')}
- Tiempo promedio: ${profile.averageTime}
- Lo que lo hace único: ${profile.uniqueness}
- Mensaje del artesano: ${profile.craftMessage}

Por favor genera un JSON con la siguiente estructura:
{
  "heroTitle": "Título emotivo corto para el hero (máx 10 palabras)",
  "heroSubtitle": "Subtítulo poético (máx 15 palabras)",
  "claim": "Frase distintiva del artesano (máx 12 palabras)",
  "timeline": [
    { "year": "Época o edad", "event": "Descripción del momento clave" }
  ],
  "originStory": "Párrafo narrativo sobre el origen (100-150 palabras)",
  "culturalStory": "Párrafo sobre la tradición cultural (100-150 palabras)",
  "craftStory": "Párrafo sobre la artesanía y técnicas (100-150 palabras)",
  "workshopStory": "Párrafo sobre el taller (80-100 palabras)",
  "artisanQuote": "Una cita memorable del artesano basada en su mensaje",
  "closingMessage": "Mensaje de cierre emotivo (2-3 oraciones)"
}`;
  }

  /**
   * Parsea y valida la respuesta de OpenAI
   */
  private parseStoryResponse(
    response: string,
    dto: GenerateArtisanProfileHistoryDto,
  ): ArtisanProfileHistoryResponse {
    try {
      const parsed = JSON.parse(response);

      // Validar que tenga todos los campos requeridos
      if (
        !parsed.heroTitle ||
        !parsed.heroSubtitle ||
        !parsed.claim ||
        !parsed.timeline ||
        !parsed.originStory ||
        !parsed.culturalStory ||
        !parsed.craftStory ||
        !parsed.workshopStory ||
        !parsed.artisanQuote ||
        !parsed.closingMessage
      ) {
        throw new Error('Respuesta incompleta de OpenAI');
      }

      return parsed as ArtisanProfileHistoryResponse;
    } catch (parseError) {
      this.logger.warn(
        'Error parseando respuesta de OpenAI, usando estructura de fallback',
        parseError instanceof Error ? parseError.message : String(parseError),
      );

      // Retornar estructura básica si el parsing falla
      return this.buildFallbackStory(dto);
    }
  }

  /**
   * Construye una historia de fallback si OpenAI falla
   */
  private buildFallbackStory(
    dto: GenerateArtisanProfileHistoryDto,
  ): ArtisanProfileHistoryResponse {
    const { profile, shopName, region, craftType } = dto;

    return {
      heroTitle: `${profile.artisticName} - Artesano de ${region}`,
      heroSubtitle: 'Tradición y arte en cada pieza',
      claim: profile.craftMessage || 'Creando con el corazón',
      timeline: [
        {
          year: `${profile.startAge} años`,
          event: `Comenzó a aprender de ${profile.learnedFrom}`,
        },
      ],
      originStory: profile.motivation,
      culturalStory: profile.culturalHistory,
      craftStory: profile.uniqueness,
      workshopStory: profile.workshopDescription,
      artisanQuote: profile.craftMessage,
      closingMessage:
        'Cada pieza cuenta una historia de tradición y pasión.',
    };
  }
}
