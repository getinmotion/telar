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
