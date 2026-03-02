import axios from 'axios';
import { toastSuccess, toastError } from '@/utils/toast.utils';

const MUTATION_METHODS = new Set(['post', 'patch', 'put', 'delete']);

const telarApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
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
    if (MUTATION_METHODS.has(method)) {
      toastSuccess(response);
    }
    return response;
  },
  (error) => {
    toastError(error);
    return Promise.reject(error);
  },
);

export { telarApi };
