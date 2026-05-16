import axios from 'axios';

const agentsApi = axios.create({
  baseURL: import.meta.env.VITE_AGENTS_URL ?? 'http://localhost:8000',
  timeout: 30_000,
});

agentsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('telar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { agentsApi };
