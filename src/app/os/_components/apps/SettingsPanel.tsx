import type { WindowAnimationType } from '@/store/settingsStore';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getIconPath } from '@/icons/iconPaths';
import { cn } from '@/lib/utils';
import {
  useSettingsStore,

} from '@/store/settingsStore';
import { useThemeStore } from '@/store/themeStore';
import { useWindowManagerStore } from '@/store/windowManagerStore';
import {
  calculateCenterPosition,
} from '@/utils/window';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
    'appearance' | 'system' | 'tweaks'
  >('appearance');

  // Örnek duvar kağıtları
  const wallpapers = [
    '/wallpapers/Plucky_Puffin.webp',
    '/wallpapers/Plucky_Puffin_Dark.webp',
    '/wallpapers/Plucky_Puffin_Dimmed.webp',
    '/wallpapers/Plucky_Puffin_Light.webp',
  ];

  // Kullanılabilir ikon paketleri
  const iconPacks = [
    { id: 'whitesur-light', label: 'WhiteSur Light' },
    { id: 'reversal-dark', label: 'Reversal Light' },
  ];

  // Kullanılabilir pencere animasyonları
  const windowAnimations = [
    { id: 'none', label: 'None' },
    { id: 'fade', label: 'Fade' },
    { id: 'scale', label: 'Scale' },
    { id: 'slide', label: 'Slide' },
    { id: 'flip', label: 'Flip' },
    { id: 'rotate', label: 'Rotate' },
    { id: 'jellyfish', label: 'Jellyfish' },
  ];

  // Sidebar menü öğeleri
  const sidebarItems = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'system', label: 'System' },
    { id: 'tweaks', label: 'Tweaks' },
  ];

  // Appearance içeriği
  const AppearanceContent = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Appearance Settings</h2>

      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Theme</h3>
        <div className="flex space-x-2">
          <Button
            variant={currentTheme.name === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme('light')}
          >
            Light
          </Button>
          <Button
            variant={currentTheme.name === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme('dark')}
          >
            Dark
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium mb-2">Wallpaper</h3>
        <div className="grid grid-cols-2 gap-2">
          {wallpapers.map(wallpaper => (
            <div
              key={wallpaper}
              className={`relative cursor-pointer rounded overflow-hidden border-2 ${
                appearance.wallpaperPath === wallpaper
                  ? 'border-primary'
                  : 'border-transparent'
              }`}
              onClick={() => setWallpaper(wallpaper)}
            >
              <img
                src={wallpaper}
                alt="Wallpaper"
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
      <h2 className="text-lg font-semibold mb-4">System Settings</h2>

      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Language</h3>
        <Select
          value={system.language}
          onValueChange={(value: string) => setLanguage(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="tr">Turkish</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-md font-medium mb-2">Time Format</h3>
        <div className="flex space-x-2">
          <Button
            variant={system.timeFormat === '12h' ? 'default' : 'outline'}
            onClick={() => setTimeFormat('12h')}
          >
            12 Hours
          </Button>
          <Button
            variant={system.timeFormat === '24h' ? 'default' : 'outline'}
            onClick={() => setTimeFormat('24h')}
          >
            24 Hours
          </Button>
        </div>
      </div>
    </div>
  );

  // Tweaks içeriği
  const TweaksContent = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Tweaks Settings</h2>

      <div className="mb-8">
        <h3 className="text-md font-medium mb-2">Icon Pack</h3>
        <Select
          value={tweaks.iconPack}
          onValueChange={(value: string) => setIconPack(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Icon Pack" />
          </SelectTrigger>
          <SelectContent>
            {iconPacks.map(pack => (
              <SelectItem key={pack.id} value={pack.id}>
                {pack.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Preview</h4>
          <div className="grid grid-cols-4 gap-4 bg-card p-4 rounded-md">
            <div className="flex flex-col items-center">
              <img
                src={getIconPath(tweaks.iconPack, 'terminal')}
                alt="Terminal"
                className="w-12 h-12 mb-2"
              />
              <span className="text-xs">Terminal</span>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={getIconPath(tweaks.iconPack, 'file-manager')}
                alt="Files"
                className="w-12 h-12 mb-2"
              />
              <span className="text-xs">Files</span>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={getIconPath(tweaks.iconPack, 'text-editor')}
                alt="Text Editor"
                className="w-12 h-12 mb-2"
              />
              <span className="text-xs">Text Editor</span>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={getIconPath(tweaks.iconPack, 'preferences-system')}
                alt="Settings"
                className="w-12 h-12 mb-2"
              />
              <span className="text-xs">Settings</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Window Animations</h3>
        <Select
          value={tweaks.windowAnimation}
          onValueChange={(value: string) =>
            setWindowAnimation(value as WindowAnimationType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Animation" />
          </SelectTrigger>
          <SelectContent>
            {windowAnimations.map(animation => (
              <SelectItem key={animation.id} value={animation.id}>
                {animation.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="bg-card p-4 rounded-md mt-4">
          <h4 className="text-sm font-medium mb-2">Animation Preview</h4>
          <p className="text-xs text-muted-foreground mb-4">
            Windows will apply the selected animation when they open and close.
            The "None" option will completely disable animations.
          </p>
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                // Debug mesajı
                console.log('Animasyon test butonuna tıklandı');

                // Animasyon önizlemesi için bir pencere açılabilir
                const size = { width: 400, height: 300 };
                const position = calculateCenterPosition(
                  size.width,
                  size.height,
                );

                console.log('Hesaplanan pozisyon:', position);

                const id = uuidv4();
                console.log('Oluşturulan pencere ID:', id);
                try {
                  // Daha basit bir içerik oluştur
                  const customContent = (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-center max-w-md bg-background p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold mb-4">
                          {tweaks.windowAnimation}
                          {' '}
                          Animation
                        </h2>
                        <p className="mb-2">
                          This window is created for preview purposes and will
                          close in 3 seconds.
                        </p>
                      </div>
                    </div>
                  );

                  addWindow({
                    id,
                    title: 'Animation Preview',
                    type: 'animation-preview',
                    position,
                    size,
                    isMinimized: false,
                    isMaximized: false,
                    zIndex: 1,
                    data: {
                      content: customContent,
                    },
                  });
                  console.log('Window added successfully');
                } catch (error) {
                  console.error('Error adding window:', error);
                }

                setTimeout(() => {
                  console.log('Window is closing, ID:', id);
                  removeWindow(id);
                }, 3000);
              }}
            >
              Test Animation
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
          <h1 className="!text-base text-center font-bold">Settings</h1>
        </div>
        <nav className="flex-1 p-2 w-full flex flex-col gap-2">
          {sidebarItems.map(item => (
            <span
              key={item.id}
              onClick={() =>
                setSelectedTab(item.id as 'appearance' | 'system' | 'tweaks')}
              className={cn(
                'w-full flex justify-start font-normal text-left px-4 py-2 rounded-md',
                selectedTab === item.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/30 hover:text-sidebar-foreground',
              )}
            >
              <span>{item.label}</span>
            </span>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">GNOME v1.0.0</p>
        </div>
      </div>

      {/* İçerik Alanı */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedTab === 'appearance'
          ? (
              <AppearanceContent />
            )
          : selectedTab === 'system'
            ? (
                <SystemContent />
              )
            : (
                <TweaksContent />
              )}
      </div>
    </div>
  );
};
