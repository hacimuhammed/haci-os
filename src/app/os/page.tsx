"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  TextEditor,
  TextEditorHeaderTools,
} from "./_components/apps/TextEditor";
import { useEffect, useRef, useState } from "react";

import { AnimationPreview } from "./_components/AnimationPreview";
import { DashToDock } from "./_components/DashToDock";
import { Desktop } from "./_components/Desktop";
import { FileManager } from "./_components/apps/FileManager";
import { GDM } from "./_components/GDM";
import { Nano } from "./_components/apps/Nano";
import { ProductManager } from "./_components/apps/ProductManager";
import { SettingsPanel } from "./_components/apps/SettingsPanel";
import { SystemContextMenu } from "./_components/SystemContextMenu";
import { Terminal } from "./_components/apps/Terminal";
import { Topbar } from "./_components/Topbar";
import { Window } from "./_components/Window";
import { getIconPath } from "@/icons/iconPaths";
import { useSettingsStore } from "@/src/store/settingsStore";
import { useThemeStore } from "@/store/themeStore";
import { useUserStore } from "@/store/userStore";
import { useWindowManagerStore } from "@/store/windowManagerStore";

// Ekran Bölücü Bileşeni
const Splitter = () => {
  const { splitterPosition, updateSplitterPosition, isSplitterVisible } =
    useWindowManagerStore();

  const [isDragging, setIsDragging] = useState(false);
  const splitterRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        return;
      }

      // Fareye göre splitter pozisyonunu hesapla
      const screenWidth = window.innerWidth;
      const position = (e.clientX / screenWidth) * 100;

      // Pozisyonu güncelle
      updateSplitterPosition(position);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, updateSplitterPosition]);

  if (!isSplitterVisible) {
    return null;
  }

  return (
    <div
      ref={splitterRef}
      className={`absolute top-0 bottom-0 w-1 bg-blue-500 cursor-col-resize z-[101] ${
        isDragging ? "opacity-100" : "opacity-50 hover:opacity-100"
      }`}
      style={{
        left: `${splitterPosition}%`,
        height: "calc(100% - 80px)", // Topbar'ı ve DashToDock'u hesaba katarak
        top: "40px", // Topbar'ın yüksekliğini hesaba katarak
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-12 bg-blue-500 rounded-full opacity-80" />
    </div>
  );
};

// Alt+Q Switcher bileşeni
const AltQSwitcher = () => {
  const { windows, isAltQOpen, selectedWindowIndex } = useWindowManagerStore();

  // z-index'e göre sıralanmış görünür pencereler
  const visibleWindows = windows
    .filter((w) => !w.isMinimized)
    .sort((a, b) => b.zIndex - a.zIndex);

  if (!isAltQOpen || visibleWindows.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#2a2e39] rounded-lg p-4 shadow-xl flex space-x-2"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {visibleWindows.map((window, index) => (
          <div
            key={window.id}
            className={`w-32 h-24 rounded-md border-2 overflow-hidden relative transition-all cursor-pointer flex flex-col items-center justify-center p-2 ${
              index === selectedWindowIndex
                ? "border-blue-500 scale-110 shadow-md"
                : "border-gray-700"
            }`}
          >
            <div className="text-center text-xs truncate w-full p-1 rounded">
              {window.title}
            </div>
            <div className="flex-grow flex items-center justify-center text-gray-400 text-xs">
              {getWindowIconByType(window.type)}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// Pencere tipine göre simge döndüren yardımcı fonksiyon
const getWindowIconByType = (type: string) => {
  const {
    tweaks: { iconPack },
  } = useSettingsStore.getState();

  let iconName: string;
  switch (type) {
    case "terminal":
      iconName = "terminal";
      break;
    case "file-manager":
      iconName = "file-manager";
      break;
    case "nano":
    case "text-editor":
      iconName = "text-editor";
      break;
    case "settings":
      iconName = "preferences-system";
      break;
    case "product-manager":
      iconName = "product-manager";
      break;
    default:
      iconName = "text-editor"; // varsayılan bir icon
      break;
  }

  const iconPath = getIconPath(iconPack, iconName);

  return <img src={iconPath} alt={`${type} icon`} className="h-12 w-12" />;
};

function App() {
  const {
    windows,
    openAltQSwitcher,
    closeAltQSwitcher,
    selectNextWindow,
    selectPreviousWindow,
    confirmAltQSelection,
    quickSwitchToLastWindow,
    isAltQOpen,
    activeWindowId,
    snapWindowToLeft,
    snapWindowToRight,
  } = useWindowManagerStore();
  const { currentTheme, setTheme } = useThemeStore();
  const { initializeSystem, currentUser } = useUserStore();

  // Sistem başlatma
  useEffect(() => {
    // Kullanıcı sistemini ve dosya sistemini başlat
    initializeSystem();
  }, [initializeSystem]);

  // Tema başlatma
  useEffect(() => {
    // Kullanıcı tercihini yerel depolamadan kontrolü
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Sistem tercihini kontrol et
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    }
  }, [setTheme]);

  // Alt tuşu basılı mı?
  const isAltKeyPressed = useRef(false);
  // Ne zaman Alt tuşuna basıldığını takip etmek için
  const altKeyPressTime = useRef<number | null>(null);
  // Alt+Q menüsünün açık olduğunu takip etmek için
  const altQSwitcherOpen = useRef(false);

  useEffect(() => {
    altQSwitcherOpen.current = isAltQOpen;
  }, [isAltQOpen]);

  // Klavye olaylarını dinle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt tuşuna basıldığında
      if (e.key === "Alt" || e.key === "AltLeft" || e.key === "AltRight") {
        e.preventDefault(); // Varsayılan davranışı engelle
        isAltKeyPressed.current = true;
        altKeyPressTime.current = Date.now();
      }

      // Alt + Q kombinasyonu
      if (isAltKeyPressed.current && e.key === "q") {
        e.preventDefault(); // Varsayılan davranışı engelle

        // Alt+Q menüsü açık değilse aç
        if (!altQSwitcherOpen.current) {
          openAltQSwitcher();
        } else {
          // Shift tuşuna basılıysa geriye doğru, değilse ileriye doğru git
          if (e.shiftKey) {
            selectPreviousWindow();
          } else {
            selectNextWindow();
          }
        }
      }

      // Alt + Sol Ok kombinasyonu - Pencereyi sol yarıya konumlandır
      if (isAltKeyPressed.current && e.key === "ArrowLeft" && activeWindowId) {
        e.preventDefault();
        snapWindowToLeft(activeWindowId);
      }

      // Alt + Sağ Ok kombinasyonu - Pencereyi sağ yarıya konumlandır
      if (isAltKeyPressed.current && e.key === "ArrowRight" && activeWindowId) {
        e.preventDefault();
        snapWindowToRight(activeWindowId);
      }

      // Alt+Q menüsü açıkken Enter tuşu
      if (altQSwitcherOpen.current && e.key === "Enter") {
        e.preventDefault();
        confirmAltQSelection();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Alt tuşu bırakıldığında
      if (e.key === "Alt" || e.key === "AltLeft" || e.key === "AltRight") {
        // Alt tuşunun ne kadar süre basılı kaldığını hesapla
        const pressDuration = altKeyPressTime.current
          ? Date.now() - altKeyPressTime.current
          : 0;

        isAltKeyPressed.current = false;
        altKeyPressTime.current = null;

        // Alt+Q menüsü açıksa, seçimi onayla
        if (altQSwitcherOpen.current) {
          confirmAltQSelection();
        }
        // Alt tuşuna kısa süre basılıp bırakılmışsa ve Q basılmamışsa son pencereye geç
        else if (pressDuration < 200) {
          quickSwitchToLastWindow();
        }
      }
    };

    // Sayfa görünürlüğü değiştiğinde Alt tuşunu sıfırla
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isAltKeyPressed.current = false;
        altKeyPressTime.current = null;
        if (altQSwitcherOpen.current) {
          closeAltQSwitcher();
        }
      }
    };

    // Pencere kaybedildiğinde Alt tuşunu sıfırla
    const handleBlur = () => {
      isAltKeyPressed.current = false;
      altKeyPressTime.current = null;
      if (altQSwitcherOpen.current) {
        closeAltQSwitcher();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [
    openAltQSwitcher,
    closeAltQSwitcher,
    selectNextWindow,
    selectPreviousWindow,
    confirmAltQSelection,
    quickSwitchToLastWindow,
    activeWindowId,
    snapWindowToLeft,
    snapWindowToRight,
  ]);

  const renderWindowContent = (window: any) => {
    console.log("Pencere içeriği render ediliyor:", window.type, window.id);

    // Diğer tip pencereleri normal şekilde render et
    switch (window.type) {
      case "terminal":
        return <Terminal />;
      case "file-manager":
        return <FileManager mode={window.mode} data={window.data} />;
      case "nano":
        return <Nano fileId={window.fileId} />;
      case "text-editor":
        return <TextEditor initialFileId={window.fileId} />;
      case "settings":
        return <SettingsPanel />;
      case "animation-preview":
        return <AnimationPreview data={window.data} />;
      case "product-manager":
        return <ProductManager productId={window.productId} />;
      default:
        return null;
    }
  };

  const renderHeaderLeft = (window: any) => {
    switch (window.type) {
      case "text-editor":
        return <TextEditorHeaderTools />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`h-screen flex flex-col ${
        currentTheme.name === "dark" ? "dark" : ""
      }`}
    >
      <div className="bg-background text-foreground relative flex-1 overflow-hidden">
        {/* Topbar */}
        <Topbar />
        {/* Desktop */}
        <Desktop />

        {/* Pencereler */}
        <AnimatePresence>
          {windows.map((window) => (
            <Window
              key={window.id}
              id={window.id}
              title={window.title}
              initialPosition={window.position}
              initialSize={window.size}
              headerLeft={renderHeaderLeft(window)}
              content={renderWindowContent(window)}
              children={renderWindowContent(window)}
            />
          ))}
        </AnimatePresence>

        {/* Dock */}
        <DashToDock />

        {/* Alt+Q Switcher */}
        <AnimatePresence>{isAltQOpen && <AltQSwitcher />}</AnimatePresence>

        {/* Ekran Bölücü */}
        <Splitter />

        {/* Sistem Context Menu */}
        <SystemContextMenu />

        {/* GDM Kullanıcı Giriş Ekranı */}
        <AnimatePresence>{!currentUser && <GDM />}</AnimatePresence>
      </div>
    </div>
  );
}

export default App;
