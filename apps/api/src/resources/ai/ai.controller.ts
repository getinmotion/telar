import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { MasterCoordinatorService } from './services/master-coordinator.service';
import { BrandAiAssistantService } from './services/brand-ai-assistant.service';
import { GenerateShopSuggestionsDto } from './dto/generate-shop-suggestions.dto';
import { GenerateProductSuggestionsDto } from './dto/generate-product-suggestions.dto';
import { ExtractBusinessInfoDto } from './dto/extract-business-info.dto';
import { MasterCoordinatorDto } from './dto/master-coordinator.dto';
import { BrandAiAssistantDto } from './dto/brand-ai-assistant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly masterCoordinatorService: MasterCoordinatorService,
    private readonly brandAiAssistantService: BrandAiAssistantService,
  ) {}

  /**
   * POST /ai/shop-suggestions
   * Genera sugerencias inteligentes para crear una tienda
   */
  @Post('shop-suggestions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Generar sugerencias de tienda con IA',
    description:
      'Analiza el perfil del usuario y genera sugerencias inteligentes para crear su tienda digital',
  })
  @ApiResponse({
    status: 200,
    description: 'Sugerencias generadas exitosamente',
    schema: {
      example: {
        success: true,
        shopData: {
          shop_name: 'Artesanías El Sol',
          description: 'Tejidos tradicionales colombianos hechos a mano',
          story: 'Historia del artesano...',
          craft_type: 'textiles',
          region: 'Boyacá',
        },
        coordinatorMessage:
          '¡Excelente! He analizado tu perfil y generado sugerencias personalizadas...',
        userContext: {
          hasExistingData: true,
          maturityLevel: 65,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async generateShopSuggestions(@Body() dto: GenerateShopSuggestionsDto) {
    return await this.aiService.generateShopSuggestions(dto);
  }

  /**
   * POST /ai/product-suggestions
   * Genera sugerencias de productos para una tienda
   */
  @Post('product-suggestions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Generar sugerencias de productos con IA',
    description:
      'Analiza la tienda del usuario y genera sugerencias de productos específicos',
  })
  @ApiResponse({
    status: 200,
    description: 'Sugerencias de productos generadas exitosamente',
    schema: {
      example: {
        success: true,
        products: [
          {
            name: 'Ruana Tradicional Boyacense',
            description:
              'Ruana tejida a mano con lana virgen de oveja, siguiendo técnicas ancestrales...',
            suggested_price: 120000,
            category: 'Textiles',
            tags: ['ruana', 'lana', 'tradicional', 'boyacá'],
          },
        ],
        shopContext: {
          craftType: 'textiles',
          region: 'Boyacá',
          description: 'Tejidos tradicionales...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Tienda no encontrada',
  })
  async generateProductSuggestions(@Body() dto: GenerateProductSuggestionsDto) {
    return await this.aiService.generateProductSuggestions(dto);
  }

  /**
   * POST /ai/extract-business-info
   * Extrae información estructurada de una descripción de negocio
   */
  @Post('extract-business-info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Extraer información estructurada de una descripción de negocio',
    description:
      'Analiza un texto descriptivo y extrae información como nombre de marca, tipo de artesanía, ubicación, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Información extraída exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          brand_name: 'Tejidos Luna',
          craft_type: 'Textil',
          business_location: 'Oaxaca',
          unique_value: 'Tejidos tradicionales con técnicas ancestrales',
          confidence: 0.92,
          products: 'Textiles artesanales, rebozos, tapetes',
          target_audience: 'Personas que valoran el trabajo artesanal',
        },
        metadata: {
          hasFirstPerson: true,
          hasExplicitBrandName: true,
          hasBrandNegation: false,
          wasNameCorrected: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o texto demasiado corto',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al procesar la información',
  })
  async extractBusinessInfo(@Body() dto: ExtractBusinessInfoDto) {
    return await this.aiService.extractBusinessInfo(dto);
  }

  /**
   * POST /ai/master-coordinator
   * Master Agent Coordinator - Coordina todas las acciones inteligentes del sistema
   */
  @Post('master-coordinator')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Master Agent Coordinator',
    description:
      'Endpoint principal para coordinar todas las acciones inteligentes: generación de tareas, análisis de progreso, conversaciones inteligentes, evaluación de marca, y más',
  })
  @ApiResponse({
    status: 200,
    description: 'Acción ejecutada exitosamente',
    schema: {
      example: {
        success: true,
        tasks: [],
        message: 'He generado 5 tareas específicas para tu negocio',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o acción no soportada',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al procesar la acción',
  })
  async masterCoordinator(@Body() dto: MasterCoordinatorDto) {
    return await this.masterCoordinatorService.coordinate(dto);
  }

  /**
   * POST /ai/brand-assistant
   * Asistente de IA para identidad de marca — 4 acciones disponibles:
   * generate_claim | extract_colors | generate_color_palette | diagnose_brand_identity
   */
  @Post('brand-assistant')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Asistente de IA para identidad de marca',
    description: `Ejecuta acciones de IA sobre la identidad de marca del artesano:
- **generate_claim**: Genera 3 claims personalizados usando el contexto del usuario (requiere userId)
- **extract_colors**: Extrae 3-5 colores dominantes de un logo por visión (requiere logoUrl)
- **generate_color_palette**: Genera paleta secundaria complementaria (requiere primaryColors)
- **diagnose_brand_identity**: Diagnóstico completo con scores por dimensión`,
  })
  @ApiResponse({
    status: 200,
    description: 'Acción ejecutada exitosamente',
    schema: {
      example: {
        claims: [
          {
            text: 'Tejidos que cuentan tu historia',
            reasoning: 'Captura la personalización y el origen artesanal',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Acción inválida o parámetros faltantes',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 500,
    description: 'Error al comunicarse con el servicio de IA',
  })
  async brandAiAssistant(@Body() dto: BrandAiAssistantDto) {
    return await this.brandAiAssistantService.execute(dto);
  }
}
