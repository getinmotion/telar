import axios from 'axios';

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;

// Si la app se sirvió desde un host que NO es localhost (p.ej. un iPad accede
// por la IP de LAN) pero VITE_BACKEND_URL apunta a localhost/127.0.0.1,
// reemplazar el host por el de la página para que la request sí llegue al API.
const BACKEND_URL = (() => {
  if (!rawBackendUrl || typeof window === 'undefined') return rawBackendUrl;
  const pageHost = window.location.hostname;
  const isLocalBackend = /\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(rawBackendUrl);
  const pageIsRemote = pageHost !== 'localhost' && pageHost !== '127.0.0.1';
  return isLocalBackend && pageIsRemote
    ? rawBackendUrl.replace(/\/\/(localhost|127\.0\.0\.1)/, `//${pageHost}`)
    : rawBackendUrl;
})();

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
