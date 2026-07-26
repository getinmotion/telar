import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OnboardingRequestDto } from './dto/onboarding-request.dto';
import { OnboardingResponseDto } from './dto/onboarding-response.dto';
import { Step1InitialCaptureRequestDto } from './dto/step-1-initial-capture-request.dto';
import { Step1InitialCaptureResponseDto } from './dto/step-1-initial-capture-response.dto';
import { Step1ConfirmRequestDto } from './dto/step-1-confirm-request.dto';
import { Step1ConfirmResponseDto } from './dto/step-1-confirm-response.dto';
import { Step2CaptureRequestDto } from './dto/step-2-capture-request.dto';
import { Step2CaptureResponseDto } from './dto/step-2-capture-response.dto';
import { Step2ConfirmRequestDto } from './dto/step-2-confirm-request.dto';
import { Step2ConfirmResponseDto } from './dto/step-2-confirm-response.dto';
import { UserProfilesService } from '../user-profiles/user-profiles.service';
import { CategoriesService } from '../categories/categories.service';
import { ArtisanShopsService } from '../artisan-shops/artisan-shops.service';

/**
 * Servicio puente para realizar peticiones al servicio de agentes (AGENT_URL)
 * No está vinculado a ninguna tabla de base de datos
 */
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly agentUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly userProfilesService: UserProfilesService,
    private readonly categoriesService: CategoriesService,
    private readonly artisanShopsService: ArtisanShopsService,
  ) {
    this.agentUrl = this.configService.get<string>('AGENT_URL') || '';
    if (!this.agentUrl) {
      this.logger.warn('AGENT_URL no está configurada en las variables de entorno');
    } else {
      this.logger.log(`Agent service configurado con URL: ${this.agentUrl}`);
    }
  }

  /**
   * Obtiene la URL base del servicio de agentes
   */
  getAgentUrl(): string {
    return this.agentUrl;
  }

  /**
   * Realiza una petición GET al servicio de agentes
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    if (!this.agentUrl) {
      throw new Error('AGENT_URL no está configurada');
    }

    const url = `${this.agentUrl}${endpoint}`;
    this.logger.log(`GET request to agent service: ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get<T>(url, { params }),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error en GET request a ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Realiza una petición POST al servicio de agentes
   */
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    if (!this.agentUrl) {
      throw new Error('AGENT_URL no está configurada');
    }

    const url = `${this.agentUrl}${endpoint}`;
    this.logger.log(`POST request to agent service: ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<T>(url, data),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error en POST request a ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Realiza una petición PUT al servicio de agentes
   */
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    if (!this.agentUrl) {
      throw new Error('AGENT_URL no está configurada');
    }

    const url = `${this.agentUrl}${endpoint}`;
    this.logger.log(`PUT request to agent service: ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.put<T>(url, data),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error en PUT request a ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Realiza una petición DELETE al servicio de agentes
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    if (!this.agentUrl) {
      throw new Error('AGENT_URL no está configurada');
    }

    const url = `${this.agentUrl}${endpoint}`;
    this.logger.log(`DELETE request to agent service: ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.delete<T>(url),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error en DELETE request a ${url}:`, error.message);
      throw error;
    }
  }

  // ─── Métodos específicos de negocio ─────────────────────────────────────────

  /**
   * Procesa el onboarding de un artesano
   * Envía los datos del perfil de conocimiento al servicio de agentes
   */
  async processOnboarding(
    onboardingData: OnboardingRequestDto,
  ): Promise<OnboardingResponseDto> {
    this.logger.log(`Processing onboarding for user: ${onboardingData.userId}`);

    try {
      // 1. Obtener información del usuario (fullName, department, city)
      const userProfile = await this.userProfilesService.getByUserId(
        onboardingData.userId,
      );

      if (!userProfile) {
        throw new Error(`User profile not found for userId: ${onboardingData.userId}`);
      }

      // 2. Obtener el nombre de la categoría
      const category = await this.categoriesService.findOne(
        onboardingData.identityOne.shopCategoriesId,
      );

      if (!category) {
        throw new Error(`Category not found for id: ${onboardingData.identityOne.shopCategoriesId}`);
      }

      // 3. Transformar el DTO al formato requerido por la API de agentes
      const agentPayload = this.transformToAgentFormat(
        onboardingData,
        userProfile,
        category.name,
      );

      // Log del payload para debugging
      this.logger.log('Agent payload:', JSON.stringify(agentPayload, null, 2));

      // 4. Enviar la petición POST al servicio de agentes
      const endpoint = '/agents/process';
      const response = await this.post<OnboardingResponseDto>(
        endpoint,
        agentPayload,
      );

      this.logger.log(`Onboarding processed successfully for user: ${onboardingData.userId}`);
      return response;
    } catch (error: any) {
      this.logger.error(
        `Error processing onboarding for user ${onboardingData.userId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Transforma el OnboardingRequestDto al formato requerido por la API de agentes
   */
  private transformToAgentFormat(
    data: OnboardingRequestDto,
    userProfile: any,
    categoryName: string,
  ): any {
    // Helper para concatenar valores filtrando nulls
    const concatenateValues = (...values: (string | null)[]): string => {
      return values.filter((v) => v !== null && v !== '').join(', ');
    };

    // Construir metadata
    const metadata = {
      artisan_id: data.userId,
      artisan_name: userProfile.fullName || '',
      ubicacion: concatenateValues(userProfile.department, userProfile.city),
      form_version: '1.0.0',
      submitted_at: new Date().toISOString(),
    };

    // Construir blocks
    const blocks = {
      identity: {
        q1_who_you_are: { value: data.identityOne.artisanHistory || '' },
        q1_shop_story: { value: data.identityOne.shopHistory || '' },
        q1_what_you_do: { value: data.identityOne.shopDescription || '' },
        q1_meaning: { value: data.identityOne.shopDefinition || '' },
        q1_experience_range: { value: data.identityOne.ageExperience || '' },
        q2_product_type: { value: categoryName },
        q3_differentiator: {
          value: concatenateValues(
            data.identityOne.shopSpecialDefinitionOne,
            data.identityOne.shopSpecialDefinitionTwo,
            data.identityOne.shopSpecialDefinitionThree,
          ),
        },
        q4_tradition: {
          value: concatenateValues(
            data.identityOne.shopBornSpecialDefinitionOne,
            data.identityOne.shopBornSpecialDefinitionTwo,
            data.identityOne.shopBornSpecialDefinitionThree,
          ),
        },
      },
      commercial_reality: {
        q5_price_range: { value: data.commercialTwo.shopRangePayment || '' },
        q6_cost_awareness: { value: data.commercialTwo.shopKnowledgeCost || '' },
        q7_pricing_method: { value: data.commercialTwo.shopKnowledgeDefineCost || '' },
        q8_profitability: { value: data.commercialTwo.shopKnowledgeIsProfitable || '' },
      },
      clients_market: {
        q9_main_client: {
          value: concatenateValues(
            data.clientMarketThree.shopKnowledgeMainBuyerOne,
            data.clientMarketThree.shopKnowledgeMainBuyerTwo,
            data.clientMarketThree.shopKnowledgeMainBuyerThree,
          ),
        },
        q10_digital_presence: { value: data.clientMarketThree.shopKnowledgeDigitalPresence || '' },
        q11_sales_channels: {
          value: concatenateValues(
            data.clientMarketThree.shopKnowledgeWhereSaleOne,
            data.clientMarketThree.shopKnowledgeWhereSaleTwo,
            data.clientMarketThree.shopKnowledgeWhereSaleThree,
          ),
        },
        q12_sales_frequency: { value: data.clientMarketThree.shopKnowledgeSalesActivity || '' },
      },
      operations_growth: {
        q13_monthly_capacity: { value: data.operationGrowthFour.shopKnowledgeProductsMakeMonth || '' },
        q14_main_limitation: {
          value: concatenateValues(
            data.operationGrowthFour.shopKnowledgeLimitTodayOne,
            data.operationGrowthFour.shopKnowledgeLimitTodayTwo,
            data.operationGrowthFour.shopKnowledgeLimitTodayThree,
          ),
        },
        q15_work_structure: { value: data.operationGrowthFour.shopManyWorkers || '' },
        q16_immediate_priority: { value: data.operationGrowthFour.shopFirstSolvingTelar || '' },
      },
    };

    // Construir el objeto final
    return {
      session_id: data.id, // Usar el id del perfil como session_id
      user_id: data.userId,
      flow: 'onboarding',
      payload: {
        onboarding_identity: {
          metadata,
          blocks,
        },
      },
    };
  }

  /**
   * Paso 1: Captura inicial del producto
   * Envía la información básica del producto al servicio de agentes para análisis y mejora
   */
  async step1InitialCapture(
    data: Step1InitialCaptureRequestDto,
  ): Promise<Step1InitialCaptureResponseDto> {
    this.logger.log(`Processing step 1 initial capture for store: ${data.storeId}`);

    try {
      // 1. Obtener el artisan shop por storeId para obtener el userId
      const artisanShop = await this.artisanShopsService.getById(data.storeId);

      if (!artisanShop) {
        throw new Error(`Artisan shop not found for storeId: ${data.storeId}`);
      }

      // 2. Construir el payload en el formato requerido por la API de agentes
      const agentPayload = this.transformToStep1Format(data, artisanShop.userId);

      // Log del payload para debugging
      this.logger.log('Step 1 agent payload:', JSON.stringify(agentPayload, null, 2));

      // 3. Enviar la petición POST al servicio de agentes
      const endpoint = '/agents/process';
      const response = await this.post<Step1InitialCaptureResponseDto>(
        endpoint,
        agentPayload,
      );

      this.logger.log(`Step 1 initial capture processed successfully`);
      return response;
    } catch (error: any) {
      this.logger.error(
        `Error processing step 1 initial capture for store ${data.storeId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Transforma el Step1InitialCaptureRequestDto al formato requerido por la API de agentes
   */
  private transformToStep1Format(
    data: Step1InitialCaptureRequestDto,
    userId: string,
  ): any {
    // Construir session_id concatenando storeId + name
    const sessionId = `${data.storeId}-${data.name}`;

    // Encontrar la foto principal (isPrimary = true)
    const mainPhoto = data.media.find((m) => m.isPrimary);
    const mainPhotoUrl = mainPhoto?.mediaUrl || '';

    // Construir el objeto final
    return {
      session_id: sessionId,
      user_id: userId,
      flow: 'product_creation',
      step: 'step_1_initial_capture',
      payload: {
        product_name: data.name,
        short_description: data.shortDescription,
        history_context: data.history,
        photos: {
          main: mainPhotoUrl,
        },
      },
    };
  }

  /**
   * Paso 1 Confirm: Confirmación de identidad artesanal
   * Envía la confirmación de contenido e identidad al servicio de agentes
   */
  async step1Confirm(
    data: Step1ConfirmRequestDto,
  ): Promise<Step1ConfirmResponseDto> {
    this.logger.log(`Processing step 1 confirm for product draft: ${data.productDraftId}`);

    try {
      // 1. Construir el payload en el formato requerido por la API de agentes
      const agentPayload = this.transformToStep1ConfirmFormat(data);

      // Log del payload para debugging
      this.logger.log('Step 1 confirm agent payload:', JSON.stringify(agentPayload, null, 2));

      // 2. Enviar la petición POST al servicio de agentes
      const endpoint = '/agents/process';
      const response = await this.post<Step1ConfirmResponseDto>(
        endpoint,
        agentPayload,
      );

      this.logger.log(`Step 1 confirm processed successfully`);
      return response;
    } catch (error: any) {
      this.logger.error(
        `Error processing step 1 confirm for product draft ${data.productDraftId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Transforma el Step1ConfirmRequestDto al formato requerido por la API de agentes
   */
  private transformToStep1ConfirmFormat(
    data: Step1ConfirmRequestDto,
  ): any {
    // Construir session_id concatenando userId + productDraftId
    const sessionId = `${data.userId}-${data.productDraftId}`;

    // Construir el objeto final
    return {
      session_id: sessionId,
      user_id: data.userId,
      flow: 'product_creation',
      step: 'step_2_artisan_identity_confirm',
      product_draft_id: data.productDraftId,
      payload: {
        confirmed_content: {
          improved_description: {
            value: data.shortDescription.originalAiValue,
            source: data.shortDescription.source,
          },
          improved_history: {
            value: data.artisanalHistory.originalAiValue,
            source: data.artisanalHistory.source,
          },
        },
        confirmed_identity: {
          category: data.category,
          oficio: data.oficio,
          materials: data.materials,
        },
      },
    };
  }

  /**
   * Paso 2 Capture: Registro del proceso de elaboración
   * Envía la descripción del proceso y evidencias al servicio de agentes
   */
  async step2Capture(
    data: Step2CaptureRequestDto,
  ): Promise<Step2CaptureResponseDto> {
    this.logger.log(`Processing step 2 capture for product: ${data.productId}`);

    try {
      // 1. Construir el payload en el formato requerido por la API de agentes
      const agentPayload = this.transformToStep2CaptureFormat(data);

      // Log del payload para debugging
      this.logger.log('Step 2 capture agent payload:', JSON.stringify(agentPayload, null, 2));

      // 2. Enviar la petición POST al servicio de agentes
      const endpoint = '/agents/process';
      const response = await this.post<Step2CaptureResponseDto>(
        endpoint,
        agentPayload,
      );

      // Log de la response para debugging y mapeo
      this.logger.log('Step 2 capture agent response:', JSON.stringify(response, null, 2));

      this.logger.log(`Step 2 capture processed successfully`);
      return response;
    } catch (error: any) {
      this.logger.error(
        `Error processing step 2 capture for product ${data.productId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Transforma el Step2CaptureRequestDto al formato requerido por la API de agentes
   */
  private transformToStep2CaptureFormat(
    data: Step2CaptureRequestDto,
  ): any {
    // Construir session_id concatenando userId + productId
    const sessionId = `${data.userId}-${data.productId}`;

    // Obtener la primera URL de evidencia para la foto principal
    const mainPhotoUrl = data.processEvidenceUrls.length > 0
      ? data.processEvidenceUrls[0]
      : '';

    // Construir el objeto final
    return {
      session_id: sessionId,
      user_id: data.userId,
      flow: 'product_creation',
      step: 'step_3_process_registration',
      product_draft_id: data.productId,
      payload: {
        process_description: data.processDescription,
        process_photos: {
          main: mainPhotoUrl,
        },
      },
    };
  }

  /**
   * Paso 2 Confirm: Confirmación de pricing y logística
   * Envía la confirmación de proceso, pricing y logística al servicio de agentes
   */
  async step2Confirm(
    data: Step2ConfirmRequestDto,
  ): Promise<Step2ConfirmResponseDto> {
    this.logger.log(`Processing step 2 confirm for product: ${data.productId}`);

    try {
      // 1. Construir el payload en el formato requerido por la API de agentes
      const agentPayload = this.transformToStep2ConfirmFormat(data);

      // Log del payload para debugging
      this.logger.log('Step 2 confirm agent payload:', JSON.stringify(agentPayload, null, 2));

      // 2. Enviar la petición POST al servicio de agentes
      const endpoint = '/agents/process';
      const response = await this.post<Step2ConfirmResponseDto>(
        endpoint,
        agentPayload,
      );

      this.logger.log(`Step 2 confirm processed successfully`);
      return response;
    } catch (error: any) {
      this.logger.error(
        `Error processing step 2 confirm for product ${data.productId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Transforma el Step2ConfirmRequestDto al formato requerido por la API de agentes
   */
  private transformToStep2ConfirmFormat(
    data: Step2ConfirmRequestDto,
  ): any {
    // Construir session_id concatenando userId + productId
    const sessionId = `${data.userId}-${data.productId}`;

    // Convertir price y weightKg de string a número
    const price = parseFloat(data.price.originalAiValue);
    const packageWeightKg = parseFloat(data.weightKg.originalAiValue);

    // Construir el objeto final
    return {
      session_id: sessionId,
      user_id: data.userId,
      flow: 'product_creation',
      step: 'step_4_pricing_logistics_confirm',
      product_draft_id: data.productId,
      payload: {
        confirmed_process: {
          elaboration_time: {
            value: data.elaborationTime.originalAiValue,
            source: data.elaborationTime.source,
          },
        },
        confirmed_pricing: {
          price: price,
        },
        confirmed_logistics: {
          // TODO: Estos campos no están en el request DTO. Ajustar según sea necesario.
          shipping_method: 'Servientrega',
          package_weight_kg: packageWeightKg,
          package_dimensions_cm: '15x10x5',
        },
        availability: {
          // TODO: Estos campos no están en el request DTO. Ajustar según sea necesario.
          type: 'bajo_pedido',
          stock_quantity: 0,
        },
        ...(data.variants && {
          confirmed_variants: {
            source: data.variants.source,
            original_ai_value: data.variants.originalAiValue,
          },
        }),
      },
    };
  }
}
