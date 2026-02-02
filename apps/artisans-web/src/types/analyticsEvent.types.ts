/**
 * Analytics Event Types
 * Tipos para eventos de analytics
 */

// ============= Request Types =============

export interface LogAnalyticsEventRequest {
  event_type: string;
  event_data?: Record<string, any>;
  session_id?: string;
  success?: boolean;
  duration_ms?: number;
}

// ============= Response Types =============

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  eventData: Record<string, any> | null;
  sessionId: string | null;
  success: boolean;
  durationMs: number | null;
  createdAt: string;
}

export interface LogAnalyticsEventResponse {
  success: true;
  data: AnalyticsEvent;
}

// ============= Error Types =============

export interface AnalyticsErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

// ============= Union Types =============

export type AnalyticsEventResponse = LogAnalyticsEventResponse | AnalyticsErrorResponse;
