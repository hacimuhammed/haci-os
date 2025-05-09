import { useEffect, useRef, useState } from "react";

import { Button } from "../ui/button";
import { useFileManagerStore } from "../../store/fileManagerStore";
import { useWindowManagerStore } from "../../store/windowManagerStore";

interface NanoProps {
  fileId: string;
}

export const Nano = ({ fileId }: NanoProps) => {
  const { files, updateFile } = useFileManagerStore();
  const { removeWindow } = useWindowManagerStore();
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const windowId = useRef<string | null>(null);

  useEffect(() => {
    const file = files.find((f) => f.id === fileId);
    if (file) {
      setContent(file.content || "");
      setFileName(file.name || "");
      setIsSaved(true);
    }

    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    // Window id'yi alıp saklayalım
    windowId.current = (window as any).__WINDOW_ID__ || null;
  }, [fileId, files]);

  const handleSave = () => {
    updateFile(fileId, { content });
    setIsSaved(true);
    setStatusMessage("Dosya kaydedildi");

    setTimeout(() => {
      setStatusMessage("");
    }, 2000);
  };

  const handleExit = () => {
    if (isSaved) {
      closeWindow();
    } else {
      if (
        window.confirm(
          "Kaydedilmemiş değişiklikler var. Çıkmak istediğinizden emin misiniz?"
        )
      ) {
        closeWindow();
      }
    }
  };

  const closeWindow = () => {
    if (windowId.current) {
      removeWindow(windowId.current);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+S ile kaydet
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      handleSave();
    }

    // Ctrl+G ile çık
    if (e.ctrlKey && e.key === "g") {
      e.preventDefault();
      handleExit();
    }

    // Ctrl+X ile iptal
    if (e.ctrlKey && e.key === "x") {
      e.preventDefault();
      setStatusMessage("İşlem iptal edildi");
      setTimeout(() => {
        setStatusMessage("");
      }, 2000);
    }

    // Tab tuşu için düzgün girinti
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;

      const newContent =
        content.substring(0, start) + "  " + content.substring(end);
      setContent(newContent);

      // İmleci doğru konuma getir
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);

      setIsSaved(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono">
      <div className="bg-card text-card-foreground px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <span className="mr-2">GNU nano</span>
          <span className="text-muted-foreground">{fileName}</span>
          {!isSaved && (
            <span className="ml-2 text-yellow-400">(değiştirildi)</span>
          )}
        </div>
        <span>{statusMessage}</span>
      </div>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-black text-green-400 p-4 resize-none outline-none font-mono min-h-0"
        spellCheck={false}
      />
      <div className="bg-card text-card-foreground px-4 py-2 flex justify-between sticky bottom-0 left-0 right-0">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            className="hover:bg-muted px-2"
            onClick={handleSave}
          >
            ^S Kaydet
          </Button>
          <Button
            variant="ghost"
            className="hover:bg-muted px-2"
            onClick={handleExit}
          >
            ^G Çık
          </Button>
          <Button
            variant="ghost"
            className="hover:bg-muted px-2"
            onClick={() => {
              setStatusMessage("İşlem iptal edildi");
              setTimeout(() => setStatusMessage(""), 2000);
            }}
          >
            ^X İptal
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Satır: {content.split("\n").length} | Karakter: {content.length}
        </div>
      </div>
    </div>
  );
};
