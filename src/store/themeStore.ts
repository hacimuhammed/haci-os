import { create } from "zustand";

interface ThemeColors {
  background: string;
  text: string;
  accent: string;
}

interface ThemeState {
  currentTheme: {
    name: string;
    colors: ThemeColors;
  };
  setTheme: (themeName: string) => void;
}

const darkTheme = {
  name: "dark",
  colors: {
    background: "#1D1D1D",
    text: "#FFFFFF",
    accent: "#3584E4",
  },
};

const lightTheme = {
  name: "light",
  colors: {
    background: "#F6F5F4",
    text: "#000000",
    accent: "#3584E4",
  },
};

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: darkTheme,
  setTheme: (themeName) => {
    set((state) => ({
      ...state,
      currentTheme: themeName === "light" ? lightTheme : darkTheme,
    }));
  },
}));
