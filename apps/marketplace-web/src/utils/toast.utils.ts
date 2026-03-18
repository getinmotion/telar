/**
 * Toast Utilities
 * Sistema de alertas para respuestas HTTP usando sonner
 */

import { toast } from 'sonner';

/**
 * Mensajes predefinidos para códigos HTTP
 */
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

/**
 * Interfaz para respuestas HTTP exitosas (2xx)
 */
interface SuccessResponse {
  status: number;
  data?: {
    message?: string;
  };
}

/**
 * Interfaz para respuestas HTTP de error (4xx, 5xx)
 */
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
 * Imprime un toast para respuestas HTTP exitosas (2xx).
 * Estas respuestas traen la información en response.data
 *
 * @param {SuccessResponse} response - Respuesta HTTP exitosa
 * @returns void
 *
 * @example
 * const response = await axios.post('/api/endpoint', data);
 * toastSuccess(response);
 */
export function toastSuccess(response: SuccessResponse): void {
  const message = response?.data?.message ?? null;

  if (response?.status) {
    showToast({
      statusCode: response.status,
      message,
    });
  }
}

/**
 * Imprime un toast para respuestas HTTP de error (4xx y 5xx).
 * Estos responses traen toda la información en error.response.data
 *
 * @param {ErrorResponse | any} error - Error HTTP de axios
 * @returns void
 *
 * @example
 * try {
 *   await axios.post('/api/endpoint', data);
 * } catch (error) {
 *   toastError(error);
 * }
 */
export function toastError(error: ErrorResponse | any): void {
  // Intentar extraer el status code de diferentes ubicaciones
  const statusCode =
    error?.response?.status ||
    error?.statusCode ||
    error?.status ||
    500;

  // Intentar extraer el mensaje de error de diferentes ubicaciones
  const message =
    error?.response?.data?.message?.message ||
    error?.response?.data?.error ||
    error?.message ||
    null;

    console.log('Estado',statusCode)
    console.log('Mensaje',message)

  showToast({
    statusCode,
    message,
  });
}

/**
 * Función interna que determina el tipo de toast a mostrar según el código de estado
 *
 * @param {Object} params - Parámetros
 * @param {number} params.statusCode - Código de estado HTTP
 * @param {string | null} params.message - Mensaje personalizado (opcional)
 * @returns void
 */
function showToast({
  statusCode,
  message,
}: {
  statusCode: number;
  message?: string | null;
}): void {
  // Obtener el mensaje final (personalizado o predefinido)
  const finalMessage = message || MESSAGES_HTTP[statusCode] || 'Error desconocido';

  // Determinar el tipo de toast según el código de estado
  if (statusCode >= 200 && statusCode < 300) {
    // Éxito (2xx)
    toast.success(finalMessage, {
      duration: 3000,
    });
  } else if (statusCode >= 400 && statusCode < 500) {
    // Error de cliente (4xx)
    toast.warning(finalMessage, {
      duration: 4000,
      description: `Código de error: ${statusCode}`,
    });
  } else if (statusCode >= 500) {
    // Error de servidor (5xx)
    toast.error(finalMessage, {
      duration: 5000,
      description: `Código de error: ${statusCode}`,
    });
  } else {
    // Otros casos
    toast.info(finalMessage, {
      duration: 3000,
    });
  }
}
