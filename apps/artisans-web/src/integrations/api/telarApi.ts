import axios from 'axios';
import { toastError } from '@/utils/toast.utils';

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
  (response) => response,
  (error) => {
    toastError(error);
    return Promise.reject(error);
  }
);

export { telarApi };
