import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  token: string | null;
  refreshToken?: string | null;
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

const storedToken = localStorage.getItem("auth_token");
const storedRefreshToken = localStorage.getItem("refresh_token");

export const useAuthStore = create<AuthState>((set) => ({
  // token: storedToken,
  // refreshToken: storedRefreshToken,
  // isAuthenticated: !!storedToken,
  user: null,

  token:
    "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX0FETUlOIl0sInN1YiI6ImNyYW1pcmV6QGhtYnJhbmR0LmNvbSIsImlhdCI6MTc4OTA1NzY1OSwiZXhwIjoxNzg5MDU4NTU5fQ.Imy7iLWy1g2T4pj5wE4B_w4-QON6Ozoj4v-Y5oPLX6E",
  refreshToken:
    "b9741aa4-1b7b-4a82-9f8c-6bf7408f8c4e.71773b7d-bd85-41ab-a06f-2b71fac33805",
  isAuthenticated: true,

  login: (token: string, refreshToken: string) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("refresh_token", refreshToken);
    set({ token, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    set({
      token: null,
      isAuthenticated: false,
      user: null,
      refreshToken: null,
    });
  },

  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));
