import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { UserMasterContextService } from '../../user-master-context/user-master-context.service';
import {
  BrandAiAction,
  BrandAiAssistantDto,
  BrandColorsDto,
  BrandPerceptionDto,
} from '../dto/brand-ai-assistant.dto';

interface ClaimItem {
  text: string;
  reasoning: string;
}

interface DiagnosisScore {
  score: number;
  reasoning: string;
}

interface BrandDiagnosis {
  scores: {
    logo: DiagnosisScore;
    color: DiagnosisScore;
    typography: DiagnosisScore;
    claim: DiagnosisScore;
    global_identity: DiagnosisScore;
  };
  average_score: number;
  summary: string;
  strengths: string[];
  opportunities: string[];
  risks: string[];
}

@Injectable()
export class BrandAiAssistantService {
  private readonly logger = new Logger(BrandAiAssistantService.name);

  constructor(
    private readonly openaiService: OpenAIService,
    private readonly userMasterContextService: UserMasterContextService,
  ) {}

  async execute(dto: BrandAiAssistantDto): Promise<unknown> {
    this.logger.log(`[BrandAiAssistant] Acción: ${dto.action}`);

    switch (dto.action) {
      case BrandAiAction.GENERATE_CLAIM:
        return await this.generateClaim(dto);
      case BrandAiAction.EXTRACT_COLORS:
        return await this.extractColors(dto);
      case BrandAiAction.GENERATE_COLOR_PALETTE:
        return await this.generateColorPalette(dto);
      case BrandAiAction.DIAGNOSE_BRAND_IDENTITY:
        return await this.diagnoseBrandIdentity(dto);
      default:
        throw new BadRequestException(
          'Acción no válida o parámetros faltantes',
        );
    }
  }

  /**
   * Genera 3 claims de marca personalizados basados en el contexto del usuario
   */
  private async generateClaim(
    dto: BrandAiAssistantDto,
  ): Promise<{ claims: ClaimItem[] }> {
    if (!dto.userId) {
      throw new BadRequestException('userId es requerido para generate_claim');
    }

    this.logger.log(
      `[BrandAiAssistant] Generando claims para: ${dto.brandName} (userId: ${dto.userId})`,
    );

    const contextData = await this.userMasterContextService.getByUserId(
      dto.userId,
    );

    const businessContext =
      (contextData?.businessContext as Record<string, unknown>) ?? {};
    const businessProfile =
      (contextData?.businessProfile as Record<string, unknown>) ?? {};

    const richContext = this.buildRichContext({
      brandName: dto.brandName ?? '',
      businessDescription: dto.businessDescription ?? '',
      businessContext,
      businessProfile,
    });

    const response = await this.openaiService.chatCompletionWithTools({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Eres un experto en branding artesanal latinoamericano especializado en crear claims auténticos y memorables.

Genera claims que:
- Reflejen la HISTORIA PERSONAL y los VALORES únicos del artesano
- Incorporen los MATERIALES y TÉCNICAS específicas mencionadas
- Conecten emocionalmente con el CLIENTE IDEAL descrito
- Sean cortos (5-8 palabras), memorables y auténticos
- Eviten clichés genéricos como "artesanía con alma" o "hecho con amor"
- Usen lenguaje cercano, cálido y distintivo
- Capturen la esencia única de este negocio específico

CRÍTICO: Usa TODA la información proporcionada para crear claims verdaderamente personalizados que solo podrían aplicar a ESTE negocio.`,
        },
        {
          role: 'user',
          content:
            richContext +
            '\n\nGenera 3 opciones de claim profesionales y memorables basados en TODA esta información específica.',
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'suggest_claims',
            description: 'Retorna 3 opciones de claim con razonamiento',
            parameters: {
              type: 'object',
              properties: {
                claims: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      text: { type: 'string' },
                      reasoning: { type: 'string' },
                    },
                    required: ['text', 'reasoning'],
                  },
                },
              },
              required: ['claims'],
            },
          },
        },
      ],
      tool_choice: { type: 'function', function: { name: 'suggest_claims' } },
      temperature: 0.8,
      max_tokens: 1000,
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new InternalServerErrorException(
        'No se pudo generar claims con IA',
      );
    }

    const claims: ClaimItem[] = JSON.parse(toolCall.function.arguments).claims;
    this.logger.log(`[BrandAiAssistant] Claims generados: ${claims.length}`);

    return { claims };
  }

  /**
   * Extrae 3-5 colores dominantes de un logo usando visión por IA
   */
  private async extractColors(
    dto: BrandAiAssistantDto,
  ): Promise<{ colors: string[] }> {
    if (!dto.logoUrl) {
      throw new BadRequestException('logoUrl es requerido para extract_colors');
    }

    this.logger.log(`[BrandAiAssistant] Extrayendo colores de: ${dto.logoUrl}`);

    const response = await this.openaiService.chatCompletionWithVision({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analiza este logo y extrae los 3-5 colores dominantes en formato hexadecimal. Devuelve solo los códigos hex más representativos y visualmente importantes.',
            },
            {
              type: 'image_url',
              image_url: { url: dto.logoUrl },
            },
          ],
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'extract_colors',
            description: 'Extrae colores dominantes de una imagen',
            parameters: {
              type: 'object',
              properties: {
                colors: {
                  type: 'array',
                  items: { type: 'string' },
                  description:
                    'Array de códigos hexadecimales (ej: ["#FF5733", "#C70039"])',
                },
              },
              required: ['colors'],
            },
          },
        },
      ],
      tool_choice: { type: 'function', function: { name: 'extract_colors' } },
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new InternalServerErrorException(
        'No se pudieron extraer colores con IA',
      );
    }

    const colors: string[] = JSON.parse(toolCall.function.arguments).colors;
    this.logger.log(
      `[BrandAiAssistant] Colores extraídos: ${colors.length} → ${colors.join(', ')}`,
    );

    return { colors };
  }

  /**
   * Genera una paleta de colores secundaria complementaria a los colores primarios
   */
  private async generateColorPalette(dto: BrandAiAssistantDto): Promise<{
    secondary_colors: string[];
    reasoning: string;
  }> {
    if (!dto.primaryColors || dto.primaryColors.length === 0) {
      throw new BadRequestException(
        'primaryColors es requerido para generate_color_palette',
      );
    }

    this.logger.log(
      `[BrandAiAssistant] Generando paleta secundaria desde: ${dto.primaryColors.join(', ')}`,
    );

    const response = await this.openaiService.chatCompletionWithTools({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un experto en teoría del color y diseño de sistemas de marca. Generas paletas de colores secundarias armoniosas y profesionales basadas en colores primarios.',
        },
        {
          role: 'user',
          content: `Colores primarios del logo: ${dto.primaryColors.join(', ')}\n\nGenera 3-5 colores secundarios complementarios en formato hexadecimal que armonicen con los primarios. Incluye variaciones de tonos claros, medios y oscuros para crear un sistema de color completo para una tienda online.`,
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'generate_palette',
            description: 'Genera paleta de colores secundaria complementaria',
            parameters: {
              type: 'object',
              properties: {
                secondary_colors: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array de colores secundarios en hex',
                },
                reasoning: {
                  type: 'string',
                  description:
                    'Explicación breve de por qué estos colores complementan a los primarios',
                },
              },
              required: ['secondary_colors', 'reasoning'],
            },
          },
        },
      ],
      tool_choice: { type: 'function', function: { name: 'generate_palette' } },
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new InternalServerErrorException(
        'No se pudo generar paleta secundaria con IA',
      );
    }

    const result = JSON.parse(toolCall.function.arguments);
    this.logger.log(
      `[BrandAiAssistant] Colores secundarios generados: ${result.secondary_colors.length}`,
    );

    return {
      secondary_colors: result.secondary_colors as string[],
      reasoning: result.reasoning as string,
    };
  }

  /**
   * Genera un diagnóstico completo de identidad de marca con scores por dimensión
   */
  private async diagnoseBrandIdentity(
    dto: BrandAiAssistantDto,
  ): Promise<{ diagnosis: BrandDiagnosis }> {
    const { brandName, businessDescription, logoUrl, colors, perception } = dto;

    this.logger.log(
      `[BrandAiAssistant] Ejecutando diagnóstico de marca para: ${brandName}`,
    );

    const diagnosticPrompt = this.buildDiagnosticPrompt({
      brandName: brandName ?? 'No especificado',
      businessDescription: businessDescription ?? 'No especificado',
      logoUrl,
      colors,
      perception,
    });

    const response = await this.openaiService.chatCompletionWithTools({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: diagnosticPrompt }],
      tools: [
        {
          type: 'function',
          function: {
            name: 'diagnose_brand',
            description:
              'Genera diagnóstico completo de identidad de marca con scores por dimensión',
            parameters: {
              type: 'object',
              properties: {
                scores: {
                  type: 'object',
                  properties: {
                    logo: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        reasoning: { type: 'string' },
                      },
                    },
                    color: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        reasoning: { type: 'string' },
                      },
                    },
                    typography: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        reasoning: { type: 'string' },
                      },
                    },
                    claim: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        reasoning: { type: 'string' },
                      },
                    },
                    global_identity: {
                      type: 'object',
                      properties: {
                        score: { type: 'number' },
                        reasoning: { type: 'string' },
                      },
                    },
                  },
                },
                average_score: { type: 'number' },
                summary: { type: 'string' },
                strengths: { type: 'array', items: { type: 'string' } },
                opportunities: { type: 'array', items: { type: 'string' } },
                risks: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      ],
      tool_choice: { type: 'function', function: { name: 'diagnose_brand' } },
      max_tokens: 1500,
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new InternalServerErrorException(
        'No se pudo generar el diagnóstico de marca con IA',
      );
    }

    const diagnosis: BrandDiagnosis = JSON.parse(toolCall.function.arguments);
    this.logger.log(
      `[BrandAiAssistant] Diagnóstico completo. Score promedio: ${diagnosis.average_score}`,
    );

    return { diagnosis };
  }

  /**
   * Construye el contexto enriquecido para generate_claim extrayendo
   * información del businessContext y businessProfile del usuario
   */
  private buildRichContext(params: {
    brandName: string;
    businessDescription: string;
    businessContext: Record<string, unknown>;
    businessProfile: Record<string, unknown>;
  }): string {
    const {
      brandName,
      businessDescription,
      businessContext: bc,
      businessProfile: bp,
    } = params;

    const craftType =
      bc.tipo_artesania || bp.craftType || bp.craft_type || 'No especificado';
    const experience =
      bc.experiencia ||
      bp.experienceTime ||
      bp.years_in_business ||
      'No especificado';
    const location =
      bc.ubicacion ||
      bp.businessLocation ||
      bp.business_location ||
      'No especificada';

    const story =
      bc.historia ||
      bc.resumen ||
      bc.brand_story ||
      bp.businessDescription ||
      businessDescription ||
      '';

    const target =
      bc.cliente_ideal ||
      bc.target_customer ||
      bp.targetCustomer ||
      bp.customerKnowledge ||
      '';

    const hasSold = bc.ha_vendido || bp.hasSold || false;
    const salesFrequency = bc.frecuencia_ventas || bp.salesFrequency || '';

    const promotionChannels = bp.promotionChannels;
    const channels =
      bc.canales_actuales ||
      bc.canales_promocion ||
      (Array.isArray(promotionChannels)
        ? (promotionChannels as string[]).join(', ')
        : promotionChannels) ||
      '';

    const sellingComfort = bc.comodidad_venta || bp.sellingComfort || '';
    const pricingMethod = bc.metodo_precio || bp.pricingMethod || '';
    const profitClarity = bc.claridad_ganancia || bp.profitClarity || '';
    const value = bc.propuesta_valor || bc.value_proposition || '';
    const materials = bc.materiales || bc.materials || bc.tecnicas || '';
    const inspiration = bc.inspiraciones || bc.inspirations || '';
    const products = bc.productos || bc.products || bc.servicios || '';

    const lines: string[] = [
      `Nombre de la marca: ${brandName}`,
      `Descripción básica: ${businessDescription}`,
      '',
      'INFORMACIÓN DEL ARTESANO:',
      `- Tipo de artesanía: ${craftType}`,
      `- Experiencia: ${experience}`,
      `- Ubicación: ${location}`,
      '',
      'HISTORIA DEL NEGOCIO:',
      String(story),
      '',
      'SITUACIÓN COMERCIAL ACTUAL:',
      hasSold
        ? `- YA HA REALIZADO VENTAS (Frecuencia: ${salesFrequency || 'No especificada'})`
        : '- AÚN NO HA REALIZADO VENTAS (está iniciando)',
      channels
        ? `- Canales de promoción actuales: ${channels}`
        : '- Sin canales definidos aún',
    ];

    if (sellingComfort)
      lines.push(`- Nivel de comodidad vendiendo: ${sellingComfort}`);
    if (pricingMethod)
      lines.push(`- Método de fijación de precios: ${pricingMethod}`);
    if (profitClarity)
      lines.push(`- Claridad sobre ganancias: ${profitClarity}`);
    if (target) lines.push('', `CLIENTE IDEAL:\n${target}`);
    if (materials) lines.push('', `MATERIALES Y TÉCNICAS:\n${materials}`);
    if (inspiration) lines.push('', `INSPIRACIONES:\n${inspiration}`);
    if (value) lines.push('', `PROPUESTA DE VALOR:\n${value}`);
    if (products) lines.push('', `PRODUCTOS/SERVICIOS:\n${products}`);

    return lines.join('\n');
  }

  /**
   * Construye el prompt de diagnóstico de identidad de marca
   */
  private buildDiagnosticPrompt(params: {
    brandName: string;
    businessDescription: string;
    logoUrl?: string;
    colors?: BrandColorsDto;
    perception?: BrandPerceptionDto;
  }): string {
    const { brandName, businessDescription, logoUrl, colors, perception } =
      params;

    return `Eres un experto en identidad de marca para artesanos latinoamericanos.

Analiza la siguiente identidad de marca y genera un diagnóstico completo con scores de 1-5 por dimensión:

MARCA: ${brandName}
DESCRIPCIÓN: ${businessDescription}

ASSETS VISUALES:
- Logo URL: ${logoUrl || 'No proporcionado'}
- Colores primarios: ${colors?.primary?.join(', ') || 'No definidos'}
- Colores secundarios: ${colors?.secondary?.join(', ') || 'No definidos'}

PERCEPCIÓN DEL USUARIO:
- Años con la marca: ${perception?.yearsWithBrand || 'No especificado'}
- Descripción en 3 palabras: ${perception?.descriptionIn3Words || 'No especificado'}
- Feedback de clientes: ${perception?.customerFeedback || 'No especificado'}
- Qué transmite el logo: ${perception?.logoFeeling || 'No especificado'}
- Público objetivo: ${perception?.targetAudience || 'No especificado'}
- Emoción deseada: ${perception?.desiredEmotion || 'No especificado'}

EVALÚA cada dimensión (1=muy mal, 5=excelente):
1. Logo (claridad, escalabilidad, simbolismo, complejidad)
2. Color (armonía, contraste, coherencia con rubro)
3. Tipografía (legibilidad, consistencia, tono)
4. Claim/Mensaje (claridad, diferencial, extensión)
5. Identidad Global (alineación con público, percepción emocional, coherencia)`;
  }
}
