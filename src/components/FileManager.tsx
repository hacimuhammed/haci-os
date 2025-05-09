import { useEffect, useState } from "react";

import { Button } from "./ui/button";
import { useFileManagerStore } from "../store/fileManagerStore";
import { v4 as uuidv4 } from "uuid";

interface FileManagerProps {
  mode?: "open" | "save"; // Dosya açma veya kaydetme modu
  data?: {
    content?: string;
    fileName?: string;
    onSave?: (fileId: string, fileName: string) => void;
    onOpen?: (fileId: string) => void;
  };
}

export const FileManager = ({ mode, data }: FileManagerProps) => {
  const { files, addFile, currentPath, setCurrentPath } = useFileManagerStore();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [saveFileName, setSaveFileName] = useState(
    data?.fileName || "Yeni Dosya.txt"
  );
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    // Props değişince dosya adını güncelle
    if (data?.fileName) {
      setSaveFileName(data.fileName);
    }
  }, [data]);

  const handleFileClick = (fileId: string) => {
    setSelectedFileId(fileId);
  };

  const handleFileDoubleClick = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    if (file.type === "folder") {
      // Klasöre git
      setCurrentPath(`${currentPath}/${file.name}`.replace(/\/+/g, "/"));
    } else if (mode === "open" && data?.onOpen) {
      // Dosya seçme modunda, dosyayı aç
      data.onOpen(file.id);
    }
  };

  const goToParentFolder = () => {
    if (currentPath === "/") return;
    const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
    setCurrentPath(parentPath);
  };

  const createNewFolder = () => {
    if (!newFolderName.trim()) return;

    addFile({
      id: uuidv4(),
      name: newFolderName,
      type: "folder",
      path: currentPath,
    });

    setNewFolderName("");
    setShowNewFolderDialog(false);
  };

  const saveFile = () => {
    if (!saveFileName.trim() || !mode || mode !== "save" || !data?.content)
      return;

    // Yeni dosya oluştur
    const newFileId = uuidv4();

    addFile({
      id: newFileId,
      name: saveFileName,
      type: "file",
      path: currentPath,
      content: data.content,
    });

    // Kaydedildi callback'ini çağır
    if (data.onSave) {
      data.onSave(newFileId, saveFileName);
    }
  };

  const startRenaming = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    setIsRenaming(fileId);
    setNewName(file.name);
  };

  const finishRenaming = () => {
    if (!isRenaming || !newName.trim()) {
      setIsRenaming(null);
      return;
    }

    // Dosyayı güncelle
    const fileIndex = files.findIndex((f) => f.id === isRenaming);
    if (fileIndex !== -1) {
      files[fileIndex].name = newName;
    }

    setIsRenaming(null);
  };

  // Mevcut klasördeki dosya ve klasörleri göster
  const currentItems = files.filter((file) => file.path === currentPath);

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {/* Toolbar */}
      <div className="p-2 flex items-center border-b border-border">
        <Button
          variant="secondary"
          size="sm"
          className="mr-2"
          onClick={goToParentFolder}
        >
          Üst Klasör
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowNewFolderDialog(true)}
        >
          Yeni Klasör
        </Button>
        <div className="ml-auto">{currentPath}</div>
      </div>

      {/* Ana içerik */}
      <div className="flex-1 p-2 overflow-auto">
        {currentItems.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Bu klasör boş
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {currentItems.map((file) => (
              <div
                key={file.id}
                className={`p-2 rounded cursor-pointer flex flex-col items-center ${
                  selectedFileId === file.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => handleFileClick(file.id)}
                onDoubleClick={() => handleFileDoubleClick(file.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  startRenaming(file.id);
                }}
              >
                {isRenaming === file.id ? (
                  <input
                    type="text"
                    className="w-full bg-input border border-input px-2 py-1 mt-2 rounded"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={finishRenaming}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") finishRenaming();
                      if (e.key === "Escape") setIsRenaming(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    <div className="w-12 h-12 flex items-center justify-center text-2xl mb-1">
                      {file.type === "folder" ? "📁" : "📄"}
                    </div>
                    <span className="text-sm truncate w-full text-center">
                      {file.name}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Klasör oluşturma diyaloğu */}
      {showNewFolderDialog && (
        <div className="p-3 bg-card border-t border-border">
          <div className="text-sm mb-2">Yeni klasör adı:</div>
          <div className="flex">
            <input
              type="text"
              className="flex-1 bg-input border border-input px-2 py-1 rounded-l"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") createNewFolder();
                if (e.key === "Escape") setShowNewFolderDialog(false);
              }}
            />
            <Button
              variant="default"
              className="px-3 py-1 rounded-none rounded-r"
              onClick={createNewFolder}
            >
              Oluştur
            </Button>
            <Button
              variant="secondary"
              className="px-3 py-1 ml-2"
              onClick={() => setShowNewFolderDialog(false)}
            >
              İptal
            </Button>
          </div>
        </div>
      )}

      {/* Kaydetme paneli */}
      {mode === "save" && (
        <div className="p-3 bg-card border-t border-border">
          <div className="text-sm mb-2">Dosya adı:</div>
          <div className="flex">
            <input
              type="text"
              className="flex-1 bg-input border border-input px-2 py-1 rounded-l"
              value={saveFileName}
              onChange={(e) => setSaveFileName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") saveFile();
              }}
            />
            <Button
              variant="default"
              className="px-3 py-1 rounded-none rounded-r"
              onClick={saveFile}
            >
              Kaydet
            </Button>
          </div>
        </div>
      )}

      {/* Seçim onay paneli */}
      {mode === "open" && selectedFileId && (
        <div className="p-3 bg-card border-t border-border flex justify-end">
          <Button
            variant="default"
            onClick={() => {
              const file = files.find((f) => f.id === selectedFileId);
              if (file && file.type === "file" && data?.onOpen) {
                data.onOpen(file.id);
              }
            }}
          >
            Aç
          </Button>
        </div>
      )}
    </div>
  );
};
