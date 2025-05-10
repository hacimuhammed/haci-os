import { create } from 'zustand';

type ThemeState = {
  currentTheme: {
    name: string;
  };
  setTheme: (themeName: string) => void;
};

export const useThemeStore = create<ThemeState>(set => ({
  currentTheme: { name: 'dark' },
  setTheme: (themeName) => {
    // DOM'da tema sınıfını güncelle
    const htmlElement = document.documentElement;

    if (themeName === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }

    // Kullanıcı tercihini yerel depolamaya kaydet
    localStorage.setItem('theme', themeName);

    set(state => ({
      ...state,
      currentTheme: { name: themeName },
    }));
  },
}));
