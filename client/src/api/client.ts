import axios from 'axios';

import { getIdToken } from '../auth/token';
import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
