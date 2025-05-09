import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppearanceSettings {
  wallpaperPath: string;
}

interface SystemSettings {
  language: string;
  timeFormat: "12h" | "24h";
}

export type WindowAnimationType =
  | "fade"
  | "scale"
  | "slide"
  | "flip"
  | "rotate"
  | "none";

interface TweaksSettings {
  iconPack: string;
  windowAnimation: WindowAnimationType;
}

interface SettingsState {
  appearance: AppearanceSettings;
  system: SystemSettings;
  tweaks: TweaksSettings;
  setWallpaper: (path: string) => void;
  setLanguage: (language: string) => void;
  setTimeFormat: (format: "12h" | "24h") => void;
  setIconPack: (iconPack: string) => void;
  setWindowAnimation: (animation: WindowAnimationType) => void;
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
      tweaks: {
        iconPack: "whitesur-light",
        windowAnimation: "rotate",
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
      setIconPack: (iconPack) => {
        set((state) => ({
          ...state,
          tweaks: {
            ...state.tweaks,
            iconPack,
          },
        }));
      },
      setWindowAnimation: (windowAnimation) => {
        console.log(windowAnimation);
        set((state) => ({
          ...state,
          tweaks: {
            ...state.tweaks,
            windowAnimation,
          },
        }));
      },
    }),
    {
      name: "gnome-settings",
    }
  )
);
