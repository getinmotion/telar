/**
 * Toast Utilities
 * Sistema de alertas para respuestas HTTP usando sonner
 */

import { toast } from 'sonner';

const MESSAGES_HTTP: Record<number, string> = {
  200: 'OK',
  201: 'Creado correctamente',
  204: 'Actualizado correctamente',
  400: 'Solicitud incorrecta',
  401: 'No autorizado',
  403: 'Prohibido',
  404: 'Registro no encontrado',
  409: 'Conflicto',
  500: 'Error interno del servidor',
};

interface SuccessResponse {
  status: number;
  data?: {
    message?: string;
  };
}

interface ErrorResponse {
  statusCode?: number;
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
}

/**
 * Muestra un toast para respuestas HTTP exitosas (2xx).
 *
 * @example
 * const response = await telarApi.post('/endpoint', data);
 * toastSuccess(response);
 */
export function toastSuccess(response: SuccessResponse): void {
  const message = response?.data?.message ?? null;

  if (response?.status) {
    showToast({ statusCode: response.status, message });
  }
}

/**
 * Muestra un toast para errores HTTP (4xx y 5xx) de axios.
 *
 * @example
 * try {
 *   await telarApi.post('/endpoint', data);
 * } catch (error) {
 *   toastError(error);
 * }
 */
export function toastError(error: ErrorResponse | any): void {

  const statusCode =
    error?.response?.status ||
    error?.statusCode ||
    error?.status ||
    500;

  const message =
    error?.response?.data?.message?.message ||
    error?.response?.data?.error ||
    error?.message ||
    null;


  showToast({ statusCode, message });
}

function showToast({
  statusCode,
  message,
}: {
  statusCode: number;
  message?: string | null;
}): void {
  const finalMessage = message || MESSAGES_HTTP[statusCode] || 'Error desconocido';

  if (statusCode >= 200 && statusCode < 300) {
    toast.success(finalMessage, { duration: 3000 });
  } else if (statusCode >= 400 && statusCode < 500) {
    console.log('es un warning')
    toast.warning(finalMessage, {
      duration: 4000,
      description: `Código de error: ${statusCode}`,
    });
  } else if (statusCode >= 500) {
    toast.error(finalMessage, {
      duration: 5000,
      description: `Código de error: ${statusCode}`,
    });
  } else {
    toast.info(finalMessage, { duration: 3000 });
  }
}
