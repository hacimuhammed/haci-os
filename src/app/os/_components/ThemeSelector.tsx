import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeStore } from '@/store/themeStore';

export const ThemeSelector = () => {
  const { currentTheme, setTheme } = useThemeStore();
  const { appearance, setWallpaper } = useSettingsStore();

  const availableWallpapers = [
    '/wallpapers/Plucky_Puffin.webp',
    // Eğer daha fazla duvar kağıdı eklemek isterseniz buraya ekleyebilirsiniz
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-medium mb-2">Tema</h3>
        <div className="flex space-x-2">
          <Button
            variant={currentTheme.name === 'dark' ? 'default' : 'outline'}
            onClick={() => setTheme('dark')}
          >
            Koyu
          </Button>
          <Button
            variant={currentTheme.name === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme('light')}
          >
            Açık
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Duvar Kağıdı</h3>
        <div className="grid grid-cols-2 gap-2">
          {availableWallpapers.map(wallpaper => (
            <div
              key={wallpaper}
              className={`relative cursor-pointer rounded-md overflow-hidden ${
                appearance.wallpaperPath === wallpaper
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
              onClick={() => setWallpaper(wallpaper)}
            >
              <img
                src={wallpaper}
                alt="Duvar kağıdı"
                className="w-full h-20 object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
