import { useSettingsStore } from '@/store/settingsStore';
import { useEffect } from 'react';

export const AnimationPreview = ({ data }: { data?: any }) => {
  const { tweaks } = useSettingsStore();

  useEffect(() => {
    console.log('AnimationPreview render edildi');
    console.log('Data:', data);
  }, [data]);

  // Eğer data.content varsa (SettingsPanel'den gelen) o içeriği göster
  if (data?.content) {
    console.log('Özel içerik render ediliyor:', data.content);
    return data.content;
  }

  console.log('Varsayılan içerik render ediliyor');
  // Varsayılan görünüm (eski stil)
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-semibold mb-4">Animasyon Önizlemesi</h2>

      <div className="bg-card rounded-lg p-6 shadow-inner w-full">
        <p className="text-lg mb-2">
          Seçilen Animasyon:
          {' '}
          <span className="font-semibold">{tweaks.windowAnimation}</span>
        </p>
        <p className="text-muted-foreground mb-6">
          Bu pencere seçilen animasyon efekti ile açıldı ve 2 saniye sonra
          kapanacak.
        </p>
        <div className="animate-pulse text-center text-muted-foreground">
          Kapanış yakında...
        </div>
      </div>
    </div>
  );
};
