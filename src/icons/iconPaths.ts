// İkon verileri için tip tanımlamaları
type IconName =
  | "terminal"
  | "file-manager"
  | "text-editor"
  | "preferences-system";
type IconPackName = "whitesur-light" | "reversal-dark";
type IconPack = Record<IconName, string>;
type IconPathsType = Record<IconPackName, IconPack>;

// İkon paketlerine göre uygulama ikonlarının yollarını tutan nesne
export const iconPaths: IconPathsType = {
  "whitesur-light": {
    terminal: "/icons/whitesur-light/terminal.svg",
    "file-manager": "/icons/whitesur-light/file-manager.svg",
    "text-editor": "/icons/whitesur-light/text-editor.svg",
    "preferences-system": "/icons/whitesur-light/preferences-system.svg",
  },
  "reversal-dark": {
    terminal: "/icons/reversal-dark/terminal.svg",
    "file-manager": "/icons/reversal-dark/file-manager.svg",
    "text-editor": "/icons/reversal-dark/text-editor.svg",
    "preferences-system": "/icons/reversal-dark/preferences-system.svg",
  },
};

// Belirli bir icon paketinden belirli bir ikonu almak için yardımcı fonksiyon
export const getIconPath = (iconPack: string, iconName: string): string => {
  // İkon paketi mevcutsa ve istenen ikon o pakette varsa, yolunu döndür
  if (iconPack in iconPaths && iconName in (iconPaths as any)[iconPack]) {
    return (iconPaths as any)[iconPack][iconName];
  }

  // Varsayılan olarak bir placeholder dönebilir veya hata fırlatabilir
  console.warn(`İkon bulunamadı: ${iconPack}/${iconName}`);
  return "/icons/placeholder.svg";
};
