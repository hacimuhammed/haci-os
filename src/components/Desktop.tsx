import {
  calculateCascadingPosition,
  calculateCenterPosition,
} from "../utils/window";

import { Button } from "./ui/button";
import { useFileManagerStore } from "../store/fileManagerStore";
import { useSettingsStore } from "../store/settingsStore";
import { useState } from "react";
import { useUserStore } from "../store/userStore";
import { useWindowManagerStore } from "../store/windowManagerStore";
import { v4 as uuidv4 } from "uuid";

export const Desktop = () => {
  const { files, addFile } = useFileManagerStore();
  const { addWindow } = useWindowManagerStore();
  const { appearance } = useSettingsStore();
  const { currentUser } = useUserStore();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [editingFile, setEditingFile] = useState<string | null>(null);

  // Eğer giriş yapmış kullanıcı yoksa, masaüstünde dosya gösterme
  if (!currentUser) {
    return (
      <div
        className="w-full h-screen relative"
        style={{
          backgroundImage: `url(${appearance.wallpaperPath})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }

  // Sadece kullanıcının Desktop klasöründeki dosyaları göster
  // Alt klasörlere inme, yalnızca ilk seviye dosyaları göster
  const desktopPath = `/home/${currentUser.username}/Desktop`;
  const desktopFiles = files.filter(
    (file) => file.path === desktopPath && file.owner === currentUser.username
  );

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleNewFolder = () => {
    const newFolder = {
      id: uuidv4(),
      name: "New Folder",
      type: "folder" as const,
      path: desktopPath,
      owner: currentUser.username,
      permissions: {
        read: [currentUser.username, "admin"],
        write: [currentUser.username, "admin"],
        execute: [currentUser.username, "admin"],
      },
    };
    addFile(newFolder);
    setContextMenu(null);
  };

  const handleFileDoubleClick = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    if (file.type === "folder") {
      const size = { width: 800, height: 600 };
      const position = calculateCascadingPosition(size.width, size.height);

      addWindow({
        id: uuidv4(),
        title: file.name,
        type: "file-manager",
        position,
        size,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        data: { path: `${file.path}/${file.name}` },
      });
    } else if (file.type === "file") {
      // Dosya türüne göre uygun uygulama aç
      const size = { width: 800, height: 600 };
      const position = calculateCascadingPosition(size.width, size.height);

      addWindow({
        id: uuidv4(),
        title: `Text Editor: ${file.name}`,
        type: "text-editor",
        position,
        size,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        fileId: file.id,
      });
    }
  };

  const handleNameEdit = (fileId: string, newName: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    file.name = newName;
    setEditingFile(null);
  };

  return (
    <div
      className="w-full h-screen relative"
      onContextMenu={handleContextMenu}
      onClick={() => setContextMenu(null)}
      style={{
        backgroundImage: `url(${appearance.wallpaperPath})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="grid grid-cols-6 gap-4 p-4">
        {desktopFiles.map((file) => (
          <div
            key={file.id}
            className="flex flex-col items-center p-2 cursor-pointer"
            onDoubleClick={() => handleFileDoubleClick(file.id)}
          >
            <div className="w-16 h-16 text-5xl rounded-lg flex items-center justify-center">
              {file.type === "folder" ? "📁" : "📄"}
            </div>
            {editingFile === file.id ? (
              <input
                type="text"
                defaultValue={file.name}
                onBlur={(e) => handleNameEdit(file.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNameEdit(file.id, e.currentTarget.value);
                  }
                }}
                autoFocus
                className="mt-2 text-foreground bg-transparent border-b border-input focus:outline-none focus:border-ring"
              />
            ) : (
              <span
                className="mt-2 text-foreground text-sm"
                onDoubleClick={() => setEditingFile(file.id)}
              >
                {file.name}
              </span>
            )}
          </div>
        ))}
      </div>

      {contextMenu && (
        <div
          className="fixed rounded-lg shadow-lg bg-popover p-1.5"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <Button
            variant="ghost"
            className="w-full px-4 py-2 text-left justify-start hover:bg-muted text-popover-foreground"
            onClick={handleNewFolder}
          >
            New Folder
          </Button>
        </div>
      )}
    </div>
  );
};
