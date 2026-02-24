/**
 * Analytics Events Service
 * Servicio para registrar eventos de analytics en el backend NestJS
 */

import { telarApi } from '@/integrations/api/telarApi';
import {
  LogAnalyticsEventRequest,
  LogAnalyticsEventResponse,
  AnalyticsEvent
} from '@/types/analyticsEvent.types';

/**
 * Registrar un evento de analytics
 * @param payload - Datos del evento de analytics
 * @returns AnalyticsEvent creado
 * @throws Error si la petición falla
 * 
 * Endpoint: POST /telar/server/analytics-events/log
 */
export const logAnalyticsEvent = async (
  payload: LogAnalyticsEventRequest
): Promise<AnalyticsEvent> => {
  try {
    const response = await telarApi.post<LogAnalyticsEventResponse>(
      '/telar/server/analytics-events/log',
      payload
    );

    return response.data.data;
  } catch (error: any) {
    console.error('[analyticsEvents.actions] Error logging analytics event:', error);
    throw error;
  }
};
