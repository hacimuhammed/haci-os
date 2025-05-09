import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { Button } from "./ui/button";
import {
  calculateCenterPosition,
  calculateCascadingPosition,
} from "../utils/window";
import { cn } from "../lib/utils";
import {
  useSettingsStore,
  type WindowAnimationType,
} from "../store/settingsStore";
import { useState } from "react";
import { useThemeStore } from "../store/themeStore";
import { useWindowManagerStore } from "../store/windowManagerStore";
import { v4 as uuidv4 } from "uuid";
import { getIconPath } from "../icons/iconPaths";

// AnimationType tipini import ediyorum
type AnimationType = "fade" | "scale" | "slide" | "flip" | "rotate" | "none";

export const SettingsPanel = () => {
  const {
    appearance,
    system,
    tweaks,
    setWallpaper,
    setLanguage,
    setTimeFormat,
    setIconPack,
    setWindowAnimation,
  } = useSettingsStore();
  const { currentTheme, setTheme } = useThemeStore();
  const { addWindow, removeWindow } = useWindowManagerStore();

  const [selectedTab, setSelectedTab] = useState<
    "appearance" | "system" | "tweaks"
  >("appearance");

  // Örnek duvar kağıtları
  const wallpapers = [
    "/wallpapers/Plucky_Puffin.webp",
    "/wallpapers/Plucky_Puffin_Dark.webp",
    "/wallpapers/Plucky_Puffin_Dimmed.webp",
    "/wallpapers/Plucky_Puffin_Light.webp",
  ];

  // Kullanılabilir ikon paketleri
  const iconPacks = [{ id: "whitesur-light", label: "WhiteSur Light" }];

  // Kullanılabilir pencere animasyonları
  const windowAnimations = [
    { id: "none", label: "Yok" },
    { id: "fade", label: "Solma" },
    { id: "scale", label: "Ölçekleme" },
    { id: "slide", label: "Kaydırma" },
    { id: "flip", label: "Çevirme" },
    { id: "rotate", label: "Döndürme" },
  ];

  // Sidebar menü öğeleri
  const sidebarItems = [
    { id: "appearance", label: "Görünüm", icon: "🎨" },
    { id: "system", label: "Sistem", icon: "⚙️" },
    { id: "tweaks", label: "İnce Ayarlar", icon: "🛠️" },
  ];

  // Görünüm içeriği
  const AppearanceContent = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Görünüm Ayarları</h2>

      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Tema</h3>
        <div className="flex space-x-2">
          <Button
            variant={currentTheme.name === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
          >
            Açık
          </Button>
          <Button
            variant={currentTheme.name === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
          >
            Koyu
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium mb-2">Duvar Kağıdı</h3>
        <div className="grid grid-cols-2 gap-2">
          {wallpapers.map((wallpaper) => (
            <div
              key={wallpaper}
              className={`relative cursor-pointer rounded overflow-hidden border-2 ${
                appearance.wallpaperPath === wallpaper
                  ? "border-primary"
                  : "border-transparent"
              }`}
              onClick={() => setWallpaper(wallpaper)}
            >
              <img
                src={wallpaper}
                alt="Duvar kağıdı"
                className="w-full h-24 object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Sistem içeriği
  const SystemContent = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Sistem Ayarları</h2>

      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Dil</h3>
        <select
          value={system.language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="en">English</option>
          <option value="tr">Türkçe</option>
        </select>
      </div>

      <div>
        <h3 className="text-md font-medium mb-2">Saat Formatı</h3>
        <div className="flex space-x-2">
          <Button onClick={() => setTimeFormat("12h")}>12 Saat</Button>
          <Button onClick={() => setTimeFormat("24h")}>24 Saat</Button>
        </div>
      </div>
    </div>
  );

  // Tweaks içeriği
  const TweaksContent = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">İnce Ayarlar</h2>

      <div className="mb-8">
        <h3 className="text-md font-medium mb-2">İkon Paketi</h3>
        <select
          value={tweaks.iconPack}
          onChange={(e) => setIconPack(e.target.value)}
          className="w-full p-2 rounded-md border border-input bg-background text-sm"
        >
          {iconPacks.map((pack) => (
            <option key={pack.id} value={pack.id}>
              {pack.label}
            </option>
          ))}
        </select>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Önizleme</h4>
          <div className="grid grid-cols-4 gap-4 bg-card p-4 rounded-md">
            <div className="flex flex-col items-center">
              <img
                src={getIconPath(tweaks.iconPack, "terminal")}
                alt="Terminal"
                className="w-12 h-12 mb-2"
              />
              <span className="text-xs">Terminal</span>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={getIconPath(tweaks.iconPack, "file-manager")}
                alt="Dosyalar"
                className="w-12 h-12 mb-2"
              />
              <span className="text-xs">Dosyalar</span>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={getIconPath(tweaks.iconPack, "text-editor")}
                alt="Düzenleyici"
                className="w-12 h-12 mb-2"
              />
              <span className="text-xs">Düzenleyici</span>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={getIconPath(tweaks.iconPack, "preferences-system")}
                alt="Ayarlar"
                className="w-12 h-12 mb-2"
              />
              <span className="text-xs">Ayarlar</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Pencere Animasyonları</h3>
        <select
          value={tweaks.windowAnimation}
          onChange={(e) => {
            console.log("Seçilen animasyon:", e.target.value);
            setWindowAnimation(e.target.value as WindowAnimationType);
          }}
          className="w-full p-2 rounded-md border border-input bg-background text-sm"
        >
          {windowAnimations.map((animation) => (
            <option key={animation.id} value={animation.id}>
              {animation.label}
            </option>
          ))}
        </select>

        <div className="bg-card p-4 rounded-md mt-4">
          <h4 className="text-sm font-medium mb-2">Animasyon Önizlemesi</h4>
          <p className="text-xs text-muted-foreground mb-4">
            Pencereler açılırken ve kapanırken seçilen animasyon efekti
            uygulanacaktır. "Yok" seçeneği ile animasyonlar tamamen
            kapatılabilir.
          </p>
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                // Animasyon önizlemesi için bir pencere açılabilir
                const size = { width: 400, height: 300 };
                const position = calculateCascadingPosition(
                  size.width,
                  size.height
                );

                const id = uuidv4();
                addWindow({
                  id,
                  title: "Animasyon Önizlemesi",
                  type: "animation-preview",
                  position,
                  size,
                  isMinimized: false,
                  isMaximized: false,
                  zIndex: 1,
                });

                // 2 saniye sonra otomatik kapat
                setTimeout(() => {
                  removeWindow(id);
                }, 2000);
              }}
            >
              Animasyonu Test Et
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold">Ayarlar</h1>
        </div>
        <nav className="flex-1 p-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() =>
                setSelectedTab(item.id as "appearance" | "system" | "tweaks")
              }
              className={cn(
                "w-full flex items-center p-3 gap-3 rounded-md text-sm mb-1 transition-colors",
                selectedTab === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/30 text-sidebar-foreground"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">GNOME v1.0.0</p>
        </div>
      </div>

      {/* İçerik Alanı */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedTab === "appearance" ? (
          <AppearanceContent />
        ) : selectedTab === "system" ? (
          <SystemContent />
        ) : (
          <TweaksContent />
        )}
      </div>
    </div>
  );
};
