import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";
import { useWindowManagerStore } from "@/store/windowManagerStore";

type WindowProps = {
  id: string;
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  headerLeft?: React.ReactNode;
  content?: React.ReactNode;
};

export const Window = ({
  id,
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 800, height: 600 },
  headerLeft,
  content,
}: WindowProps) => {
  const {
    updateWindow,
    removeWindow,
    activeWindowId,
    setActiveWindow,
    bringToFront,
    endSplitOnDrag,
    windows,
  } = useWindowManagerStore();

  const { tweaks } = useSettingsStore();

  // Seçilen animasyon tipini al
  const selectedAnimation = tweaks.windowAnimation;

  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  // Tam ekran durumu
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Tam ekran öncesi pozisyon ve boyut
  const [previousState, setPreviousState] = useState({
    position: initialPosition,
    size: initialSize,
  });

  // Drag state refs
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStartPos = useRef({ mouseX: 0, mouseY: 0, windowX: 0, windowY: 0 });
  const resizeStartInfo = useRef({
    mouseX: 0,
    mouseY: 0,
    width: 0,
    height: 0,
    cursorType: "",
    initialX: 0,
    initialY: 0,
  });

  // Touch event refs for mobile support
  const touchStartPos = useRef({
    touchX: 0,
    touchY: 0,
    windowX: 0,
    windowY: 0,
  });

  // Animation frame Id for cleanup
  const animationFrameId = useRef<number | null>(null);

  // Şu anki pencerenin zIndex'ini al
  const currentWindow = windows.find((w) => w.id === id);
  const zIndex = currentWindow?.zIndex || 1;

  // Pencere pozisyonunu ekran sınırları içinde tutma
  const clampPositionToScreen = (x: number, y: number) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Ekran sınırlarını aşmamak için pozisyonu sınırla
    const clampedX = Math.max(0, Math.min(x, windowWidth - size.width));
    const clampedY = Math.max(0, Math.min(y, windowHeight - size.height));

    return { x: clampedX, y: clampedY };
  };

  // Pencere aktifleştirme ve öne getirme işlemi
  const handleWindowActivation = (e: React.MouseEvent) => {
    // Pencereye tıklandığında aktifleştir
    setActiveWindow(id);
    bringToFront(id);
  };

  // Component mount/unmount event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current && !isResizing.current) {
        return;
      }

      e.preventDefault(); // Metin seçimini önle

      if (isDragging.current) {
        // İşlenen son animasyon varsa iptal et
        if (animationFrameId.current !== null) {
          cancelAnimationFrame(animationFrameId.current);
        }

        // Yeni bir animasyon frame'i iste
        animationFrameId.current = requestAnimationFrame(() => {
          const deltaX = e.clientX - dragStartPos.current.mouseX;
          const deltaY = e.clientY - dragStartPos.current.mouseY;

          const newX = dragStartPos.current.windowX + deltaX;
          const newY = dragStartPos.current.windowY + deltaY;

          const { x: clampedX, y: clampedY } = clampPositionToScreen(
            newX,
            newY
          );
          setPosition({ x: clampedX, y: clampedY });

          animationFrameId.current = null;
        });
      } else if (isResizing.current) {
        // İşlenen son animasyon varsa iptal et
        if (animationFrameId.current !== null) {
          cancelAnimationFrame(animationFrameId.current);
        }

        // Yeni bir animasyon frame'i iste
        animationFrameId.current = requestAnimationFrame(() => {
          const deltaX = e.clientX - resizeStartInfo.current.mouseX;
          const deltaY = e.clientY - resizeStartInfo.current.mouseY;
          const cursorType = resizeStartInfo.current.cursorType;

          let newWidth = resizeStartInfo.current.width;
          let newHeight = resizeStartInfo.current.height;
          let newX = resizeStartInfo.current.initialX;
          let newY = resizeStartInfo.current.initialY;

          // Resize tipine göre boyutları ve pozisyonu ayarla
          if (cursorType === "se-resize") {
            // Sağ alt köşe (orijinal davranış)
            newWidth = Math.max(400, resizeStartInfo.current.width + deltaX);
            newHeight = Math.max(300, resizeStartInfo.current.height + deltaY);
          } else if (cursorType === "sw-resize") {
            // Sol alt köşe
            newWidth = Math.max(400, resizeStartInfo.current.width - deltaX);
            newHeight = Math.max(300, resizeStartInfo.current.height + deltaY);
            newX =
              resizeStartInfo.current.initialX +
              resizeStartInfo.current.width -
              newWidth;
          } else if (cursorType === "ne-resize") {
            // Sağ üst köşe
            newWidth = Math.max(400, resizeStartInfo.current.width + deltaX);
            newHeight = Math.max(300, resizeStartInfo.current.height - deltaY);
            newY =
              resizeStartInfo.current.initialY +
              resizeStartInfo.current.height -
              newHeight;
          } else if (cursorType === "nw-resize") {
            // Sol üst köşe
            newWidth = Math.max(400, resizeStartInfo.current.width - deltaX);
            newHeight = Math.max(300, resizeStartInfo.current.height - deltaY);
            newX =
              resizeStartInfo.current.initialX +
              resizeStartInfo.current.width -
              newWidth;
            newY =
              resizeStartInfo.current.initialY +
              resizeStartInfo.current.height -
              newHeight;
          }

          // Ekran dışına taşmayı engelle
          const maxWidth = window.innerWidth - newX;
          const maxHeight = window.innerHeight - newY;

          const width = Math.min(newWidth, maxWidth);
          const height = Math.min(newHeight, maxHeight);

          setSize({ width, height });
          setPosition({ x: newX, y: newY });

          animationFrameId.current = null;
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) {
        return;
      }

      e.preventDefault(); // Sayfanın kaydırılmasını önle

      // İşlenen son animasyon varsa iptal et
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }

      // Yeni bir animasyon frame'i iste
      animationFrameId.current = requestAnimationFrame(() => {
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartPos.current.touchX;
        const deltaY = touch.clientY - touchStartPos.current.touchY;

        const newX = touchStartPos.current.windowX + deltaX;
        const newY = touchStartPos.current.windowY + deltaY;

        const { x: clampedX, y: clampedY } = clampPositionToScreen(newX, newY);
        setPosition({ x: clampedX, y: clampedY });

        animationFrameId.current = null;
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging.current && !isResizing.current) {
        return;
      }

      e.preventDefault();

      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = "";

        // Pencere pozisyonunu store'a kaydet
        updateWindow(id, { position });
      } else if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = "";

        // Pencere boyutunu store'a kaydet
        updateWindow(id, { size });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging.current) {
        return;
      }

      isDragging.current = false;

      // Pencere pozisyonunu store'a kaydet
      updateWindow(id, { position });
    };

    const handleResize = () => {
      const { x, y } = clampPositionToScreen(position.x, position.y);
      if (x !== position.x || y !== position.y) {
        setPosition({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);

      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [id, position, size, updateWindow]);

  // Update local state when props change
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  useEffect(() => {
    setSize(initialSize);

    // Pencere boyutları dışarıdan (ilk oluşum veya snap action öncesi)
    // değiştiğinde orijinal boyutu güncelle
    if (!isDragging.current && !isResizing.current) {
      updateWindow(id, { originalSize: initialSize });
    }
  }, [initialSize, id, updateWindow]);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    // Header'a tıklanma kontrolü
    if (!headerRef.current?.contains(e.target as Node)) {
      return;
    }

    // Sağ tıklama veya orta tuş tıklaması ile sürüklemeyi engelle
    if (e.button !== 0) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Aktif pencereyi en üstte göster
    bringToFront(id);

    // Tam ekran modundayken sürüklemeyi engelle
    if (isFullscreen) {
      return;
    }

    // Eğer bölünmüş durumdaysak, sürükleme ile bölünmeyi sonlandır
    endSplitOnDrag(id);

    // Normal sürükleme durumunu kaydet
    isDragging.current = true;
    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      windowX: position.x,
      windowY: position.y,
    };

    // Sürükleme işareti
    document.body.style.cursor = "move";
  };

  // Handle double click on header for fullscreen toggle
  const handleHeaderDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Header'a tıklanma kontrolü
    if (!headerRef.current?.contains(e.target as Node)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Tam ekran modunu değiştir
    toggleFullscreen();
  };

  // Handle touch start for mobile drag
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Header'a dokunma kontrolü
    if (!headerRef.current?.contains(e.target as Node)) {
      return;
    }

    // Aktif pencereyi en üstte göster
    bringToFront(id);

    // Tam ekran modundayken sürüklemeyi engelle
    if (isFullscreen) {
      return;
    }

    // Eğer bölünmüş durumdaysak, sürükleme ile bölünmeyi sonlandır
    endSplitOnDrag(id);

    const touch = e.touches[0];

    // Sürükleme durumunu kaydet
    isDragging.current = true;
    touchStartPos.current = {
      touchX: touch.clientX,
      touchY: touch.clientY,
      windowX: position.x,
      windowY: position.y,
    };
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Aktif pencereyi en üstte göster
    bringToFront(id);

    // Tıklanan köşeye göre resize türünü belirle
    const target = e.currentTarget;
    const cursorType = target.className.includes("resize-se")
      ? "se-resize"
      : target.className.includes("resize-sw")
        ? "sw-resize"
        : target.className.includes("resize-ne")
          ? "ne-resize"
          : "nw-resize";

    // Boyutlandırma durumunu kaydet
    isResizing.current = true;
    resizeStartInfo.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: size.width,
      height: size.height,
      cursorType, // Cursor tipini kaydet
      initialX: position.x, // Pozisyonu da kaydet (sol veya sağ kenarlarda kullanılacak)
      initialY: position.y, // Pozisyonu da kaydet (üst veya alt kenarlarda kullanılacak)
    };

    // Boyutlandırma işareti
    document.body.style.cursor = cursorType;
  };

  // Pencere kapatma işlemi
  const handleClose = () => {
    // Animasyon seçimine göre kapatma animasyonu uygula
    if (windowRef.current) {
      let animation;

      // Seçilen animasyon tipine göre kapanma animasyonu belirle
      switch (selectedAnimation) {
        case "fade":
          animation = windowRef.current.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration: 200, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "scale":
          animation = windowRef.current.animate(
            [
              { opacity: 1, transform: "scale(1)" },
              { opacity: 0, transform: "scale(0.8)" },
            ],
            { duration: 200, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "slide":
          animation = windowRef.current.animate(
            [
              { opacity: 1, transform: "translateY(0)" },
              { opacity: 0, transform: "translateY(20px)" },
            ],
            { duration: 200, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "flip":
          animation = windowRef.current.animate(
            [
              { opacity: 1, transform: "rotateX(0deg)" },
              { opacity: 0, transform: "rotateX(15deg)" },
            ],
            { duration: 300, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "rotate":
          animation = windowRef.current.animate(
            [
              { opacity: 1, transform: "rotate(0deg)" },
              { opacity: 0, transform: "rotate(2deg)" },
            ],
            { duration: 300, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "jellyfish":
          animation = windowRef.current.animate(
            [
              { opacity: 1, transform: "scale(1)" },
              { opacity: 0, transform: "scale(0.8) translateY(10px)" },
            ],
            { duration: 300, easing: "ease-in-out", fill: "forwards" }
          );
          break;
        default:
          // Animasyon yoksa doğrudan kapat
          removeWindow(id);
          return;
      }

      // Animasyon bittiğinde pencereyi kapat
      animation.onfinish = () => {
        removeWindow(id);
      };
    } else {
      removeWindow(id);
    }
  };

  // Pencere açılma animasyonu
  useEffect(() => {
    if (windowRef.current) {
      // Seçilen animasyon tipine göre açılma animasyonu belirle
      let animation;

      switch (selectedAnimation) {
        case "fade":
          animation = windowRef.current.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 200, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "scale":
          animation = windowRef.current.animate(
            [
              { opacity: 0, transform: "scale(0.8)" },
              { opacity: 1, transform: "scale(1)" },
            ],
            { duration: 200, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "slide":
          animation = windowRef.current.animate(
            [
              { opacity: 0, transform: "translateY(20px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 200, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "flip":
          animation = windowRef.current.animate(
            [
              { opacity: 0, transform: "rotateX(15deg)" },
              { opacity: 1, transform: "rotateX(0deg)" },
            ],
            { duration: 300, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "rotate":
          animation = windowRef.current.animate(
            [
              { opacity: 0, transform: "rotate(-2deg)" },
              { opacity: 1, transform: "rotate(0deg)" },
            ],
            { duration: 300, easing: "ease-out", fill: "forwards" }
          );
          break;
        case "jellyfish":
          animation = windowRef.current.animate(
            [
              { opacity: 0, transform: "scale(0.7)" },
              { opacity: 1, transform: "scale(1)" },
            ],
            {
              duration: 400,
              easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", // Spring benzeri easing
              fill: "forwards",
            }
          );
          break;
        default:
          // Animasyon yoksa hiçbir şey yapma
          break;
      }
    }
  }, [id]); // Sadece bileşen mount edildiğinde ve ID değiştiğinde çalışsın

  // Tam ekran modunu değiştir
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Tam ekran moduna geç
      setPreviousState({
        position: { ...position },
        size: { ...size },
      });

      // Topbar yüksekliği (örneğin 40px)
      const topbarHeight = 40;

      // Önce state'i güncelle
      setIsFullscreen(true);

      // Animasyonlu geçiş için Web Animations API kullan
      if (windowRef.current) {
        // Easing fonksiyonu seç
        let easing = "cubic-bezier(0.4, 0, 0.2, 1)"; // Default easing
        let duration = 300; // Default duration

        // Seçilen animasyon tipine göre easing ve duration değerlerini ayarla
        if (selectedAnimation === "jellyfish") {
          easing = "cubic-bezier(0.34, 1.56, 0.64, 1)"; // Spring benzeri easing
          duration = 400;
        }

        const controls = windowRef.current.animate(
          [
            {
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${size.width}px`,
              height: `${size.height}px`,
              borderRadius: "0.5rem",
            },
            {
              left: `${0}px`,
              top: `${topbarHeight}px`,
              width: `${window.innerWidth}px`,
              height: `${window.innerHeight - topbarHeight}px`,
              borderRadius: "0",
            },
          ],
          {
            duration,
            easing,
            fill: "forwards",
          }
        );

        controls.onfinish = () => {
          setPosition({ x: 0, y: topbarHeight });
          setSize({
            width: window.innerWidth,
            height: window.innerHeight - topbarHeight,
          });
        };
      }
    } else {
      // Tam ekran modundan çık
      const prevPosition = { ...previousState.position };
      const prevSize = { ...previousState.size };

      // Animasyonlu geçiş için Web Animations API kullan
      if (windowRef.current) {
        // Easing fonksiyonu seç
        let easing = "cubic-bezier(0.4, 0, 0.2, 1)"; // Default easing
        let duration = 300; // Default duration

        // Seçilen animasyon tipine göre easing ve duration değerlerini ayarla
        if (selectedAnimation === "jellyfish") {
          easing = "cubic-bezier(0.34, 1.56, 0.64, 1)"; // Spring benzeri easing
          duration = 400;
        }

        const controls = windowRef.current.animate(
          [
            {
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${size.width}px`,
              height: `${size.height}px`,
              borderRadius: "0",
            },
            {
              left: `${prevPosition.x}px`,
              top: `${prevPosition.y}px`,
              width: `${prevSize.width}px`,
              height: `${prevSize.height}px`,
              borderRadius: "0.5rem",
            },
          ],
          {
            duration,
            easing,
            fill: "forwards",
          }
        );

        controls.onfinish = () => {
          setPosition(prevPosition);
          setSize(prevSize);
          setIsFullscreen(false);
        };
      }
    }

    // Pencere durumunu güncelle
    updateWindow(id, {
      position: isFullscreen ? previousState.position : { x: 0, y: 40 },
      size: isFullscreen
        ? previousState.size
        : {
            width: window.innerWidth,
            height: window.innerHeight - 40,
          },
    });
  };

  // Window ID'sini global window nesnesine ekle - bunu içerideki uygulamalar kullanacak
  useEffect(() => {
    // Pencere ID'sini global nesnede tut
    (window as any).__WINDOW_ID__ = id;

    return () => {
      // Temizleme, pencere kapatıldığında
      if ((window as any).__WINDOW_ID__ === id) {
        delete (window as any).__WINDOW_ID__;
      }
    };
  }, [id]);

  return (
    <div
      ref={windowRef}
      style={{
        position: "absolute",
        width: size.width,
        height: size.height,
        left: position.x,
        top: position.y,
        transformOrigin: "top center",
        zIndex,
      }}
      className={`${isFullscreen ? "" : "rounded-lg"} overflow-hidden flex flex-col border-none ${
        activeWindowId === id
          ? "shadow-[0_5px_30px_rgba(0,0,0,0.8)]"
          : "shadow-sm"
      } bg-card text-card-foreground`}
      onClick={handleWindowActivation}
      data-window-id={id}
    >
      {/* Header */}
      <div
        ref={headerRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleHeaderDoubleClick}
        className="p-2 flex items-center justify-between cursor-move bg-muted text-card-foreground select-none"
      >
        <div className="flex items-center">{headerLeft}</div>
        <div className="mx-2 flex-1 text-center truncate font-medium">
          {title}
        </div>
        <div className="flex gap-1">
          <Button
            onClick={toggleFullscreen}
            size="icon"
            variant="ghost"
            className="h-6 w-6 rounded-full hover:bg-muted-foreground/20"
          >
            {isFullscreen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8V3m0 0h5M3 3l6 6M21 8V3m0 0h-5m5 0l-6 6M3 16v5m0 0h5m-5 0l6-6m12 6v-5m0 5h-5m5 0l-6-6" />
              </svg>
            )}
          </Button>
          <Button
            onClick={handleClose}
            size="icon"
            variant="ghost"
            className="h-6 w-6 rounded-full hover:bg-destructive hover:text-destructive-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-0 window-content">
        {content || children}
      </div>

      {/* Resizers - Tüm köşeler için resize handle ekle */}
      {!isFullscreen && (
        <>
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10 resize-se"
          />
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-10 resize-sw"
          />
          <div
            onMouseDown={handleResizeStart}
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-10 resize-ne"
          />
          <div
            onMouseDown={handleResizeStart}
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-10 resize-nw"
          />
        </>
      )}
    </div>
  );
};
