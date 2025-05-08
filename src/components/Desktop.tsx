import { calculateCenterPosition } from "../utils/window";
import { useFileManagerStore } from "../store/fileManagerStore";
import { useSettingsStore } from "../store/settingsStore";
import { useState } from "react";
import { useThemeStore } from "../store/themeStore";
import { useWindowManagerStore } from "../store/windowManagerStore";
import { v4 as uuidv4 } from "uuid";

export const Desktop = () => {
  const { files, addFile } = useFileManagerStore();
  const { addWindow } = useWindowManagerStore();
  const { currentTheme } = useThemeStore();
  const { appearance } = useSettingsStore();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [editingFile, setEditingFile] = useState<string | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleNewFolder = () => {
    const newFolder = {
      id: uuidv4(),
      name: "New Folder",
      type: "folder" as const,
      path: "/home",
    };
    addFile(newFolder);
    setContextMenu(null);
  };

  const handleFileDoubleClick = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    if (file.type === "folder") {
      const size = { width: 800, height: 600 };
      const position = calculateCenterPosition(size.width, size.height);

      addWindow({
        id: uuidv4(),
        title: file.name,
        type: "file-manager",
        position,
        size,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
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
        {files.map((file) => (
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
                className="mt-2 text-white bg-transparent border-b border-gray-600 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <span
                className="mt-2 text-white text-sm"
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
          className="fixed rounded-lg shadow-lg bg-zinc-900 p-1.5"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={handleNewFolder}
          >
            New Folder
          </button>
        </div>
      )}
    </div>
  );
};
