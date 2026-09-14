import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

// Leemos localStorage explícitamente en el estado inicial
const initialToken = localStorage.getItem("auth_token");
const initialRefreshToken = localStorage.getItem("refresh_token");

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  refreshToken: initialRefreshToken,
  isAuthenticated: !!initialToken,
  user: null,

  // token:
  //   "",
  // refreshToken:
  //   "",
  // isAuthenticated: true,

  login: (token: string, refreshToken: string) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("refresh_token", refreshToken);
    set({ token, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth-storage"); // Borramos residuos viejos
    set({
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      user: null,
    });
  },

  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));
