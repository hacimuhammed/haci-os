import { create } from "zustand";

interface Window {
  id: string;
  title: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  originalSize?: { width: number; height: number }; // Son normal boyut
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  fileId?: string;
  mode?: "open" | "save"; // Dosya açma/kaydetme modu
  data?: any; // Pencere ile ilgili ek veri
  snapPosition?: "left" | "right" | "none"; // Pencere konumlandırma
}

interface WindowManagerState {
  windows: Window[];
  activeWindowId: string | null;
  previousWindowId: string | null;
  windowHistory: string[]; // Aktif pencere geçmişi, en son olanlar başta
  isAltQOpen: boolean; // Alt+Q menüsü açık mı
  selectedWindowIndex: number; // Alt+Q menüsünde seçili pencere
  splitterPosition: number; // Ekran bölücü pozisyonu (0-100 arası yüzde)
  isSplitterVisible: boolean; // Ekran bölücü görünür mü
  addWindow: (window: Window) => void;
  removeWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  setActiveWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  openAltQSwitcher: () => void;
  closeAltQSwitcher: () => void;
  selectNextWindow: () => void;
  selectPreviousWindow: () => void;
  confirmAltQSelection: () => void;
  quickSwitchToLastWindow: () => void;
  snapWindowToLeft: (id: string) => void;
  snapWindowToRight: (id: string) => void;
  updateSplitterPosition: (position: number) => void;
  setSplitterVisibility: (isVisible: boolean) => void;
  endSplitOnDrag: (draggedWindowId: string) => void;
}

export const useWindowManagerStore = create<WindowManagerState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  previousWindowId: null,
  windowHistory: [],
  isAltQOpen: false,
  selectedWindowIndex: 0,
  splitterPosition: 50, // Varsayılan olarak %50
  isSplitterVisible: false,
  addWindow: (window) =>
    set((state) => {
      // Aktif pencere olarak işaretle
      const windowWithActiveFlag = {
        ...window,
        zIndex: Math.max(...state.windows.map((w) => w.zIndex), 0) + 1,
        originalSize: window.size, // İlk boyutu kaydet
      };

      // Pencere geçmişini güncelle
      const newHistory = state.activeWindowId
        ? [
            state.activeWindowId,
            ...state.windowHistory.filter((id) => id !== state.activeWindowId),
          ]
        : state.windowHistory;

      return {
        windows: [...state.windows, windowWithActiveFlag],
        activeWindowId: window.id,
        previousWindowId: state.activeWindowId,
        windowHistory: newHistory,
      };
    }),
  removeWindow: (id) =>
    set((state) => {
      const newWindows = state.windows.filter((w) => w.id !== id);
      // Aktif pencere kapatıldıysa, en üstteki pencereyi aktif yap
      let newActiveWindowId = state.activeWindowId;
      if (state.activeWindowId === id) {
        const highestZIndex = Math.max(...newWindows.map((w) => w.zIndex), 0);
        const newActiveWindow = newWindows.find(
          (w) => w.zIndex === highestZIndex
        );
        newActiveWindowId = newActiveWindow ? newActiveWindow.id : null;
      }

      // Geçmişten kaldırılan pencereyi çıkar
      const newHistory = state.windowHistory.filter((wId) => wId !== id);

      // Önceki pencereyi güncelle
      let newPreviousWindowId = state.previousWindowId;
      if (state.previousWindowId === id) {
        newPreviousWindowId = newHistory.length > 0 ? newHistory[0] : null;
      }

      return {
        windows: newWindows,
        activeWindowId: newActiveWindowId,
        previousWindowId: newPreviousWindowId,
        windowHistory: newHistory,
      };
    }),
  updateWindow: (id, updates) =>
    set((state) => {
      // Eğer boyut güncelleniyorsa ve pencere snap pozisyonunda değilse
      // (solda veya sağda değilse) orijinal boyutu güncelle
      let updatedWindows = state.windows.map((window) => {
        if (window.id === id) {
          const shouldUpdateOriginalSize =
            updates.size &&
            !window.snapPosition &&
            (!updates.snapPosition || updates.snapPosition === "none");

          return {
            ...window,
            ...updates,
            originalSize: shouldUpdateOriginalSize
              ? updates.size
              : window.originalSize,
          };
        }
        return window;
      });

      return {
        windows: updatedWindows,
      };
    }),
  setActiveWindow: (id) =>
    set((state) => {
      const maxZIndex = Math.max(...state.windows.map((w) => w.zIndex), 0);

      // Pencere geçmişini güncelle
      const newHistory =
        state.activeWindowId && state.activeWindowId !== id
          ? [
              state.activeWindowId,
              ...state.windowHistory.filter(
                (wId) => wId !== state.activeWindowId && wId !== id
              ),
            ]
          : state.windowHistory.filter((wId) => wId !== id);

      return {
        activeWindowId: id,
        previousWindowId:
          state.activeWindowId !== id
            ? state.activeWindowId
            : state.previousWindowId,
        windowHistory: newHistory,
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, zIndex: maxZIndex + 1 } : w
        ),
      };
    }),
  bringToFront: (id) =>
    set((state) => {
      const maxZIndex = Math.max(...state.windows.map((w) => w.zIndex), 0);

      // Pencere geçmişini güncelle
      const newHistory =
        state.activeWindowId && state.activeWindowId !== id
          ? [
              state.activeWindowId,
              ...state.windowHistory.filter(
                (wId) => wId !== state.activeWindowId && wId !== id
              ),
            ]
          : state.windowHistory.filter((wId) => wId !== id);

      return {
        activeWindowId: id,
        previousWindowId:
          state.activeWindowId !== id
            ? state.activeWindowId
            : state.previousWindowId,
        windowHistory: newHistory,
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, zIndex: maxZIndex + 1 } : w
        ),
      };
    }),
  openAltQSwitcher: () =>
    set((state) => {
      // Alt+Q menüsünü aç
      // Mevcut pencerelerin ID'leri ile başlayarak, windowHistory'den hiç görüntülenmeyen pencereleri ekle
      const visibleWindowIds = state.windows
        .filter((w) => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex) // z-index'e göre sırala
        .map((w) => w.id);

      return {
        isAltQOpen: true,
        selectedWindowIndex: 1, // Bir sonraki pencereyi seç (aktif pencere 0. indekste)
      };
    }),
  closeAltQSwitcher: () =>
    set({
      isAltQOpen: false,
      selectedWindowIndex: 0,
    }),
  selectNextWindow: () =>
    set((state) => {
      const visibleWindows = state.windows.filter((w) => !w.isMinimized);
      if (visibleWindows.length <= 1) return state;

      const newIndex = (state.selectedWindowIndex + 1) % visibleWindows.length;
      return {
        selectedWindowIndex: newIndex,
      };
    }),
  selectPreviousWindow: () =>
    set((state) => {
      const visibleWindows = state.windows.filter((w) => !w.isMinimized);
      if (visibleWindows.length <= 1) return state;

      const newIndex =
        (state.selectedWindowIndex - 1 + visibleWindows.length) %
        visibleWindows.length;
      return {
        selectedWindowIndex: newIndex,
      };
    }),
  confirmAltQSelection: () =>
    set((state) => {
      if (!state.isAltQOpen) return state;

      const visibleWindows = state.windows
        .filter((w) => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex);

      if (visibleWindows.length === 0) return state;

      // Seçilen pencere indeksi sınırlar içinde mi kontrol et
      const safeIndex = Math.min(
        state.selectedWindowIndex,
        visibleWindows.length - 1
      );
      const selectedWindow = visibleWindows[safeIndex];

      // Pencere geçmişini güncelle
      const newHistory =
        state.activeWindowId && state.activeWindowId !== selectedWindow.id
          ? [
              state.activeWindowId,
              ...state.windowHistory.filter(
                (id) => id !== state.activeWindowId && id !== selectedWindow.id
              ),
            ]
          : state.windowHistory.filter((id) => id !== selectedWindow.id);

      const maxZIndex = Math.max(...state.windows.map((w) => w.zIndex), 0);

      return {
        isAltQOpen: false,
        selectedWindowIndex: 0,
        activeWindowId: selectedWindow.id,
        previousWindowId: state.activeWindowId,
        windowHistory: newHistory,
        windows: state.windows.map((w) =>
          w.id === selectedWindow.id ? { ...w, zIndex: maxZIndex + 1 } : w
        ),
      };
    }),
  quickSwitchToLastWindow: () =>
    set((state) => {
      if (!state.previousWindowId) return state;

      // Önceki pencere hala var mı kontrol et
      const prevWindow = state.windows.find(
        (w) => w.id === state.previousWindowId
      );
      if (!prevWindow) return state;

      const maxZIndex = Math.max(...state.windows.map((w) => w.zIndex), 0);

      // Pencere geçmişini güncelle
      const newHistory = state.activeWindowId
        ? [
            state.activeWindowId,
            ...state.windowHistory.filter(
              (id) =>
                id !== state.activeWindowId && id !== state.previousWindowId
            ),
          ]
        : state.windowHistory.filter((id) => id !== state.previousWindowId);

      return {
        activeWindowId: state.previousWindowId,
        previousWindowId: state.activeWindowId,
        windowHistory: newHistory,
        windows: state.windows.map((w) =>
          w.id === state.previousWindowId ? { ...w, zIndex: maxZIndex + 1 } : w
        ),
      };
    }),
  // Pencereyi sol yarıya konumlandır
  snapWindowToLeft: (id) =>
    set((state) => {
      const windowObj = state.windows.find((w) => w.id === id);
      if (!windowObj) return state;

      // Ekranın sol yarısını kaplayan pencere boyutu
      const screenWidth = globalThis.window.innerWidth || 1920; // Varsayılan değer
      const screenHeight = globalThis.window.innerHeight || 1080; // Varsayılan değer

      // Splitter pozisyonu kadar genişlik
      const width = (screenWidth * state.splitterPosition) / 100;

      const updatedWindow = {
        ...windowObj,
        position: { x: 0, y: 0 },
        size: { width, height: screenHeight },
        snapPosition: "left" as const,
        // Eğer pencere önceden bölünmüş değilse ve orijinal boyut yoksa
        // mevcut boyutu orijinal olarak kaydet
        originalSize: windowObj.originalSize || windowObj.size,
      };

      // Sağda bir pencere var mı kontrol et
      const rightWindow = state.windows.find((w) => w.snapPosition === "right");

      // Bölücüyü göster
      const shouldShowSplitter = rightWindow !== undefined;

      return {
        windows: state.windows.map((w) => (w.id === id ? updatedWindow : w)),
        isSplitterVisible: shouldShowSplitter,
      };
    }),
  // Pencereyi sağ yarıya konumlandır
  snapWindowToRight: (id) =>
    set((state) => {
      const windowObj = state.windows.find((w) => w.id === id);
      if (!windowObj) return state;

      // Ekranın sağ yarısını kaplayan pencere boyutu
      const screenWidth = globalThis.window.innerWidth || 1920; // Varsayılan değer
      const screenHeight = globalThis.window.innerHeight || 1080; // Varsayılan değer

      // Splitter pozisyonu sonrası genişlik
      const width = (screenWidth * (100 - state.splitterPosition)) / 100;
      const xPosition = (screenWidth * state.splitterPosition) / 100;

      const updatedWindow = {
        ...windowObj,
        position: { x: xPosition, y: 0 },
        size: { width, height: screenHeight },
        snapPosition: "right" as const,
        // Eğer pencere önceden bölünmüş değilse ve orijinal boyut yoksa
        // mevcut boyutu orijinal olarak kaydet
        originalSize: windowObj.originalSize || windowObj.size,
      };

      // Solda bir pencere var mı kontrol et
      const leftWindow = state.windows.find((w) => w.snapPosition === "left");

      // Bölücüyü göster
      const shouldShowSplitter = leftWindow !== undefined;

      return {
        windows: state.windows.map((w) => (w.id === id ? updatedWindow : w)),
        isSplitterVisible: shouldShowSplitter,
      };
    }),
  // Bölücü pozisyonunu güncelle
  updateSplitterPosition: (position) =>
    set((state) => {
      const screenWidth = globalThis.window.innerWidth || 1920;
      const screenHeight = globalThis.window.innerHeight || 1080;

      // Pozisyon sınırlaması
      const clampedPosition = Math.max(20, Math.min(80, position));

      // Sol ve sağ pencereleri bul
      const leftWindow = state.windows.find((w) => w.snapPosition === "left");
      const rightWindow = state.windows.find((w) => w.snapPosition === "right");

      // Pencereleri güncelle
      const updatedWindows = state.windows.map((w) => {
        if (w.snapPosition === "left") {
          const width = (screenWidth * clampedPosition) / 100;
          return {
            ...w,
            size: { ...w.size, width },
          };
        } else if (w.snapPosition === "right") {
          const width = (screenWidth * (100 - clampedPosition)) / 100;
          const xPosition = (screenWidth * clampedPosition) / 100;
          return {
            ...w,
            position: { ...w.position, x: xPosition },
            size: { ...w.size, width },
          };
        }
        return w;
      });

      return {
        splitterPosition: clampedPosition,
        windows: updatedWindows,
      };
    }),
  // Bölücü görünürlüğünü ayarla
  setSplitterVisibility: (isVisible) => set({ isSplitterVisible: isVisible }),
  // Sürükleme başladığında bölünme durumunu sonlandır
  endSplitOnDrag: (draggedWindowId) =>
    set((state) => {
      // Sürüklenen pencere
      const draggedWindow = state.windows.find((w) => w.id === draggedWindowId);
      if (!draggedWindow) return state;

      // Split durumundaki tüm pencereleri bul
      const leftWindow = state.windows.find((w) => w.snapPosition === "left");
      const rightWindow = state.windows.find((w) => w.snapPosition === "right");

      // Eğer hiç split pencere yoksa işlem yapma
      if (!leftWindow && !rightWindow) return state;

      // Sürüklenen pencere bir snap pozisyonunda mı?
      const isDraggedWindowSnapped = !!draggedWindow.snapPosition;

      // Güncellenen pencereler
      const updatedWindows = state.windows.map((w) => {
        // Sürüklenen pencere
        if (w.id === draggedWindowId) {
          return {
            ...w,
            snapPosition: undefined,
            size: w.originalSize || w.size,
          };
        }
        // Diğer snap pozisyonundaki pencere (karşılaştırma penceresi)
        else if (
          (w.id === leftWindow?.id || w.id === rightWindow?.id) &&
          w.id !== draggedWindowId
        ) {
          return {
            ...w,
            snapPosition: undefined,
            // Eğer sürüklenen pencere snap modunda değilse, diğer pencereler için de orijinal boyuta dön
            ...(isDraggedWindowSnapped
              ? {}
              : { size: w.originalSize || w.size }),
          };
        }
        return w;
      });

      return {
        windows: updatedWindows,
        isSplitterVisible: false,
      };
    }),
}));
