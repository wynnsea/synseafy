import { create } from "zustand";

export interface ToastItem {
  id: number;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  showToast: (message: string) => void;
  dismissToast: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (message) => {
    const id = nextId++;
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { id, message }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 2400);
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
