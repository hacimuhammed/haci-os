import { useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";
import { useWindowManagerStore } from "../store/windowManagerStore";

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  headerLeft?: React.ReactNode;
}

export const Window = ({
  id,
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 800, height: 600 },
  headerLeft,
}: WindowProps) => {
  const {
    updateWindow,
    removeWindow,
    activeWindowId,
    setActiveWindow,
    bringToFront,
    endSplitOnDrag,
  } = useWindowManagerStore();

  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);

  // Drag state refs
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStartPos = useRef({ mouseX: 0, mouseY: 0, windowX: 0, windowY: 0 });
  const resizeStartInfo = useRef({ mouseX: 0, mouseY: 0, width: 0, height: 0 });

  // Animation frame Id for cleanup
  const animationFrameId = useRef<number | null>(null);

  // Pencere pozisyonunu ekran sınırları içinde tutma
  const clampPositionToScreen = (x: number, y: number) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Ekran sınırlarını aşmamak için pozisyonu sınırla
    const clampedX = Math.max(0, Math.min(x, windowWidth - size.width));
    const clampedY = Math.max(0, Math.min(y, windowHeight - size.height));

    return { x: clampedX, y: clampedY };
  };

  // Component mount/unmount event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current && !isResizing.current) return;

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

          const newWidth = Math.max(
            400,
            resizeStartInfo.current.width + deltaX
          );
          const newHeight = Math.max(
            300,
            resizeStartInfo.current.height + deltaY
          );

          // Ekran dışına taşmayı engelle
          const maxWidth = window.innerWidth - position.x;
          const maxHeight = window.innerHeight - position.y;

          const width = Math.min(newWidth, maxWidth);
          const height = Math.min(newHeight, maxHeight);

          setSize({ width, height });

          animationFrameId.current = null;
        });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging.current) {
        isDragging.current = false;
        updateWindow(id, { position });
        document.body.style.cursor = "auto";
      }

      if (isResizing.current) {
        isResizing.current = false;
        updateWindow(id, { size });
        document.body.style.cursor = "auto";
      }

      // Animasyon frame'i temizle
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };

    // Global event listeners ekleme
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Pencere boyutu değiştiğinde sınırları kontrol et ve uyum sağla
    const handleResize = () => {
      const { x, y } = clampPositionToScreen(position.x, position.y);
      if (x !== position.x || y !== position.y) {
        setPosition({ x, y });
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
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
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    // Aktif pencereyi en üstte göster
    bringToFront(id);

    // Eğer bölünmüş durumdaysak, sürükleme ile bölünmeyi sonlandır
    endSplitOnDrag(id);

    // Sürükleme durumunu kaydet
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

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Aktif pencereyi en üstte göster
    bringToFront(id);

    // Boyutlandırma durumunu kaydet
    isResizing.current = true;
    resizeStartInfo.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: size.width,
      height: size.height,
    };

    // Boyutlandırma işareti
    document.body.style.cursor = "se-resize";
  };

  // Prevent text selection while dragging
  const preventSelection = (e: React.SyntheticEvent) => {
    if (isDragging.current || isResizing.current) {
      e.preventDefault();
    }
  };

  return (
    <div
      ref={windowRef}
      style={{
        position: "absolute",
        width: size.width,
        height: size.height,
        left: position.x,
        top: position.y,
        zIndex: activeWindowId === id ? 100 : 1,
      }}
      className="rounded-lg bg-gray-950 shadow-xl backdrop-blur-sm overflow-hidden"
      onClick={() => setActiveWindow(id)}
      onMouseDown={() => bringToFront(id)}
    >
      <div
        ref={headerRef}
        className="px-4 py-2 flex justify-between items-center cursor-move backdrop-blur-sm bg-opacity-80 hover:bg-opacity-90"
        onMouseDown={handleDragStart}
        onSelectCapture={preventSelection}
      >
        <div className="flex items-center">
          {headerLeft && <div className="mr-3">{headerLeft}</div>}
          <span>{title}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeWindow(id);
          }}
          className="hover:text-red-500 transition-colors text-xl"
        >
          ×
        </button>
      </div>
      <div className="h-[calc(100%-40px)] overflow-auto">{children}</div>
      <div
        ref={resizerRef}
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize"
        onMouseDown={handleResizeStart}
        style={{
          touchAction: "none",
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          className="absolute right-1 bottom-1 opacity-70"
        >
          <rect x="0" y="8" width="10" height="2" />
          <rect x="8" y="0" width="2" height="10" />
          <rect x="4" y="8" width="2" height="2" />
          <rect x="8" y="4" width="2" height="2" />
        </svg>
      </div>
    </div>
  );
};
