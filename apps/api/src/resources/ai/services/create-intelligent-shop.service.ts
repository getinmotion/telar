import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { PromptsService } from './prompts.service';
import { UserProfilesService } from 'src/resources/user-profiles/user-profiles.service';
import { UserMasterContextService } from 'src/resources/user-master-context/user-master-context.service';
import { UserMaturityScoresService } from 'src/resources/user-maturity-scores/user-maturity-scores.service';
import {
  ShopData,
  CraftType,
  PreConfigurateResponse,
  AnalyzeProfileResponse,
  ProcessConversationResponse,
  ProductSuggestionsResponse,
  ProductSuggestion,
  ConversationMessage,
} from '../types/intelligent-shop.types';
import { PreConfigurateShopDto } from '../dto/preconfigurate-shop.dto';
import { AnalyzeProfileDto } from '../dto/analyze-profile.dto';
import { ProcessConversationDto } from '../dto/process-conversation.dto';
import { GenerateShopProductSuggestionsDto } from '../dto/generate-shop-product-suggestions.dto';

@Injectable()
export class CreateIntelligentShopService {
  private readonly logger = new Logger(CreateIntelligentShopService.name);

  constructor(
    private readonly openAIService: OpenAIService,
    private readonly promptsService: PromptsService,
    private readonly userProfilesService: UserProfilesService,
    private readonly userMasterContextService: UserMasterContextService,
    private readonly userMaturityScoresService: UserMaturityScoresService,
  ) {}

  /**
   * Preconfigurate shop - Genera sugerencias iniciales basadas en el perfil del usuario
   */
  async preconfigurate(
    dto: PreConfigurateShopDto,
  ): Promise<PreConfigurateResponse> {
    try {
      // 1. Obtener datos del usuario
      const userProfile = await this.userProfilesService.getByUserId(
        dto.userId,
      );
      const masterContext = await this.userMasterContextService.getByUserId(
        dto.userId,
      );
      const maturityScore = await this.userMaturityScoresService
        .getLatestByUserId(dto.userId)
        .catch(() => null);

      // 2. Calcular nivel de madurez
      const maturityLevel = maturityScore
        ? Math.round(
            (maturityScore.ideaValidation +
              maturityScore.userExperience +
              maturityScore.marketFit +
              maturityScore.monetization) /
              4,
          )
        : 0;

      // 3. Detectar tipo de artesanía
      const detectedCraft = this.detectCraftTypeFromContext(
        userProfile?.businessDescription || '',
        (masterContext?.businessProfile as any)?.craft_type || '',
      );

      // 4. Cargar prompt
      const systemPrompt = await this.promptsService.getPrompt(
        'intelligent-shop/preconfigurate-system',
        dto.language,
      );

      // 5. Reemplazar variables
      const prompt = this.promptsService.replacePlaceholders(systemPrompt, {
        brand_name: userProfile?.brandName || 'Sin nombre',
        business_description:
          userProfile?.businessDescription || 'Sin descripción',
        maturity_level: maturityLevel.toString(),
        detected_craft: detectedCraft,
      });

      // 6. Llamar a OpenAI
      const response = await this.openAIService.chatCompletion({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const aiResponse = JSON.parse(response || '{}');

      // 7. Construir shopData
      const shopData: Partial<ShopData> = {
        shop_name: aiResponse.shop_name || userProfile?.brandName || '',
        description:
          aiResponse.description || userProfile?.businessDescription || '',
        story: aiResponse.story || '',
        craft_type: detectedCraft as CraftType,
      };

      return {
        shopData,
        coordinatorMessage:
          aiResponse.coordinator_message ||
          '¡Bienvenido! Vamos a crear tu tienda digital.',
        userContext: {
          hasExistingData: !!userProfile,
          detectedCraft,
          maturityLevel,
        },
      };
    } catch (error) {
      this.logger.error('Error in preconfigurate', error);
      return this.getFallbackPreconfigurate(dto.userId);
    }
  }

  /**
   * Analyze Profile - Determina si necesita conversación o puede crear tienda automáticamente
   */
  async analyzeProfile(
    dto: AnalyzeProfileDto,
  ): Promise<AnalyzeProfileResponse> {
    try {
      // 1. Obtener datos del usuario
      const userProfile = await this.userProfilesService.getByUserId(
        dto.userId,
      );
      const maturityScore = await this.userMaturityScoresService
        .getLatestByUserId(dto.userId)
        .catch(() => null);

      const maturityLevel = maturityScore
        ? Math.round(
            (maturityScore.ideaValidation +
              maturityScore.userExperience +
              maturityScore.marketFit +
              maturityScore.monetization) /
              4,
          )
        : 0;

      const detectedCraft = this.detectCraftTypeFromContext(
        userProfile?.businessDescription || '',
        '',
      );

      // 2. Cargar prompt
      const systemPrompt = await this.promptsService.getPrompt(
        'intelligent-shop/analyze-profile-system',
        dto.language,
      );

      // 3. Reemplazar variables
      const prompt = this.promptsService.replacePlaceholders(systemPrompt, {
        brand_name: userProfile?.brandName || '',
        business_description: userProfile?.businessDescription || '',
        detected_craft: detectedCraft,
      });

      // 4. Llamar a OpenAI
      const response = await this.openAIService.chatCompletion({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const aiResponse = JSON.parse(response || '{}');

      // 5. Construir shopData parcial
      const shopData: Partial<ShopData> = {
        shop_name: userProfile?.brandName || '',
        description: userProfile?.businessDescription || '',
        craft_type: detectedCraft as CraftType,
      };

      return {
        needsMoreInfo: aiResponse.needs_more_info || false,
        coordinatorMessage:
          aiResponse.coordinator_message || 'Vamos a crear tu tienda juntos.',
        nextQuestion: aiResponse.next_question || null,
        missingInfo: aiResponse.missing_info || [],
        shopData,
        userContext: {
          hasExistingData: !!userProfile,
          detectedCraft,
          maturityLevel,
        },
      };
    } catch (error) {
      this.logger.error('Error in analyzeProfile', error);
      return this.getFallbackAnalyzeProfile();
    }
  }

  /**
   * Process Conversation - Procesa cada paso del diálogo conversacional
   */
  async processConversation(
    dto: ProcessConversationDto,
  ): Promise<ProcessConversationResponse> {
    try {
      // 1. Detectar si la respuesta es vaga
      const isVague = this.detectVagueResponse(dto.userResponse);

      if (isVague) {
        return {
          message:
            'Tu respuesta es muy general. ¿Podrías ser más específico? Por ejemplo, si vendes textiles, dime qué tipo: mochilas, ruanas, tapices, etc.',
          nextQuestion: dto.currentQuestion,
          updatedShopData: dto.shopData || {},
          readyToCreate: false,
        };
      }

      // 2. Procesar según la pregunta actual
      let updatedShopData = { ...(dto.shopData || {}) };
      let nextQuestion: string | undefined;
      let message = '';
      let readyToCreate = false;

      switch (dto.currentQuestion) {
        case 'business_name':
          // Refinar nombre
          const refinedName = await this.refineName(
            dto.userResponse,
            dto.language,
          );
          updatedShopData.shop_name = refinedName.refined_name;
          message = refinedName.confirmation_message;
          nextQuestion = 'business_products';
          break;

        case 'business_products':
          // Detectar craft type y refinar descripción
          const craftInfo = await this.detectCraftTypeAndRefine(
            dto.userResponse,
            dto.language,
          );

          if (craftInfo.is_vague) {
            return {
              message:
                'Por favor, sé más específico sobre los productos que vendes. Por ejemplo: "collares de chaquira", "bolsos de cuero", "cerámicas decorativas".',
              nextQuestion: 'business_products',
              updatedShopData,
              readyToCreate: false,
            };
          }

          updatedShopData.craft_type = craftInfo.craft_type as CraftType;
          updatedShopData.description = craftInfo.refined_description;
          message = craftInfo.confirmation_message;
          nextQuestion = 'business_location';
          break;

        case 'business_location':
          // Refinar ubicación y generar historia
          const refinedLocation = this.refineLocation(dto.userResponse);
          updatedShopData.region = refinedLocation;

          // Generar historia completa
          const story = await this.generateIntelligentStory(
            updatedShopData,
            dto.conversationHistory || [],
            dto.language,
          );
          updatedShopData.story = story;

          // Generar slug
          updatedShopData.shop_slug = this.generateSlug(
            updatedShopData.shop_name || '',
          );

          message = `¡Perfecto! Tu tienda "${updatedShopData.shop_name}" está lista para ser creada.`;
          readyToCreate = true;
          break;
      }

      return {
        message,
        nextQuestion: readyToCreate ? undefined : nextQuestion,
        updatedShopData,
        readyToCreate,
        finalShopData: readyToCreate
          ? (updatedShopData as ShopData)
          : undefined,
      };
    } catch (error) {
      this.logger.error('Error in processConversation', error);
      throw error;
    }
  }

  /**
   * Generate Product Suggestions - Genera 5 productos sugeridos
   */
  async generateProductSuggestions(
    dto: GenerateShopProductSuggestionsDto,
  ): Promise<ProductSuggestionsResponse> {
    try {
      // 1. Cargar prompt
      const systemPrompt = await this.promptsService.getPrompt(
        'intelligent-shop/product-suggestions',
        dto.language,
      );

      // 2. Reemplazar variables
      const prompt = this.promptsService.replacePlaceholders(systemPrompt, {
        shop_name: dto.shopData.shop_name || 'Tienda Artesanal',
        craft_type: dto.shopData.craft_type || 'other',
        region: dto.shopData.region || 'Colombia',
        shop_description: dto.shopData.description || 'Productos artesanales',
      });

      // 3. Llamar a OpenAI
      const response = await this.openAIService.chatCompletion({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const aiResponse = JSON.parse(response || '{}');

      return {
        productSuggestions: {
          products: aiResponse.products || [],
        },
        shopContext: {
          craftType: dto.shopData.craft_type || 'other',
          region: dto.shopData.region || 'Colombia',
          description: dto.shopData.description || '',
        },
      };
    } catch (error) {
      this.logger.error('Error in generateProductSuggestions', error);
      return this.getFallbackProductSuggestions(dto.shopData.craft_type);
    }
  }

  // ============ MÉTODOS PRIVADOS (HELPERS) ============

  /**
   * Detecta si una respuesta es vaga o genérica
   */
  private detectVagueResponse(response: string): boolean {
    const vagueTerms = [
      'artesanías',
      'artesanias',
      'cositas',
      'cosas bonitas',
      'manualidades',
      'el mismo que tenía',
      'el mismo que tenia',
      'lo de siempre',
      'lo que sea',
      'pues',
      'eh',
      'no sé',
      'no se',
      'básico',
      'basico',
    ];

    const lowerResponse = response.toLowerCase().trim();
    return (
      vagueTerms.some((term) => lowerResponse.includes(term)) ||
      lowerResponse.length < 5
    );
  }

  /**
   * Refina el nombre del negocio usando IA
   */
  private async refineName(
    userResponse: string,
    language: string = 'es',
  ): Promise<{ refined_name: string; confirmation_message: string }> {
    try {
      const systemPrompt = await this.promptsService.getPrompt(
        'intelligent-shop/refine-name',
        language,
      );

      const prompt = this.promptsService.replacePlaceholders(systemPrompt, {
        user_response: userResponse,
      });

      const response = await this.openAIService.chatCompletion({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 200,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response || '{}');
    } catch (error) {
      this.logger.error('Error refining name', error);
      return {
        refined_name: userResponse.trim(),
        confirmation_message: `Perfecto, usaremos "${userResponse}" como nombre.`,
      };
    }
  }

  /**
   * Detecta el tipo de artesanía y refina la descripción de productos
   */
  private async detectCraftTypeAndRefine(
    userResponse: string,
    language: string = 'es',
  ): Promise<{
    craft_type: string;
    refined_description: string;
    is_vague: boolean;
    confirmation_message: string;
  }> {
    try {
      const systemPrompt = await this.promptsService.getPrompt(
        'intelligent-shop/detect-craft-type',
        language,
      );

      const prompt = this.promptsService.replacePlaceholders(systemPrompt, {
        user_response: userResponse,
      });

      const response = await this.openAIService.chatCompletion({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 250,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response || '{}');
    } catch (error) {
      this.logger.error('Error detecting craft type', error);
      return {
        craft_type: 'other',
        refined_description: userResponse,
        is_vague: false,
        confirmation_message: 'Gracias por la información.',
      };
    }
  }

  /**
   * Genera una historia inteligente basada en la conversación
   */
  private async generateIntelligentStory(
    shopData: Partial<ShopData>,
    conversationHistory: ConversationMessage[],
    language: string = 'es',
  ): Promise<string> {
    try {
      const systemPrompt = await this.promptsService.getPrompt(
        'intelligent-shop/generate-story',
        language,
      );

      const historyText = conversationHistory
        .map((msg) => `P: ${msg.question}\nR: ${msg.answer}`)
        .join('\n\n');

      const prompt = this.promptsService.replacePlaceholders(systemPrompt, {
        shop_name: shopData.shop_name || 'Tienda Artesanal',
        products_description: shopData.description || 'Productos artesanales',
        craft_type: shopData.craft_type || 'other',
        region: shopData.region || 'Colombia',
        conversation_history: historyText || 'Sin historial',
      });

      const response = await this.openAIService.chatCompletion({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 400,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const aiResponse = JSON.parse(response || '{}');
      return aiResponse.story || this.getFallbackStory(shopData);
    } catch (error) {
      this.logger.error('Error generating story', error);
      return this.getFallbackStory(shopData);
    }
  }

  /**
   * Detecta el tipo de artesanía desde el contexto
   */
  private detectCraftTypeFromContext(
    description: string,
    existingCraftType: string,
  ): string {
    if (existingCraftType) return existingCraftType;

    const lowerDesc = description.toLowerCase();

    if (
      lowerDesc.includes('tejido') ||
      lowerDesc.includes('ruana') ||
      lowerDesc.includes('mochila') ||
      lowerDesc.includes('textil')
    )
      return 'textiles';
    if (
      lowerDesc.includes('cerámica') ||
      lowerDesc.includes('ceramica') ||
      lowerDesc.includes('alfarería')
    )
      return 'ceramics';
    if (
      lowerDesc.includes('joyería') ||
      lowerDesc.includes('joyeria') ||
      lowerDesc.includes('collar') ||
      lowerDesc.includes('arete')
    )
      return 'jewelry';
    if (
      lowerDesc.includes('cuero') ||
      lowerDesc.includes('bolso') ||
      lowerDesc.includes('marroquinería')
    )
      return 'leather';
    if (
      lowerDesc.includes('madera') ||
      lowerDesc.includes('tallado') ||
      lowerDesc.includes('mueble')
    )
      return 'woodwork';

    return 'other';
  }

  /**
   * Refina la ubicación (básico, solo capitaliza)
   */
  private refineLocation(location: string): string {
    return location
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Genera un slug de URL a partir del nombre
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales
      .replace(/^-+|-+$/g, ''); // Quitar guiones al inicio/final
  }

  // ============ MÉTODOS DE FALLBACK ============

  private async getFallbackPreconfigurate(
    userId: string,
  ): Promise<PreConfigurateResponse> {
    const userProfile = await this.userProfilesService.getByUserId(userId);

    return {
      shopData: {
        shop_name: userProfile?.brandName || 'Mi Tienda Artesanal',
        description:
          userProfile?.businessDescription ||
          'Productos artesanales de calidad',
        story:
          'Una historia de dedicación y amor por el arte artesanal colombiano.',
        craft_type: 'other',
        region: 'Colombia',
      },
      coordinatorMessage:
        'Bienvenido. Puedes editar estos datos para personalizarlos.',
      userContext: {
        hasExistingData: !!userProfile,
        detectedCraft: 'other',
        maturityLevel: 0,
      },
    };
  }

  private getFallbackAnalyzeProfile(): AnalyzeProfileResponse {
    return {
      needsMoreInfo: true,
      coordinatorMessage:
        'Vamos a crear tu tienda paso a paso. Primero, cuéntame sobre tu negocio.',
      nextQuestion: 'business_name',
      missingInfo: ['business_name', 'business_products', 'business_location'],
      shopData: {},
      userContext: {
        hasExistingData: false,
        detectedCraft: 'other',
        maturityLevel: 0,
      },
    };
  }

  private getFallbackStory(shopData: Partial<ShopData>): string {
    return `${shopData.shop_name || 'Esta tienda'} es el resultado de años de dedicación al arte artesanal. Cada producto es creado con amor y atención al detalle, reflejando la riqueza cultural de ${shopData.region || 'Colombia'}. Más que objetos, cada pieza cuenta una historia.`;
  }

  private getFallbackProductSuggestions(
    craftType?: string,
  ): ProductSuggestionsResponse {
    const defaultProducts: ProductSuggestion[] = [
      {
        name: 'Producto Artesanal 1',
        description:
          'Hermoso producto artesanal elaborado a mano con técnicas tradicionales colombianas. Cada pieza es única y refleja la dedicación del artesano.',
        suggested_price: 50000,
        category: 'Artesanías',
        tags: ['artesanal', 'colombia', 'hecho a mano'],
      },
      {
        name: 'Producto Artesanal 2',
        description:
          'Pieza única de artesanía tradicional colombiana. Elaborada con materiales de calidad y amor por el detalle.',
        suggested_price: 75000,
        category: 'Artesanías',
        tags: ['artesanal', 'colombia', 'único'],
      },
      {
        name: 'Producto Artesanal 3',
        description:
          'Artesanía colombiana que combina tradición y calidad. Ideal para decoración o uso diario.',
        suggested_price: 60000,
        category: 'Artesanías',
        tags: ['artesanal', 'decoración', 'tradición'],
      },
      {
        name: 'Producto Artesanal 4',
        description:
          'Creación artesanal que refleja la cultura colombiana. Hecho completamente a mano con técnicas ancestrales.',
        suggested_price: 90000,
        category: 'Artesanías',
        tags: ['artesanal', 'cultura', 'ancestral'],
      },
      {
        name: 'Producto Artesanal 5',
        description:
          'Producto único elaborado por artesanos colombianos. Perfecto como regalo o para uso personal.',
        suggested_price: 55000,
        category: 'Artesanías',
        tags: ['artesanal', 'regalo', 'único'],
      },
    ];

    return {
      productSuggestions: {
        products: defaultProducts,
      },
      shopContext: {
        craftType: craftType || 'other',
        region: 'Colombia',
        description: 'Productos artesanales de calidad',
      },
    };
  }
}
