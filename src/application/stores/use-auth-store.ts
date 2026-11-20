import { create } from "zustand";

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
  provider: "email" | "google";
}

interface AuthState {
  user: AuthUser | null;
  signInWithEmail: (email: string) => void;
  registerWithEmail: (name: string, email: string) => void;
  signInWithGoogle: () => void;
  updateProfileName: (name: string) => void;
  signOut: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "WS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  signInWithEmail: (email) => {
    const fallbackName = email.split("@")[0] || "Wynnsea";
    const formatted =
      fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);
    set({
      user: {
        name: formatted,
        email,
        initials: getInitials(formatted),
        provider: "email",
      },
    });
  },

  registerWithEmail: (name, email) => {
    const cleanName = name.trim() || "Wynnsea";
    set({
      user: {
        name: cleanName,
        email,
        initials: getInitials(cleanName),
        provider: "email",
      },
    });
  },

  signInWithGoogle: () => {
    set({
      user: {
        name: "Wynnsea",
        email: "wynnsea@gmail.com",
        initials: "WS",
        provider: "google",
      },
    });
  },

  updateProfileName: (name) =>
    set((state) => {
      if (!state.user) return state;
      const cleanName = name.trim() || state.user.name;
      return {
        user: {
          ...state.user,
          name: cleanName,
          initials: getInitials(cleanName),
        },
      };
    }),

  signOut: () => set({ user: null }),
}));
