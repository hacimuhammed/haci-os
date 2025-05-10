import type { ContextMenuItem } from '@/store/windowManagerStore';

import { cn } from '@/lib/utils';
import { useWindowManagerStore } from '@/store/windowManagerStore';
import React, { useEffect, useRef } from 'react';

export const SystemContextMenu: React.FC = () => {
  const { contextMenu, hideContextMenu, recalculateZIndices }
    = useWindowManagerStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Dışarıya tıklandığında context menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        hideContextMenu();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.visible, hideContextMenu]);

  // ESC tuşuna basıldığında context menüyü kapat
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideContextMenu();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.visible, hideContextMenu]);

  // Context menu görünür olmadığında hiçbir şey render etme
  if (!contextMenu.visible) {
    return null;
  }

  // Menü öğesi tıklandığında
  const handleItemClick = (item: ContextMenuItem) => {
    // Devre dışı ise hiçbir şey yapma
    if (item.disabled) {
      return;
    }

    // Menüyü kapat
    hideContextMenu();

    // İşlemi gerçekleştir
    item.action();

    // ZIndex'leri yeniden hesapla
    recalculateZIndices();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[150px] rounded-md bg-popover border border-border shadow-md overflow-hidden"
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
        zIndex: contextMenu.zIndex,
      }}
    >
      <div className="py-1">
        {contextMenu.items.map((item, index) => (
          <React.Fragment key={item.id || `item-${index}`}>
            {item.separator
              ? (
                  <div className="h-px my-1 bg-border" />
                )
              : (
                  <button
                    className={cn(
                      'w-full text-left px-3 py-1.5 text-sm',
                      'flex items-center gap-2',
                      item.disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-accent hover:text-accent-foreground cursor-default',
                      item.variant === 'destructive' && 'text-destructive',
                    )}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                  >
                    {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                    {item.label}
                  </button>
                )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
