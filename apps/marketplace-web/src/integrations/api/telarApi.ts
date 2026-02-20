import axios from 'axios';

// Instancia para endpoints públicos (no requieren token)
const telarApiPublic = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Instancia para endpoints privados (requieren token)
const telarApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
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
