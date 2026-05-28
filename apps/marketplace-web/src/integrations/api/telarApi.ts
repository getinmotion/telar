import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string | undefined;

if (!BACKEND_URL) {
  // Sin baseURL, axios manda las requests al mismo host del SPA → Vite responde
  // con index.html y todo el front explota. Avisamos fuerte en consola para
  // que el dev sepa qué arreglar.
  console.error(
    '[telarApi] VITE_BACKEND_URL no está configurada.\n' +
      '→ Crea apps/marketplace-web/.env con:\n' +
      '    VITE_BACKEND_URL=http://localhost:1010/telar/server\n' +
      '→ Reinicia Vite (Ctrl+C y `npm run dev` de nuevo — las VITE_* no recargan en caliente).',
  );
}

// Instancia para endpoints públicos (no requieren token)
const telarApiPublic = axios.create({
  baseURL: BACKEND_URL,
});

// Instancia para endpoints privados (requieren token)
const telarApi = axios.create({
  baseURL: BACKEND_URL,
});

telarApi.interceptors.request.use((config) => {
  // Intentar obtener el token de localStorage primero
  let token = localStorage.getItem('telar_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de respuesta para manejar errores de autenticación
telarApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si error 401, limpiar token local
    if (error.response?.status === 401) {
      localStorage.removeItem('telar_token');
    }
    return Promise.reject(error);
  }
);

export { telarApi, telarApiPublic };
