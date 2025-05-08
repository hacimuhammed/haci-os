import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppearanceSettings {
  wallpaperPath: string;
}

interface SystemSettings {
  language: string;
  timeFormat: "12h" | "24h";
}

interface SettingsState {
  appearance: AppearanceSettings;
  system: SystemSettings;
  setWallpaper: (path: string) => void;
  setLanguage: (language: string) => void;
  setTimeFormat: (format: "12h" | "24h") => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      appearance: {
        wallpaperPath: "/wallpapers/Plucky_Puffin.webp",
      },
      system: {
        language: "en",
        timeFormat: "24h",
      },
      setWallpaper: (path) => {
        set((state) => ({
          ...state,
          appearance: {
            ...state.appearance,
            wallpaperPath: path,
          },
        }));
      },
      setLanguage: (language) => {
        set((state) => ({
          ...state,
          system: {
            ...state.system,
            language,
          },
        }));
      },
      setTimeFormat: (format) => {
        set((state) => ({
          ...state,
          system: {
            ...state.system,
            timeFormat: format,
          },
        }));
      },
    }),
    {
      name: "gnome-settings",
    }
  )
);
