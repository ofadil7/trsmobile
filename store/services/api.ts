import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from './tokenService';

export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ?? 'http://trs.optimizehealthsolutions.ma/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
