/**
 * URLs Configuration
 * Manages links between Landing and App projects
 */

export const LANDING_URL = import.meta.env.PROD 
  ? 'https://telar.app' // Cambiar cuando configures tu dominio personalizado
  : 'http://localhost:8081'; // Puerto diferente para desarrollo local del landing

export const APP_URL = import.meta.env.PROD
  ? 'https://app.telar.app' // Este será el dominio de este proyecto
  : 'http://localhost:8080';

/**
 * Helper para crear links al landing desde la app
 */
export const getLandingUrl = (path: string = '') => {
  return `${LANDING_URL}${path}`;
};

/**
 * Helper para crear links a la app desde el landing
 */
export const getAppUrl = (path: string = '') => {
  return `${APP_URL}${path}`;
};
