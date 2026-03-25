/**
 * Response Types - Estructuras de respuesta comunes
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface ApiError {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error?: string;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}
