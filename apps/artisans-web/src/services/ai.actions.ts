/**
 * AI Service - Centralized API calls to NestJS backend
 *
 * Este servicio maneja todas las operaciones de IA del sistema:
 * - Generación de historia del perfil artesanal
 * - Transcripción de audio a texto
 * - Sugerencias de tienda y productos
 * - Asistente de marca
 */

import { telarApi } from '@/integrations/api/telarApi';
import type { ArtisanProfileData } from '@/types/artisanProfile';

// ============= Request/Response Types =============

export interface TimelineEvent {
  year: string;
  event: string;
}

export interface ArtisanProfileHistoryResponse {
  heroTitle: string;
  heroSubtitle: string;
  claim: string;
  timeline: TimelineEvent[];
  originStory: string;
  culturalStory: string;
  craftStory: string;
  workshopStory: string;
  artisanQuote: string;
  closingMessage: string;
}

export interface GenerateArtisanProfileHistoryRequest {
  profile: ArtisanProfileData;
  shopName: string;
  craftType: string;
  region: string;
}

export interface TranscribeAudioRequest {
  audio: string; // base64
  language?: string; // ISO 639-1, default: 'es'
}

export interface TranscribeAudioResponse {
  text: string;
}

export interface GenerateShopContactRequest {
  shopName: string;
  craftType: string;
  region?: string;
  brandClaim?: string;
}

export interface GenerateShopContactResponse {
  welcomeMessage: string;
  formIntroText: string;
  suggestedHours: string;
  contactPageTitle: string;
}

export interface ProductInfo {
  name: string;
  description: string;
}

export interface GenerateShopHeroSlideRequest {
  shopName: string;
  craftType: string;
  description: string;
  brandColors?: string[];
  brandClaim?: string;
  count?: number;
  culturalContext?: string;
  products?: ProductInfo[];
}

export interface HeroSlide {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  suggestedImage: string;
}

export interface GenerateShopHeroSlideResponse {
  slides: HeroSlide[];
}

export interface GenerateHeroImageRequest {
  title: string;
  subtitle: string;
  shopName: string;
  craftType: string;
  brandColors?: string[];
  brandClaim?: string;
  slideIndex?: number;
  referenceText?: string;
  referenceImageUrl?: string;
  culturalContext?: string;
  productImageUrls?: string[];
}

export interface GenerateHeroImageResponse {
  imageBase64: string;
  slideIndex: number;
}

export type ContentContext =
  | 'product_name'
  | 'product_description'
  | 'shop_story'
  | 'shop_mission'
  | 'shop_vision'
  | 'shop_description'
  | 'shop_name';

export interface RefineContentRequest {
  context: ContentContext;
  currentValue: string;
  userPrompt: string;
  additionalContext?: Record<string, any>;
}

export interface RefineContentResponse {
  refinedContent: string;
}

export interface AnalyzeImageRequest {
  images: string[]; // URLs de imágenes (máximo 3)
}

export interface AnalyzeImageResponse {
  suggestedName: string;
  suggestedDescription: string;
  detectedCategory: string;
  suggestedTags: string[];
}

// ============= AI Actions =============

/**
 * Genera la historia narrativa del perfil de un artesano
 * Endpoint: POST /ai/generate-artisan-profile-history
 *
 * @param request - Datos del perfil del artesano y contexto de su tienda
 * @returns Historia completa con título, subtítulo, línea de tiempo, narrativas y cita
 */
export const generateArtisanProfileHistory = async (
  request: GenerateArtisanProfileHistoryRequest
): Promise<ArtisanProfileHistoryResponse> => {
  try {
    const response = await telarApi.post<ArtisanProfileHistoryResponse>(
      '/ai/generate-artisan-profile-history',
      request
    );
    return response.data;
  } catch (error: any) {
    console.error('Error generating artisan profile history:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al generar la historia del perfil'
      );
    }
    throw error;
  }
};

/**
 * Transcribe audio a texto usando OpenAI Whisper
 * Endpoint: POST /ai/transcribe-audio
 *
 * @param request - Audio en base64 y código de idioma opcional
 * @returns Texto transcrito del audio
 */
export const transcribeAudio = async (
  request: TranscribeAudioRequest
): Promise<TranscribeAudioResponse> => {
  try {
    const response = await telarApi.post<TranscribeAudioResponse>(
      '/ai/transcribe-audio',
      {
        audio: request.audio,
        language: request.language || 'es',
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al transcribir el audio'
      );
    }
    throw error;
  }
};

/**
 * Genera contenido para la página de contacto de una tienda
 * Endpoint: POST /ai/generate-shop-contact
 *
 * @param request - Datos de la tienda (nombre, tipo de artesanía, región, claim)
 * @returns Contenido generado para la página de contacto
 */
export const generateShopContact = async (
  request: GenerateShopContactRequest
): Promise<GenerateShopContactResponse> => {
  try {
    const response = await telarApi.post<GenerateShopContactResponse>(
      '/ai/generate-shop-contact',
      request
    );
    return response.data;
  } catch (error: any) {
    console.error('Error generating shop contact:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al generar el contenido de contacto'
      );
    }
    throw error;
  }
};

/**
 * Genera slides de hero culturalmente precisos para una tienda
 * Endpoint: POST /ai/generate-shop-hero-slide
 *
 * @param request - Datos de la tienda, productos y contexto cultural
 * @returns Slides generados con título, subtítulo, CTA y descripción de imagen sugerida
 */
export const generateShopHeroSlide = async (
  request: GenerateShopHeroSlideRequest
): Promise<GenerateShopHeroSlideResponse> => {
  try {
    const response = await telarApi.post<GenerateShopHeroSlideResponse>(
      '/ai/generate-shop-hero-slide',
      request
    );
    return response.data;
  } catch (error: any) {
    console.error('Error generating shop hero slides:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al generar los hero slides'
      );
    }
    throw error;
  }
};

/**
 * Genera una imagen hero culturalmente precisa usando DALL-E 3
 * Endpoint: POST /ai/generate-hero-image
 *
 * @param request - Datos del slide y contexto cultural para generar la imagen
 * @returns Imagen generada en base64 y el índice del slide
 */
export const generateHeroImage = async (
  request: GenerateHeroImageRequest
): Promise<GenerateHeroImageResponse> => {
  try {
    const response = await telarApi.post<GenerateHeroImageResponse>(
      '/ai/generate-hero-image',
      request
    );
    return response.data;
  } catch (error: any) {
    console.error('Error generating hero image:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al generar la imagen hero'
      );
    }
    throw error;
  }
};

/**
 * Refina contenido de productos y tiendas usando OpenAI
 * Endpoint: POST /ai/refine-content
 *
 * @param request - Contexto, valor actual, prompt del usuario y contexto adicional
 * @returns Contenido refinado
 */
export const refineContent = async (
  request: RefineContentRequest
): Promise<RefineContentResponse> => {
  try {
    const response = await telarApi.post<RefineContentResponse>(
      '/ai/refine-content',
      request
    );
    return response.data;
  } catch (error: any) {
    console.error('Error refining content:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al refinar el contenido'
      );
    }
    throw error;
  }
};

/**
 * Analiza imágenes de productos artesanales usando OpenAI Vision
 * Endpoint: POST /ai/analyze-image
 *
 * @param request - URLs de imágenes a analizar (máximo 3)
 * @returns Sugerencias de nombre, descripción, categoría y tags
 */
export const analyzeImage = async (
  request: AnalyzeImageRequest
): Promise<AnalyzeImageResponse> => {
  try {
    const response = await telarApi.post<AnalyzeImageResponse>(
      '/ai/analyze-image',
      request
    );
    return response.data;
  } catch (error: any) {
    console.error('Error analyzing images:', error);
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Error al analizar las imágenes'
      );
    }
    throw error;
  }
};
