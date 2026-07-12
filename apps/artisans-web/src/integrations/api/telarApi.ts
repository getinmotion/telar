import axios from 'axios';
import { toastSuccess, toastError } from '@/utils/toast.utils';

const MUTATION_METHODS = new Set(['post', 'patch', 'put', 'delete']);

const raw = import.meta.env.VITE_BACKEND_URL as string | undefined;

// Si la app se sirvió desde un host que NO es localhost (p.ej. un iPad accede
// por la IP de LAN) pero VITE_BACKEND_URL apunta a localhost/127.0.0.1,
// reemplazar el host por el de la página para que la request sí llegue al API.
const BACKEND_URL = (() => {
  if (!raw || typeof window === 'undefined') return raw;
  const pageHost = window.location.hostname;
  const isLocalBackend = /\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(raw);
  const pageIsRemote = pageHost !== 'localhost' && pageHost !== '127.0.0.1';
  return isLocalBackend && pageIsRemote
    ? raw.replace(/\/\/(localhost|127\.0\.0\.1)/, `//${pageHost}`)
    : raw;
})();

const telarApi = axios.create({
  baseURL: BACKEND_URL,
});

telarApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('telar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

telarApi.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase() ?? '';
    // if (MUTATION_METHODS.has(method)) {
    //   toastSuccess(response);
    // }
    return response;
  },
  (error) => {
    if (!error?.config?._suppressToast) {
      toastError(error);
    }
    return Promise.reject(error);
  },
);

export { telarApi };
