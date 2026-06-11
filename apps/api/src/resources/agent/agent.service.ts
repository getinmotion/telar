import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OnboardingRequestDto } from './dto/onboarding-request.dto';
import { OnboardingResponseDto } from './dto/onboarding-response.dto';
import { UserProfilesService } from '../user-profiles/user-profiles.service';
import { CategoriesService } from '../categories/categories.service';

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
}
