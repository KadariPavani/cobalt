import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Silent token refresh on 401 -------------------------------------------
let refreshPromise = null;

const requestRefresh = async () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true, timeout: 15_000 }
      )
      .then((res) => {
        const { accessToken, user } = res.data?.data || {};
        useAuthStore.getState().setAuth({ accessToken, user });
        return accessToken;
      })
      .catch((err) => {
        useAuthStore.getState().clear();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    if (!response || !config) throw error;

    // Don't try to refresh on auth endpoints themselves
    const isAuthEndpoint =
      typeof config.url === 'string' &&
      (config.url.includes('/auth/login') ||
        config.url.includes('/auth/register') ||
        config.url.includes('/auth/refresh') ||
        config.url.includes('/auth/logout'));

    if (response.status === 401 && !config.__isRetry && !isAuthEndpoint) {
      config.__isRetry = true;
      try {
        const newToken = await requestRefresh();
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
          return api(config);
        }
      } catch {
        // fall through to reject
      }
    }
    throw error;
  }
);

export const apiMessage = (err, fallback = 'Something went wrong') => {
  const data = err?.response?.data;
  if (data?.errors?.length) return data.errors[0].message || fallback;
  return data?.message || err?.message || fallback;
};
