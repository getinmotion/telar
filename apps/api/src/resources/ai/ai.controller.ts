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
import { ArtisanProfileHistoryService } from './services/artisan-profile-history.service';
import { TranscribeAudioService } from './services/transcribe-audio.service';
import { GenerateShopContactService } from './services/generate-shop-contact.service';
import { GenerateShopHeroSlideService } from './services/generate-shop-hero-slide.service';
import { GenerateHeroImageService } from './services/generate-hero-image.service';
import { GenerateShopSuggestionsDto } from './dto/generate-shop-suggestions.dto';
import { GenerateProductSuggestionsDto } from './dto/generate-product-suggestions.dto';
import { ExtractBusinessInfoDto } from './dto/extract-business-info.dto';
import { MasterCoordinatorDto } from './dto/master-coordinator.dto';
import { BrandAiAssistantDto } from './dto/brand-ai-assistant.dto';
import { GenerateArtisanProfileHistoryDto } from './dto/artisan-profile-history.dto';
import { TranscribeAudioDto } from './dto/transcribe-audio.dto';
import { GenerateShopContactDto } from './dto/generate-shop-contact.dto';
import { GenerateShopHeroSlideDto } from './dto/generate-shop-hero-slide.dto';
import { GenerateHeroImageDto } from './dto/generate-hero-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly masterCoordinatorService: MasterCoordinatorService,
    private readonly brandAiAssistantService: BrandAiAssistantService,
    private readonly artisanProfileHistoryService: ArtisanProfileHistoryService,
    private readonly transcribeAudioService: TranscribeAudioService,
    private readonly generateShopContactService: GenerateShopContactService,
    private readonly generateShopHeroSlideService: GenerateShopHeroSlideService,
    private readonly generateHeroImageService: GenerateHeroImageService,
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

  /**
   * POST /ai/generate-artisan-profile-history
   * Genera la historia narrativa del perfil de un artesano
   */
  @Post('generate-artisan-profile-history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generar historia del perfil de artesano',
    description:
      'Genera una narrativa documental y emotiva sobre el artesano basándose en su perfil completo, historia cultural y datos de su taller',
  })
  @ApiResponse({
    status: 200,
    description: 'Historia generada exitosamente',
    schema: {
      example: {
        heroTitle: 'María Fernández - Tejedora de Tradiciones',
        heroSubtitle: 'Donde cada hilo cuenta una historia ancestral',
        claim: 'Tejiendo el alma de mi tierra en cada pieza',
        timeline: [
          { year: '8 años', event: 'Aprendió a tejer de su abuela' },
          { year: '1995', event: 'Fundó su taller comunitario' },
        ],
        originStory: 'Desde pequeña, María observaba...',
        culturalStory: 'La tradición del tejido Wayuu...',
        craftStory: 'Cada mochila toma aproximadamente...',
        workshopStory: 'En el corazón de La Guajira...',
        artisanQuote: 'Tejer es rezar con las manos',
        closingMessage: 'Cada pieza lleva el espíritu de generaciones...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o incompletos',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al generar la historia',
  })
  async generateArtisanProfileHistory(
    @Body() dto: GenerateArtisanProfileHistoryDto,
  ) {
    return await this.artisanProfileHistoryService.generateProfileHistory(dto);
  }

  /**
   * POST /ai/transcribe-audio
   * Transcribe audio a texto usando OpenAI Whisper
   */
  @Post('transcribe-audio')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Transcribir audio a texto',
    description:
      'Transcribe audio en formato base64 a texto usando OpenAI Whisper API. Soporta múltiples idiomas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Audio transcrito exitosamente',
    schema: {
      example: {
        text: 'Hola, mi nombre es María y soy artesana tejedora de La Guajira...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Audio inválido o datos incompletos',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al transcribir el audio',
  })
  async transcribeAudio(@Body() dto: TranscribeAudioDto) {
    return await this.transcribeAudioService.transcribeAudio(dto);
  }

  /**
   * POST /ai/generate-shop-contact
   * Genera textos para la página de contacto de una tienda
   */
  @Post('generate-shop-contact')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generar contenido de página de contacto',
    description:
      'Genera textos profesionales y acogedores para la página de contacto de una tienda artesanal usando IA',
  })
  @ApiResponse({
    status: 200,
    description: 'Contenido generado exitosamente',
    schema: {
      example: {
        welcomeMessage:
          '¡Bienvenido a Artesanías Wayuu! Nos encantaría saber de ti...',
        formIntroText:
          'Completa el formulario y nos pondremos en contacto contigo...',
        suggestedHours: 'Lun-Vie 9:00-18:00, Sáb 10:00-14:00',
        contactPageTitle: 'Conecta con Nosotros',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al generar el contenido',
  })
  async generateShopContact(@Body() dto: GenerateShopContactDto) {
    return await this.generateShopContactService.generateContactContent(dto);
  }

  /**
   * POST /ai/generate-shop-hero-slide
   * Genera slides de hero culturalmente precisos para una tienda
   */
  @Post('generate-shop-hero-slide')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generar slides de hero para tienda',
    description:
      'Genera slides de hero culturalmente precisos y auténticos para una tienda artesanal, respetando el origen cultural específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Slides generados exitosamente',
    schema: {
      example: {
        slides: [
          {
            title: 'Mochilas Arhuacas de la Sierra Nevada',
            subtitle:
              'Tejidas a mano por artesanas de la comunidad Arhuaca con técnicas ancestrales',
            ctaText: 'Descubre Nuestras Mochilas',
            ctaLink: '#productos',
            suggestedImage:
              'Mochila arhuaca con patrones geométricos tradicionales en colores tierra, café y beige, fotografiada con fondo de la Sierra Nevada',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al generar los slides',
  })
  async generateShopHeroSlide(@Body() dto: GenerateShopHeroSlideDto) {
    return await this.generateShopHeroSlideService.generateHeroSlides(dto);
  }

  /**
   * POST /ai/generate-hero-image
   * Genera una imagen hero culturalmente precisa usando DALL-E
   */
  @Post('generate-hero-image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generar imagen hero con IA',
    description:
      'Genera una imagen hero profesional y culturalmente precisa para un slide de tienda artesanal usando DALL-E 3',
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen generada exitosamente',
    schema: {
      example: {
        imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...',
        slideIndex: 0,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o violación de políticas de contenido',
  })
  @ApiResponse({
    status: 402,
    description: 'Sin créditos disponibles',
  })
  @ApiResponse({
    status: 429,
    description: 'Límite de generación alcanzado',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al generar la imagen',
  })
  async generateHeroImage(@Body() dto: GenerateHeroImageDto) {
    return await this.generateHeroImageService.generateHeroImage(dto);
  }
}
