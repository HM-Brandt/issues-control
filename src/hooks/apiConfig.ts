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

// Interceptor de Request (Mantiene tu lógica actual)
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de Response (Corregido)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si no hay respuesta o no es un 401, o ya se intentó reintentar esta request, fallamos de inmediato
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // 1. CASO: Ya se está refrescando el token. Encolamos esta petición.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          // CORRECCIÓN 1: Marcar como _retry también a las peticiones en cola para evitar bucles
          originalRequest._retry = true;

          // CORRECCIÓN 2: Asegurar la asignación limpia de headers
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          };

          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // 2. CASO: Es la primera petición que falla. Iniciamos el proceso de refresh.
    originalRequest._retry = true;
    isRefreshing = true;

    const { refreshToken, login, logout } = useAuthStore.getState();

    if (!refreshToken) {
      logout();
      window.location.href = "https://ckarlosdev.github.io/login/";
      return Promise.reject(error);
    }

    try {
      // Usamos una instancia limpia de axios (no 'api') para evitar que pase por estos mismos interceptores
      const res = await axios.post(
        "https://api-gateway-px44.onrender.com/api/auth/refresh",
        { refreshToken },
      );

      const { token: newToken, refreshToken: newRefresh } = res.data;

      // Actualizamos Zustand
      login(newToken, newRefresh);

      // Despachamos todas las peticiones que se acumularon en la cola mientras esperaban
      processQueue(null, newToken);

      // Reintentamos la petición original que inició todo el flujo
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      };

      return api(originalRequest);
    } catch (refreshError) {
      // Si el refresh falla (ej. el refresh token expiró), limpiamos todo, deslogueamos y rechazamos la cola
      processQueue(refreshError, null);
      logout();
      window.location.href = "https://ckarlosdev.github.io/login/";
      return Promise.reject(refreshError);
    } finally {
      // Importante: Volvemos a habilitar el flag para futuros vencimientos de token
      isRefreshing = false;
    }
  },
);