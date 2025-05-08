import { useEffect, useRef, useState } from "react";

import { calculateCenterPosition } from "../utils/window";
import { useFileManagerStore } from "../store/fileManagerStore";
import { useWindowManagerStore } from "../store/windowManagerStore";
import { v4 as uuidv4 } from "uuid";

// Tab yapısı için interface
interface Tab {
  id: string;
  title: string;
  content: string;
  fileId?: string;
  isModified: boolean;
}

interface TextEditorProps {
  initialFileId?: string;
}

// HeaderLeft için bileşen, Window'a aktarılacak
export const TextEditorHeaderTools = () => {
  const { addWindow, windows, updateWindow } = useWindowManagerStore();
  const { files } = useFileManagerStore();

  const createNewTab = () => {
    // Mevcut pencere kimliğini almak için ilgili window bileşenini kullanırız
    const windowId = (window as any).__WINDOW_ID__;

    // Pencere kimliğiyle mevcut pencereyi bulalım
    if (windowId) {
      // Mesaj gönder
      window.dispatchEvent(
        new CustomEvent("new-tab-request", {
          detail: { windowId },
        })
      );
    } else {
      // Yeni bir metin düzenleyici penceresi açıyoruz
      const size = { width: 900, height: 700 };
      const position = calculateCenterPosition(size.width, size.height);

      addWindow({
        id: uuidv4(),
        title: "Metin Düzenleyici",
        type: "text-editor",
        position,
        size,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
      });
    }
  };

  const openFileManagerToOpen = () => {
    // FileManager penceresini aç
    const size = { width: 600, height: 500 };
    const position = calculateCenterPosition(size.width, size.height);

    // Pencereyi biraz yukarıda oluşturmak için y pozisyonunu ayarla
    position.y = Math.max(50, position.y - 150);

    addWindow({
      id: uuidv4(),
      title: "Dosya Aç",
      type: "file-manager",
      position,
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: 100,
      mode: "open",
      data: {
        onOpen: (fileId: string) => {
          const file = files.find((f) => f.id === fileId);
          if (file) {
            const editorSize = { width: 900, height: 700 };
            const editorPosition = calculateCenterPosition(
              editorSize.width,
              editorSize.height
            );

            addWindow({
              id: uuidv4(),
              title: file.name,
              type: "text-editor",
              position: editorPosition,
              size: editorSize,
              isMinimized: false,
              isMaximized: false,
              zIndex: 1,
              fileId: file.id,
            });
          }
        },
      },
    });
  };

  return (
    <div className="flex items-center">
      <button
        className="p-1 rounded hover:bg-gray-700 mr-2"
        onClick={createNewTab}
        title="Yeni Tab"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <button
        className="p-1 rounded hover:bg-gray-700"
        onClick={openFileManagerToOpen}
        title="Dosya Aç"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 0v3h3V4H4z"
          />
          <path d="M10 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zm1 0v3h3V4h-3z" />
          <path d="M3 10a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm1 0v3h3v-3H4z" />
          <path
            fillRule="evenodd"
            d="M10 10a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3zm1 0v3h3v-3h-3z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export const TextEditor = ({ initialFileId }: TextEditorProps) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tabToClose, setTabToClose] = useState<string | null>(null);
  const { files, addFile, updateFile } = useFileManagerStore();
  const { addWindow } = useWindowManagerStore();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Eğer bir fileId ile açıldıysa, dosyayı yükle
  useEffect(() => {
    if (initialFileId) {
      loadFileToNewTab(initialFileId);
    } else {
      // İlk başlangıçta boş bir tab oluştur
      createNewTab();
    }
  }, [initialFileId]);

  // Yeni sekme olayını dinle
  useEffect(() => {
    const handleNewTabRequest = (event: Event) => {
      const customEvent = event as CustomEvent;
      const windowId = (window as any).__WINDOW_ID__;

      if (customEvent.detail.windowId === windowId) {
        createNewTab();
      }
    };

    window.addEventListener("new-tab-request", handleNewTabRequest);

    return () => {
      window.removeEventListener("new-tab-request", handleNewTabRequest);
    };
  }, []);

  // Yeni tab oluştur
  const createNewTab = () => {
    const newTab: Tab = {
      id: uuidv4(),
      title: "Yeni Dosya",
      content: "",
      isModified: false,
    };

    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);

    // Tab oluşturulduktan sonra editöre odaklan
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }, 0);
  };

  // Dosyayı yeni bir tab'de aç
  const loadFileToNewTab = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    const newTab: Tab = {
      id: uuidv4(),
      title: file.name,
      content: file.content || "",
      fileId: file.id,
      isModified: false,
    };

    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);
  };

  // Aktif tab içeriğini güncelle
  const updateTabContent = (content: string) => {
    if (!activeTabId) return;

    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              content,
              isModified: tab.fileId ? true : tab.content !== content,
            }
          : tab
      )
    );
  };

  // Tab kapat
  const closeTab = (tabId: string) => {
    const tabToClose = tabs.find((t) => t.id === tabId);
    if (!tabToClose) return;

    // Değişiklik varsa, kaydetme soralım
    if (tabToClose.isModified) {
      setTabToClose(tabId);
      setShowSaveModal(true);
      return;
    }

    // Değişiklik yoksa direk kapatalım
    performCloseTab(tabId);
  };

  // Tab'ı kapat (değişiklik kontrolü olmadan)
  const performCloseTab = (tabId: string) => {
    // Eğer aktif tab kapatılıyorsa, yeni bir aktif tab seç
    if (activeTabId === tabId) {
      const currentIndex = tabs.findIndex((t) => t.id === tabId);
      if (tabs.length > 1) {
        // Eğer kapatılan son tab değilse, sağdaki tab'a geç
        // Son tab ise soldaki tab'a geç
        const newIndex =
          currentIndex === tabs.length - 1
            ? currentIndex - 1
            : currentIndex + 1;

        setActiveTabId(tabs[newIndex].id);
      } else {
        setActiveTabId(null);
      }
    }

    // Tab'ı kaldır
    setTabs((prevTabs) => prevTabs.filter((t) => t.id !== tabId));
  };

  // Dosya kaydet
  const saveFile = async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    // Dosya ID'si varsa, mevcut dosyayı güncelle
    if (tab.fileId) {
      updateFile(tab.fileId, { content: tab.content });

      // Tab'ı güncelle, değişikliği kaldır
      setTabs((prevTabs) =>
        prevTabs.map((t) => (t.id === tabId ? { ...t, isModified: false } : t))
      );

      return true;
    } else {
      // Yeni dosya oluştur
      openFileManagerToSave(tabId);
      return false;
    }
  };

  // Kaydetme işlemi için FileManager'ı aç
  const openFileManagerToSave = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    // FileManager penceresini aç
    const size = { width: 600, height: 500 };
    const position = calculateCenterPosition(size.width, size.height);

    addWindow({
      id: uuidv4(),
      title: "Dosya Kaydet",
      type: "file-manager",
      position,
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: 100,
      mode: "save",
      data: {
        content: tab.content,
        fileName: tab.title,
        onSave: (fileId: string, fileName: string) => {
          // Tab'ı güncelle
          setTabs((prevTabs) =>
            prevTabs.map((t) =>
              t.id === tabId
                ? { ...t, title: fileName, fileId, isModified: false }
                : t
            )
          );
        },
      },
    });
  };

  // Aktif tab
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  // Tab header bileşeni
  const TabHeader = () => (
    <div className="flex text-sm bg-gray-800">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`px-4 py-2 flex items-center cursor-pointer border-r border-gray-700 ${
            tab.id === activeTabId ? "bg-gray-700" : "hover:bg-gray-700"
          }`}
          onClick={() => setActiveTabId(tab.id)}
        >
          <span className="max-w-[120px] truncate">
            {tab.title} {tab.isModified && "•"}
          </span>
          <button
            className="ml-2 text-gray-400 hover:text-white text-xs"
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        className="px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700"
        onClick={createNewTab}
      >
        +
      </button>
    </div>
  );

  // Toolbar bileşeni
  const Toolbar = () => (
    <div className="bg-gray-800 border-t border-b border-gray-700 py-1 px-4 flex items-center space-x-2">
      <button
        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
        onClick={() => activeTabId && saveFile(activeTabId)}
        disabled={!activeTabId}
      >
        Kaydet
      </button>
      <button
        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
        onClick={() => {
          // FileManager penceresini aç
          const size = { width: 600, height: 500 };
          const position = calculateCenterPosition(size.width, size.height);

          // Pencereyi biraz yukarıda oluşturmak için y pozisyonunu ayarla
          position.y = Math.max(50, position.y - 150);

          addWindow({
            id: uuidv4(),
            title: "Dosya Aç",
            type: "file-manager",
            position,
            size,
            isMinimized: false,
            isMaximized: false,
            zIndex: 100,
            mode: "open",
            data: {
              onOpen: (fileId: string) => {
                const file = files.find((f) => f.id === fileId);
                if (file) {
                  loadFileToNewTab(file.id);
                }
              },
            },
          });
        }}
      >
        Aç
      </button>
    </div>
  );

  // Kaydetme modalı
  const SaveModal = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          Kaydedilmemiş değişiklikler
        </h3>
        <p className="mb-4">Değişiklikleri kaydetmek ister misiniz?</p>
        <div className="flex justify-end space-x-2">
          <button
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
            onClick={() => {
              setShowSaveModal(false);
              if (tabToClose) performCloseTab(tabToClose);
              setTabToClose(null);
            }}
          >
            Kaydetme
          </button>
          <button
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
            onClick={async () => {
              setShowSaveModal(false);
              if (tabToClose) {
                const saved = await saveFile(tabToClose);
                if (saved) performCloseTab(tabToClose);
              }
              setTabToClose(null);
            }}
          >
            Kaydet
          </button>
          <button
            className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-white"
            onClick={() => {
              setShowSaveModal(false);
              setTabToClose(null);
            }}
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );

  // Kısayollar
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+S ile kaydet
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      if (activeTabId) saveFile(activeTabId);
    }

    // Tab tuşu için düzgün girinti
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;

      const value = e.currentTarget.value;
      const newValue = value.substring(0, start) + "  " + value.substring(end);

      updateTabContent(newValue);

      // İmleci doğru konuma getir
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd =
            start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white font-mono overflow-hidden">
      <TabHeader />
      <Toolbar />

      {activeTab ? (
        <textarea
          ref={editorRef}
          className="flex-1 w-full bg-gray-900 text-gray-200 p-4 resize-none outline-none font-mono min-h-0"
          value={activeTab.content}
          onChange={(e) => updateTabContent(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Tab oluşturmak için + düğmesine tıklayın</p>
        </div>
      )}

      {showSaveModal && <SaveModal />}
    </div>
  );
};
