import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callback for session expiry — set by AuthProvider
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

// Request interceptor: attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (onSessionExpired) {
          onSessionExpired();
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
