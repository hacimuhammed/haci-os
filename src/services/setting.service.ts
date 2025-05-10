import { WindowAnimationType } from "../store/settingsStore";

interface SettingsData {
  wallpaperPath?: string;
  language?: string;
  timeFormat?: "12h" | "24h";
  iconPack?: string;
  windowAnimation?: WindowAnimationType;
}

export class SettingsService {
  private baseUrl = "/api/settings";

  async getSettings(): Promise<SettingsData> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`Ayarlar alınamadı: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ayarlar yüklenirken bir hata oluştu:", error);
      throw error;
    }
  }

  async updateSettings(settings: SettingsData): Promise<void> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Ayarlar güncellenemedi: ${response.status}`);
      }
    } catch (error) {
      console.error("Ayarlar güncellenirken bir hata oluştu:", error);
      throw error;
    }
  }
}
