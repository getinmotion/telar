import { ServiceUnavailableException } from '@nestjs/common';

const UNAVAILABLE_ERROR_CODES = [
  'CERT_HAS_EXPIRED',
  'ERR_TLS_CERT_ALTNAME_INVALID',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ETIMEDOUT',
  'ECONNABORTED',
];

export const AGENT_UNAVAILABLE_ERROR = 'AGENT_UNAVAILABLE';

export function isAgentUnavailableError(error: any): boolean {
  if (!error) {
    return false;
  }

  if (UNAVAILABLE_ERROR_CODES.includes(error.code)) {
    return true;
  }

  if (error.isAxiosError && !error.response) {
    return true;
  }

  return error.isAxiosError && error.response?.status >= 500;
}

export function buildAgentUnavailableException(): ServiceUnavailableException {
  return new ServiceUnavailableException({
    statusCode: 503,
    error: AGENT_UNAVAILABLE_ERROR,
    message: 'El servicio de agentes no está disponible',
  });
}
