import axios from "axios";
import { useAuthStore } from "../stores/authStore";

export const API_BASE_URL = "https://api-gateway-px44.onrender.com/api/";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Interceptor de Request
api.interceptors.request.use(
  (config) => {
    const token =
      useAuthStore.getState().token || localStorage.getItem("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de Response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Evitar interceptar peticiones que no tengan respuesta o no sean 401
    // Y evitar interceptar la propia petición de refresh token si falla
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/api/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // 2. Si ya hay un refresh en curso, encolar las peticiones concurrentes
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest._retry = true;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken =
      useAuthStore.getState().refreshToken ||
      localStorage.getItem("refresh_token");

    const { login, logout } = useAuthStore.getState();

    // Si no existe refresh token localmente, cerrar sesión inmediatamente
    if (!refreshToken) {
      isRefreshing = false;
      logout();
      return Promise.reject(error);
    }

    try {
      // Petición aislada (usando una instancia limpia de axios, no "api")
      const res = await axios.post(
        "https://api-gateway-px44.onrender.com/api/auth/refresh",
        { refreshToken }, // Asegúrate de que tu backend espera el JSON { refreshToken: "..." }
      );

      // 3. Normalizar la respuesta por si el backend usa nombres de llaves distintos
      const data = res.data;
      const newToken =
        data.token || data.accessToken || data.access_token || data.jwt;
      const newRefresh =
        data.refreshToken || data.refresh_token || refreshToken;

      if (!newToken) {
        throw new Error("El backend no retornó un nuevo accesstoken válido.");
      }

      // Actualizar Zustand / localStorage
      login(newToken, newRefresh);

      // Procesar peticiones en cola acumuladas durante el refresh
      processQueue(null, newToken);

      // Actualizar el header de la petición fallida original y reintentar
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError: any) {
      // 4. Si la renovación falla, rechazar las peticiones en cola y desloguear
      processQueue(refreshError, null);
      logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
