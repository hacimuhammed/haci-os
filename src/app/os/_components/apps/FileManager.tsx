'use client';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { useFileManagerStore } from '@/store/fileManagerStore';
import { useUserStore } from '@/store/userStore';
import { useWindowManagerStore } from '@/store/windowManagerStore';
import { calculateCascadingPosition } from '@/utils/window';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type FileManagerProps = {
  mode?: 'open' | 'save'; // Dosya açma veya kaydetme modu
  data?: {
    content?: string;
    fileName?: string;
    onSave?: (fileId: string, fileName: string) => void;
    onOpen?: (fileId: string) => void;
  };
};

export const FileManager = ({ mode, data }: FileManagerProps) => {
  const { files, addFile, renameFile } = useFileManagerStore();
  const { addWindow, showContextMenu } = useWindowManagerStore();
  const { currentUser } = useUserStore();
  // Her FileManager penceresi için bağımsız bir yol durumu tut
  const [localCurrentPath, setLocalCurrentPath] = useState('/');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [saveFileName, setSaveFileName] = useState(
    data?.fileName || 'Yeni Dosya.txt',
  );
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

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
    const file = files.find(f => f.id === fileId);
    if (!file) {
      return;
    }

    if (file.type === 'folder') {
      // Klasöre git - local path kullan
      setLocalCurrentPath(
        `${localCurrentPath}/${file.name}`.replace(/\/+/g, '/'),
      );
    } else if (mode === 'open' && data?.onOpen) {
      // Dosya seçme modunda, dosyayı aç
      data.onOpen(file.id);
    }
  };

  const goToParentFolder = () => {
    if (localCurrentPath === '/') {
      return;
    }
    // Üst klasöre git - local path kullan
    const parentPath
      = localCurrentPath.split('/').slice(0, -1).join('/') || '/';
    setLocalCurrentPath(parentPath);
  };

  const createNewFolder = () => {
    if (!newFolderName.trim()) {
      return;
    }

    // Yeni klasör oluştur - local path kullan
    addFile({
      id: uuidv4(),
      name: newFolderName,
      type: 'folder',
      path: localCurrentPath,
    });

    setNewFolderName('');
    setShowNewFolderDialog(false);
  };

  const saveFile = () => {
    if (!saveFileName.trim() || !mode || mode !== 'save' || !data?.content) {
      return;
    }

    // Yeni dosya oluştur - local path kullan
    const newFileId = uuidv4();

    addFile({
      id: newFileId,
      name: saveFileName,
      type: 'file',
      path: localCurrentPath,
      content: data.content,
    });

    // Kaydedildi callback'ini çağır
    if (data.onSave) {
      data.onSave(newFileId, saveFileName);
    }
  };

  const startRenaming = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) {
      return;
    }

    setIsRenaming(fileId);
    setNewName(file.name);
  };

  const finishRenaming = () => {
    if (!isRenaming || !newName.trim()) {
      setIsRenaming(null);
      return;
    }

    // Dosyayı güncelle - renameFile fonksiyonuyla
    renameFile(isRenaming, newName);
    setIsRenaming(null);
  };

  // Dosyayı metin editöründe aç
  const openFileInTextEditor = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file || file.type === 'folder') {
      return;
    }

    const size = { width: 900, height: 700 };
    const position = calculateCascadingPosition(size.width, size.height);

    addWindow({
      id: uuidv4(),
      title: file.name,
      type: 'text-editor',
      position,
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
      fileId: file.id,
    });
  };

  // Klasöre git
  const navigateToFolder = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file || file.type !== 'folder') {
      return;
    }

    // Local path kullan
    setLocalCurrentPath(
      `${localCurrentPath}/${file.name}`.replace(/\/+/g, '/'),
    );
  };

  // Sağ tık context menüsünü göster
  const handleContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();

    const file = files.find(f => f.id === fileId);
    if (!file) {
      return;
    }

    // Dosyayı seç
    setSelectedFileId(fileId);

    const menuItems = [];

    // Klasör context menüsü
    if (file.type === 'folder') {
      menuItems.push(
        {
          id: 'navigate',
          label: 'Klasöre git',
          action: () => navigateToFolder(fileId),
        },
        {
          id: 'rename',
          label: 'Yeniden adlandır',
          action: () => startRenaming(fileId),
        },
      );
    }
    // Dosya context menüsü
    else {
      menuItems.push(
        {
          id: 'open',
          label: 'Metin editörü ile aç',
          action: () => openFileInTextEditor(fileId),
        },
        {
          id: 'rename',
          label: 'Yeniden adlandır',
          action: () => startRenaming(fileId),
        },
      );
    }

    // Context menüyü göster
    showContextMenu(
      e.clientX,
      e.clientY,
      menuItems,
      (window as any).__WINDOW_ID__,
    );
  };

  // Mevcut klasördeki dosya ve klasörleri göster - local path kullan ve /home özel durumunu kontrol et
  const currentItems = files.filter((file) => {
    // Eğer /home dizinindeyse, sadece mevcut kullanıcının klasörünü göster
    if (localCurrentPath === '/home') {
      if (!currentUser) {
        return false;
      }
      return file.path === '/home' && file.name === currentUser.username;
    }

    // Diğer tüm dizinler için normal filtreleme yap
    return file.path === localCurrentPath;
  });

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
          Parent Folder
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowNewFolderDialog(true)}
        >
          New Folder
        </Button>
        <div className="ml-auto">{localCurrentPath}</div>
      </div>

      {/* Ana içerik */}
      <div className="flex-1 p-2 overflow-auto">
        {currentItems.length === 0
          ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                This folder is empty
              </div>
            )
          : (
              <div className="grid grid-cols-4 gap-2">
                {currentItems.map(file => (
                  <div
                    key={file.id}
                    className={`p-2 rounded cursor-pointer flex flex-col items-center ${
                      selectedFileId === file.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleFileClick(file.id)}
                    onDoubleClick={() => handleFileDoubleClick(file.id)}
                    onContextMenu={e => handleContextMenu(e, file.id)}
                  >
                    {isRenaming === file.id
                      ? (
                          <input
                            type="text"
                            className="w-full bg-input border border-input px-2 py-1 mt-2 rounded"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onBlur={finishRenaming}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                finishRenaming();
                              }
                              if (e.key === 'Escape') {
                                setIsRenaming(null);
                              }
                            }}
                            autoFocus
                          />
                        )
                      : (
                          <>
                            <div className="w-12 h-12 flex items-center justify-center text-2xl mb-1">
                              {file.type === 'folder' ? '📁' : '📄'}
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
          <div className="flex gap-2">
            <Input
              type="text"
              className="flex-1 bg-input border border-input px-2 py-1 rounded-l"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  createNewFolder();
                }
                if (e.key === 'Escape') {
                  setShowNewFolderDialog(false);
                }
              }}
            />
            <Button
              variant="secondary"
              className="px-3 py-1 rounded-none rounded-r"
              onClick={createNewFolder}
            >
              Create
            </Button>
            <Button
              variant="secondary"
              className="px-3 py-1 ml-2"
              onClick={() => setShowNewFolderDialog(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Kaydetme paneli */}
      {mode === 'save' && (
        <div className="p-3 bg-card border-t border-border">
          <div className="text-sm mb-2">File name:</div>
          <div className="flex">
            <input
              type="text"
              className="flex-1 bg-input border border-input px-2 py-1 rounded-l"
              value={saveFileName}
              onChange={e => setSaveFileName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveFile();
                }
              }}
            />
            <Button
              variant="default"
              className="px-3 py-1 rounded-none rounded-r"
              onClick={saveFile}
            >
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Seçim onay paneli */}
      {mode === 'open' && selectedFileId && (
        <div className="p-3 bg-card border-t border-border flex justify-end">
          <Button
            variant="default"
            onClick={() => {
              const file = files.find(f => f.id === selectedFileId);
              if (file && file.type === 'file' && data?.onOpen) {
                data.onOpen(file.id);
              }
            }}
          >
            Open
          </Button>
        </div>
      )}
    </div>
  );
};
