import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { OpenAIService } from './services/openai.service';
import { PromptsService } from './services/prompts.service';
import { GenerateShopSuggestionsDto } from './dto/generate-shop-suggestions.dto';
import { GenerateProductSuggestionsDto } from './dto/generate-product-suggestions.dto';
import { ExtractBusinessInfoDto } from './dto/extract-business-info.dto';
import { UserProfilesService } from '../user-profiles/user-profiles.service';
import { UserMasterContextService } from '../user-master-context/user-master-context.service';
import { UserMaturityScoresService } from '../user-maturity-scores/user-maturity-scores.service';
import { ArtisanShopsService } from '../artisan-shops/artisan-shops.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly openAIService: OpenAIService,
    private readonly promptsService: PromptsService,
    private readonly userProfilesService: UserProfilesService,
    private readonly userMasterContextService: UserMasterContextService,
    private readonly userMaturityScoresService: UserMaturityScoresService,
    private readonly artisanShopsService: ArtisanShopsService,
  ) {}

  /**
   * Genera sugerencias inteligentes para crear una tienda
   */
  async generateShopSuggestions(dto: GenerateShopSuggestionsDto) {
    const { userId, language = 'es' } = dto;

    if (!userId) {
      throw new BadRequestException('El ID del usuario es requerido');
    }

    try {
      // Obtener información del usuario desde la BD
      const profile = await this.userProfilesService.getByUserId(userId);
      const masterContext = await this.userMasterContextService
        .getByUserId(userId)
        .catch(() => null);
      const maturityScores = await this.userMaturityScoresService
        .getLatestByUserId(userId)
        .catch(() => null);

      // Preparar contexto del usuario
      const userContext = {
        businessDescription: profile?.businessDescription || '',
        brandName: profile?.brandName || '',
        businessLocation: profile?.businessLocation || '',
        businessGoals: profile?.businessGoals || [],
        socialMediaPresence: profile?.socialMediaPresence || {},
        businessProfile: masterContext?.businessProfile || {},
        businessContext: masterContext?.businessContext || {},
        maturityLevel: maturityScores?.totalScore || 25,
      };

      // Obtener prompts
      const systemPrompt = await this.promptsService.getPrompt(
        'shop-suggestions-system',
        language,
      );
      const userPromptTemplate = await this.promptsService.getPrompt(
        'shop-suggestions-user',
        language,
      );

      // Reemplazar placeholders en el prompt del usuario
      const userPrompt = this.promptsService.replacePlaceholders(
        userPromptTemplate,
        userContext,
      );

      // Llamar a OpenAI
      const responseContent = await this.openAIService.chatCompletion({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      let result: any;
      try {
        result = JSON.parse(responseContent);
      } catch (parseError) {
        this.logger.error(
          'Error al parsear respuesta de OpenAI',
          parseError.stack,
        );
        throw new InternalServerErrorException(
          'Error al procesar la respuesta de IA',
        );
      }

      return {
        success: true,
        ...result,
        userContext: {
          hasExistingData: !!(
            profile?.businessDescription || profile?.brandName
          ),
          maturityLevel: userContext.maturityLevel,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error generando sugerencias de tienda para usuario ${userId}`,
        error.stack,
      );

      // Si es una excepción de NestJS, relanzarla
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Fallback en caso de error inesperado
      return {
        success: false,
        error: 'Error al generar sugerencias',
        shopData: this.getFallbackShopData(),
        coordinatorMessage:
          language === 'es'
            ? '⚠️ Hubo un problema al analizar tu perfil, pero puedes llenar la información manualmente.'
            : '⚠️ There was an issue analyzing your profile, but you can fill the information manually.',
      };
    }
  }

  /**
   * Genera sugerencias de productos para una tienda
   */
  async generateProductSuggestions(dto: GenerateProductSuggestionsDto) {
    const { userId, language = 'es' } = dto;

    if (!userId) {
      throw new BadRequestException('El ID del usuario es requerido');
    }

    try {
      // Obtener información de la tienda y contexto
      const shop = await this.artisanShopsService.getByUserId(userId);
      if (!shop) {
        throw new NotFoundException(
          `Tienda para el usuario con ID ${userId} no encontrada`,
        );
      }

      const masterContext = await this.userMasterContextService
        .getByUserId(userId)
        .catch(() => null);

      // Preparar contexto para el prompt
      const shopContext = {
        shopName: shop.shopName,
        craftType: shop.craftType,
        region: shop.region,
        description: shop.description,
        businessProfile: JSON.stringify(masterContext?.businessProfile || {}),
        businessContext: JSON.stringify(masterContext?.businessContext || {}),
      };

      // Obtener prompts
      const systemPrompt = await this.promptsService.getPrompt(
        'product-suggestions-system',
        language,
      );
      const userPromptTemplate = await this.promptsService.getPrompt(
        'product-suggestions-user',
        language,
      );

      // Reemplazar placeholders
      const userPrompt = this.promptsService.replacePlaceholders(
        userPromptTemplate,
        shopContext,
      );

      // Llamar a OpenAI
      const responseContent = await this.openAIService.chatCompletion({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      let result: any;
      try {
        result = JSON.parse(responseContent);
      } catch (parseError) {
        this.logger.error(
          'Error al parsear respuesta de OpenAI',
          parseError.stack,
        );
        throw new InternalServerErrorException(
          'Error al procesar la respuesta de IA',
        );
      }

      return {
        success: true,
        ...result,
        shopContext: {
          craftType: shop.craftType,
          region: shop.region,
          description: shop.description,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error generando sugerencias de productos para usuario ${userId}`,
        error.stack,
      );

      // Si es una excepción de NestJS, relanzarla
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Fallback en caso de error inesperado
      return {
        success: false,
        error: 'Error al generar sugerencias de productos',
        products: this.getFallbackProducts(language),
      };
    }
  }

  /**
   * Datos por defecto para tienda en caso de error
   */
  private getFallbackShopData() {
    return {
      shop_name: 'Mi Tienda Artesanal',
      description: 'Productos artesanales únicos hechos con amor',
      story:
        'Nuestra tradición artesanal se transmite de generación en generación, creando piezas únicas que reflejan la riqueza cultural de Colombia.',
      craft_type: 'other',
      region: '',
    };
  }

  /**
   * Productos por defecto en caso de error
   */
  private getFallbackProducts(language: string) {
    if (language === 'es') {
      return [
        {
          name: 'Producto Artesanal 1',
          description:
            'Producto hecho a mano con materiales de calidad, perfecto para decoración o regalo.',
          suggested_price: 50000,
          category: 'Artesanías',
          tags: ['artesanal', 'hecho a mano', 'colombia'],
        },
        {
          name: 'Producto Artesanal 2',
          description:
            'Pieza única que refleja la tradición artesanal colombiana.',
          suggested_price: 75000,
          category: 'Artesanías',
          tags: ['tradicional', 'único', 'calidad'],
        },
      ];
    }

    return [];
  }

  /**
   * Extrae información estructurada de una descripción de negocio artesanal
   */
  async extractBusinessInfo(dto: ExtractBusinessInfoDto) {
    const { userText, fieldsToExtract, language = 'es' } = dto;

    // Validación de longitud mínima
    if (!userText || userText.trim().length < 10) {
      throw new BadRequestException(
        language === 'es'
          ? 'Escribe al menos 10 caracteres para continuar'
          : 'Write at least 10 characters to continue',
      );
    }

    try {
      // Análisis previo del texto
      const hasFirstPerson =
        /\b(yo|mi|hago|trabajo|elaboro|soy|i|my|i make|i work)\b/i.test(
          userText,
        );
      const hasExplicitBrandName =
        /\b(mi marca es|se llama|el nombre es|my brand is|it's called)\b/i.test(
          userText,
        );
      const hasBrandNegation =
        /\b(no tengo  nombre|sin nombre|no name|without name)\b/i.test(userText);

      this.logger.log('Analizando descripción de negocio', {
        preview: userText.substring(0, 100),
        hasFirstPerson,
        hasExplicitBrandName,
        hasBrandNegation,
        length: userText.length,
      });

      // Obtener prompt del sistema
      const systemPrompt = await this.promptsService.getPrompt(
        'extract-business-info-system',
        language,
      );

      // Reemplazar el placeholder de fieldsToExtract
      const finalSystemPrompt = this.promptsService.replacePlaceholders(
        systemPrompt,
        { fieldsToExtract: fieldsToExtract.join(', ') },
      );

      // Definir la función para OpenAI
      const tools = [
        {
          type: 'function',
          function: {
            name: 'extract_business_info',
            description:
              'Extract structured business information from description',
            parameters: {
              type: 'object',
              properties: {
                brand_name: {
                  type: 'string',
                  description: 'Brand name, null if not mentioned',
                },
                products: {
                  type: 'string',
                  description: 'Products the artisan creates',
                },
                craft_type: {
                  type: 'string',
                  description: 'Type of artisan craft',
                },
                business_location: {
                  type: 'string',
                  description: 'Location, null if not mentioned',
                },
                target_audience: {
                  type: 'string',
                  description: 'Target customer demographic',
                },
                unique_value: {
                  type: 'string',
                  description: 'What makes the business unique',
                },
                confidence: {
                  type: 'number',
                  description: 'Confidence score 0.0 to 1.0',
                },
              },
              required: ['craft_type', 'unique_value', 'confidence'],
              additionalProperties: false,
            },
          },
        },
      ];

      // Llamar a OpenAI con function calling
      const response = await this.openAIService.chatCompletionWithTools({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: userText },
        ],
        tools,
        tool_choice: { type: 'function', function: { name: 'extract_business_info' } },
        max_tokens: 500,
        temperature: 0.7,
      });

      const toolCall = response.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall || !toolCall.function?.arguments) {
        throw new InternalServerErrorException(
          'No se pudo extraer información estructurada',
        );
      }

      let extractedInfo: any;
      try {
        extractedInfo = JSON.parse(toolCall.function.arguments);
      } catch (parseError) {
        this.logger.error('Error parseando respuesta de OpenAI', parseError.stack);
        throw new InternalServerErrorException(
          'Error al procesar la respuesta de IA',
        );
      }

      // ========= VALIDACIÓN POST-EXTRACCIÓN =========
      let finalBrandName = extractedInfo.brand_name || '';
      let finalConfidence = extractedInfo.confidence || 0.5;
      let wasNameCorrected = false;
      let correctionReason = '';

      this.logger.log('Validando nombre de marca extraído', { finalBrandName });

      // 1. Validar longitud del brand_name
      const wordCount = finalBrandName.trim().split(/\s+/).length;
      const isTooLong = wordCount > 6;

      if (isTooLong) {
        this.logger.warn(`Nombre de marca muy largo (${wordCount} palabras)`, {
          original: finalBrandName,
        });
        const words = finalBrandName.trim().split(/\s+/);
        const truncatedName = words.slice(0, 3).join(' ');
        finalBrandName = truncatedName;
        wasNameCorrected = true;
        correctionReason = `Nombre truncado de ${wordCount} palabras a 3`;
      }

      // 2. Verificar si empieza con frases en primera persona
      const invalidStartPatterns = [
        /^(yo |mi negocio |trabajo |hago |elaboro |soy |me dedico |y hago |y trabajo )/i,
        /^(i |my business |i work |i make |i create |and i |and i make )/i,
      ];
      const startsWithFirstPerson = invalidStartPatterns.some((pattern) =>
        pattern.test(finalBrandName),
      );

      // 3. Verificar si es solo el tipo de artesanía (nombre genérico)
      const craftType = (extractedInfo.craft_type || '').toLowerCase();
      const brandNameLower = finalBrandName.toLowerCase();
      const isGenericCraftName =
        craftType &&
        (brandNameLower.includes(craftType) ||
          craftType.includes(brandNameLower) ||
          /^(cerámica|joyería|textil|madera|cuero|estampados|ceramics|jewelry|textile|wood|leather)(\s+(artesanal|artesanal.*)?)?$/i.test(
            brandNameLower,
          ));

      // 4. Verificar si es un nombre personal
      const commonPersonalNames =
        /^(maría|jose|juan|pedro|ana|carlos|luis|sofia|laura|diego|andrea|camila|santiago|valentina|sebastian|john|michael|sarah|david|emma|james|mary|robert|jennifer|william|linda|richard|patricia|thomas|barbara|mark|susan)/i;
      const isSingleCapitalizedWord =
        /^[A-Z][a-zá-úñ]+$/i.test(finalBrandName) &&
        !finalBrandName.includes(' ');
      const isPersonalName =
        isSingleCapitalizedWord && commonPersonalNames.test(finalBrandName);

      // 5. Verificar artículos indefinidos
      const hasIndefiniteArticle = /^(un |una |a |an )/i.test(finalBrandName);

      // 6. Verificar frases de descripción genérica
      const genericDescriptions = [
        'estudio de',
        'taller de',
        'tienda de',
        'empresa de',
        'negocio de',
        'marca de',
        'shop of',
        'studio of',
        'store of',
        'business of',
        'taller artesanal',
        'estudio artesanal',
      ];
      const startsWithGenericDescription = genericDescriptions.some((desc) =>
        finalBrandName.toLowerCase().startsWith(desc),
      );

      // 7. Verificar confianza baja
      const lowConfidenceWithFirstPerson =
        finalConfidence < 0.75 && hasFirstPerson;
      const veryLowConfidence = finalConfidence < 0.6;

      // LÓGICA DE DECISIÓN: Cuándo marcar como "Sin nombre definido"
      let shouldMarkAsNoName = false;

      if (startsWithFirstPerson) {
        shouldMarkAsNoName = true;
        correctionReason = 'Comienza con frase en primera persona';
      } else if (hasIndefiniteArticle) {
        shouldMarkAsNoName = true;
        correctionReason =
          'Contiene artículo indefinido - descripción no nombre';
      } else if (startsWithGenericDescription) {
        shouldMarkAsNoName = true;
        correctionReason = 'Comienza con frase de descripción genérica';
      } else if (hasBrandNegation) {
        shouldMarkAsNoName = true;
        correctionReason = 'Usuario indicó explícitamente no tener nombre';
      } else if (isGenericCraftName && !hasExplicitBrandName) {
        shouldMarkAsNoName = true;
        correctionReason =
          'Tipo de artesanía genérico usado como nombre sin mención explícita';
      } else if (isPersonalName && !hasExplicitBrandName) {
        shouldMarkAsNoName = true;
        correctionReason = 'Nombre personal sin contexto de marca';
      } else if (
        veryLowConfidence &&
        hasFirstPerson &&
        !hasExplicitBrandName
      ) {
        shouldMarkAsNoName = true;
        correctionReason =
          'Confianza muy baja + primera persona + sin nombre explícito';
      }

      // Aplicar corrección si es necesario
      if (shouldMarkAsNoName) {
        const originalBrandName = finalBrandName;
        finalBrandName =
          language === 'es' ? 'Sin nombre definido' : 'No name defined';
        finalConfidence = Math.min(finalConfidence, 0.7);
        wasNameCorrected = true;

        this.logger.log('Nombre de marca corregido', {
          original: originalBrandName,
          corrected: finalBrandName,
          reason: correctionReason,
          newConfidence: finalConfidence,
        });
      }

      // Validación de ubicación
      const needsLocation = fieldsToExtract.includes('business_location');
      const extractedLocation = extractedInfo.business_location;
      const locationMissing =
        needsLocation &&
        (!extractedLocation ||
          extractedLocation === null ||
          extractedLocation === 'No especificado' ||
          extractedLocation === 'Not specified');

      const finalData: any = {
        brand_name: finalBrandName,
        craft_type: extractedInfo.craft_type || '',
        business_location:
          extractedLocation ||
          (language === 'es' ? 'No especificado' : 'Not specified'),
        unique_value: extractedInfo.unique_value || '',
        confidence: finalConfidence,
        products: extractedInfo.products || null,
        target_audience: extractedInfo.target_audience || null,
      };

      if (locationMissing) {
        this.logger.log(
          'Ubicación solicitada pero no encontrada en la extracción',
        );
        finalData._needsLocation = true;
        finalData._locationMissing = true;
      } else if (needsLocation && extractedLocation) {
        this.logger.log('Ubicación extraída exitosamente', {
          location: extractedLocation,
        });
        finalData._needsLocation = true;
        finalData._locationMissing = false;
      }

      return {
        success: true,
        data: finalData,
        metadata: {
          hasFirstPerson,
          hasExplicitBrandName,
          hasBrandNegation,
          wasNameCorrected,
          correctionReason: correctionReason || undefined,
          originalBrandName: wasNameCorrected
            ? extractedInfo.brand_name
            : undefined,
        },
      };
    } catch (error) {
      this.logger.error('Error extrayendo información del negocio', error.stack);

      // Si es una excepción de NestJS, relanzarla
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Error genérico
      throw new InternalServerErrorException(
        'Error al procesar la información del negocio',
      );
    }
  }
}
