import axios from 'axios';

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

export { telarApi };
