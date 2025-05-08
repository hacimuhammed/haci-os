import { useSettingsStore } from "../store/settingsStore";
import { useState } from "react";
import { useThemeStore } from "../store/themeStore";

export const SettingsPanel = () => {
  const { appearance, system, setWallpaper, setLanguage, setTimeFormat } =
    useSettingsStore();
  const { currentTheme, setTheme } = useThemeStore();

  const [selectedTab, setSelectedTab] = useState<"appearance" | "system">(
    "appearance"
  );

  // Örnek duvar kağıtları
  const wallpapers = [
    "/wallpapers/Plucky_Puffin.webp",
    "/wallpapers/Plucky_Puffin_Dark.webp",
    "/wallpapers/Plucky_Puffin_Dimmed.webp",
    "/wallpapers/Plucky_Puffin_Light.webp",
    // Daha fazla duvar kağıdı eklenebilir
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white">
      <div className="flex border-b border-zinc-700">
        <button
          className={`px-4 py-2 ${
            selectedTab === "appearance" ? "bg-zinc-800" : ""
          }`}
          onClick={() => setSelectedTab("appearance")}
        >
          Görünüm
        </button>
        <button
          className={`px-4 py-2 ${
            selectedTab === "system" ? "bg-zinc-800" : ""
          }`}
          onClick={() => setSelectedTab("system")}
        >
          Sistem
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {selectedTab === "appearance" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Görünüm Ayarları</h2>

            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Tema</h3>
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded ${
                    currentTheme.name === "light"
                      ? "bg-blue-600"
                      : "bg-zinc-700"
                  }`}
                  onClick={() => setTheme("light")}
                >
                  Açık
                </button>
                <button
                  className={`px-4 py-2 rounded ${
                    currentTheme.name === "dark" ? "bg-blue-600" : "bg-zinc-700"
                  }`}
                  onClick={() => setTheme("dark")}
                >
                  Koyu
                </button>
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
                        ? "border-blue-600"
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
        )}

        {selectedTab === "system" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Sistem Ayarları</h2>

            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Dil</h3>
              <select
                className="bg-zinc-800 rounded px-3 py-2 w-full"
                value={system.language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
              </select>
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">Saat Formatı</h3>
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded ${
                    system.timeFormat === "12h" ? "bg-blue-600" : "bg-zinc-700"
                  }`}
                  onClick={() => setTimeFormat("12h")}
                >
                  12 Saat
                </button>
                <button
                  className={`px-4 py-2 rounded ${
                    system.timeFormat === "24h" ? "bg-blue-600" : "bg-zinc-700"
                  }`}
                  onClick={() => setTimeFormat("24h")}
                >
                  24 Saat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
