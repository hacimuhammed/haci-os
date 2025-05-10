import { create } from "zustand";
import { persist } from "zustand/middleware";
import service from "../services";

type AppearanceSettings = {
  wallpaperPath: string;
};

type SystemSettings = {
  language: string;
  timeFormat: "12h" | "24h";
};

export type WindowAnimationType =
  | "fade"
  | "scale"
  | "slide"
  | "flip"
  | "rotate"
  | "jellyfish"
  | "none";

type TweaksSettings = {
  iconPack: string;
  windowAnimation: WindowAnimationType;
};

type SettingsState = {
  appearance: AppearanceSettings;
  system: SystemSettings;
  tweaks: TweaksSettings;
  userId: string | null;
  isLoading: boolean;
  hasInitialized: boolean;
  setWallpaper: (path: string) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  setTimeFormat: (format: "12h" | "24h") => Promise<void>;
  setIconPack: (iconPack: string) => Promise<void>;
  setWindowAnimation: (animation: WindowAnimationType) => Promise<void>;
  initializeSettings: (userId: string) => Promise<void>;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      appearance: {
        wallpaperPath: "/wallpapers/Plucky_Puffin.webp",
      },
      system: {
        language: "en",
        timeFormat: "24h",
      },
      tweaks: {
        iconPack: "whitesur-light",
        windowAnimation: "fade",
      },
      userId: null,
      isLoading: false,
      hasInitialized: false,

      initializeSettings: async (userId: string) => {
        set({ isLoading: true });
        try {
          const settings = await service.settings.getSettings();
          set({
            appearance: {
              wallpaperPath:
                settings.wallpaperPath || "/wallpapers/Plucky_Puffin.webp",
            },
            system: {
              language: settings.language || "en",
              timeFormat: (settings.timeFormat as "12h" | "24h") || "24h",
            },
            tweaks: {
              iconPack: settings.iconPack || "whitesur-light",
              windowAnimation:
                (settings.windowAnimation as WindowAnimationType) || "fade",
            },
            userId,
            hasInitialized: true,
          });
        } catch (error) {
          console.error("Ayarlar yüklenirken bir hata oluştu:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      setWallpaper: async (path) => {
        const { userId } = get();
        set((state) => ({
          ...state,
          appearance: {
            ...state.appearance,
            wallpaperPath: path,
          },
        }));

        if (userId) {
          try {
            await service.settings.updateSettings({ wallpaperPath: path });
          } catch (error) {
            console.error(
              "Duvar kağıdı güncellenirken bir hata oluştu:",
              error
            );
          }
        }
      },

      setLanguage: async (language) => {
        const { userId } = get();
        set((state) => ({
          ...state,
          system: {
            ...state.system,
            language,
          },
        }));

        if (userId) {
          try {
            await service.settings.updateSettings({ language });
          } catch (error) {
            console.error("Dil güncellenirken bir hata oluştu:", error);
          }
        }
      },

      setTimeFormat: async (format) => {
        const { userId } = get();
        set((state) => ({
          ...state,
          system: {
            ...state.system,
            timeFormat: format,
          },
        }));

        if (userId) {
          try {
            await service.settings.updateSettings({ timeFormat: format });
          } catch (error) {
            console.error(
              "Zaman formatı güncellenirken bir hata oluştu:",
              error
            );
          }
        }
      },

      setIconPack: async (iconPack) => {
        const { userId } = get();
        set((state) => ({
          ...state,
          tweaks: {
            ...state.tweaks,
            iconPack,
          },
        }));

        if (userId) {
          try {
            await service.settings.updateSettings({ iconPack });
          } catch (error) {
            console.error("İkon paketi güncellenirken bir hata oluştu:", error);
          }
        }
      },

      setWindowAnimation: async (windowAnimation) => {
        const { userId } = get();
        set((state) => ({
          ...state,
          tweaks: {
            ...state.tweaks,
            windowAnimation,
          },
        }));

        if (userId) {
          try {
            await service.settings.updateSettings({ windowAnimation });
          } catch (error) {
            console.error(
              "Pencere animasyonu güncellenirken bir hata oluştu:",
              error
            );
          }
        }
      },
    }),
    {
      name: "gnome-settings",
    }
  )
);
