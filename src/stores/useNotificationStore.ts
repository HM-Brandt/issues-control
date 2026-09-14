import { create } from "zustand";

export interface NotificationState {
  show: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface NotificationStore {
  notification: NotificationState | null;
  notify: (data: Omit<NotificationState, "show">) => void;
  clearNotification: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notification: null,
  notify: (data) =>
    set({
      notification: { ...data, show: true },
    }),
  clearNotification: () => set({ notification: null }),
}));