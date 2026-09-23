import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastState = {
  toasts: Toast[];
  show: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (message, variant = "success") => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
    // Hilang otomatis setelah 3 detik
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },

  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Helper singkat dipakai di luar komponen React. */
export const toast = {
  success: (msg: string) => useToastStore.getState().show(msg, "success"),
  error: (msg: string) => useToastStore.getState().show(msg, "error"),
  info: (msg: string) => useToastStore.getState().show(msg, "info"),
};
