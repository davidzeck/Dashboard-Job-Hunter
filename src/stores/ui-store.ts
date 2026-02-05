import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type Theme = "light" | "dark" | "system";

interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: Record<string, unknown> | null;
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Theme
  theme: Theme;

  // Modals
  modal: ModalState;

  // Toasts
  toasts: ToastMessage[];

  // Command palette
  commandPaletteOpen: boolean;

  // Loading states
  globalLoading: boolean;

  // Actions - Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Actions - Theme
  setTheme: (theme: Theme) => void;

  // Actions - Modal
  openModal: (type: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Actions - Toast
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Actions - Command Palette
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;

  // Actions - Loading
  setGlobalLoading: (loading: boolean) => void;
}

// Generate unique ID for toasts
const generateId = () => Math.random().toString(36).substring(2, 9);

export const useUIStore = create<UIState>()(
  persist(
    immer((set) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: "dark",
      modal: {
        isOpen: false,
        type: null,
        data: null,
      },
      toasts: [],
      commandPaletteOpen: false,
      globalLoading: false,

      // Sidebar actions
      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),

      setSidebarOpen: (open) =>
        set((state) => {
          state.sidebarOpen = open;
        }),

      toggleSidebarCollapse: () =>
        set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed;
        }),

      setSidebarCollapsed: (collapsed) =>
        set((state) => {
          state.sidebarCollapsed = collapsed;
        }),

      // Theme actions
      setTheme: (theme) =>
        set((state) => {
          state.theme = theme;
        }),

      // Modal actions
      openModal: (type, data = {}) =>
        set((state) => {
          state.modal = {
            isOpen: true,
            type,
            data,
          };
        }),

      closeModal: () =>
        set((state) => {
          state.modal = {
            isOpen: false,
            type: null,
            data: null,
          };
        }),

      // Toast actions
      addToast: (toast) =>
        set((state) => {
          const newToast: ToastMessage = {
            ...toast,
            id: generateId(),
            duration: toast.duration ?? 5000,
          };
          state.toasts.push(newToast);
        }),

      removeToast: (id) =>
        set((state) => {
          state.toasts = state.toasts.filter((t) => t.id !== id);
        }),

      clearToasts: () =>
        set((state) => {
          state.toasts = [];
        }),

      // Command palette actions
      toggleCommandPalette: () =>
        set((state) => {
          state.commandPaletteOpen = !state.commandPaletteOpen;
        }),

      setCommandPaletteOpen: (open) =>
        set((state) => {
          state.commandPaletteOpen = open;
        }),

      // Loading actions
      setGlobalLoading: (loading) =>
        set((state) => {
          state.globalLoading = loading;
        }),
    })),
    {
      name: "jobscout-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

// Selectors
export const selectSidebarOpen = (state: UIState) => state.sidebarOpen;
export const selectSidebarCollapsed = (state: UIState) => state.sidebarCollapsed;
export const selectTheme = (state: UIState) => state.theme;
export const selectModal = (state: UIState) => state.modal;
export const selectToasts = (state: UIState) => state.toasts;
export const selectCommandPaletteOpen = (state: UIState) => state.commandPaletteOpen;
export const selectGlobalLoading = (state: UIState) => state.globalLoading;

// Helper hook for toast notifications
export const useToast = () => {
  const addToast = useUIStore((state) => state.addToast);
  const removeToast = useUIStore((state) => state.removeToast);

  return {
    success: (title: string, description?: string) =>
      addToast({ type: "success", title, description }),
    error: (title: string, description?: string) =>
      addToast({ type: "error", title, description }),
    warning: (title: string, description?: string) =>
      addToast({ type: "warning", title, description }),
    info: (title: string, description?: string) =>
      addToast({ type: "info", title, description }),
    dismiss: removeToast,
  };
};
