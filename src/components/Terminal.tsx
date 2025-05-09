import {
  calculateCascadingPosition,
  calculateCenterPosition,
} from "../utils/window";
import { useEffect, useRef, useState } from "react";

import { useFileManagerStore } from "../store/fileManagerStore";
import { useWindowManagerStore } from "../store/windowManagerStore";
import { v4 as uuidv4 } from "uuid";

interface Command {
  command: string;
  output: string;
}

interface FileContent {
  [key: string]: string;
}

export const Terminal = () => {
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [fileContents, setFileContents] = useState<FileContent>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  const { files, currentPath, setCurrentPath, addFile } = useFileManagerStore();
  const { addWindow } = useWindowManagerStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Öneri listesi değiştiğinde seçili elemanı sıfırla
  useEffect(() => {
    setSelectedSuggestionIndex(0);
  }, [suggestions]);

  const getAvailableCommands = () => {
    return [
      "ls",
      "cd",
      "pwd",
      "touch",
      "mkdir",
      "clear",
      "cat",
      "nano",
      "help",
    ];
  };

  const getFilesAndDirsInCurrentPath = () => {
    return files
      .filter((file) => file.path === currentPath)
      .map((file) => file.name);
  };

  const findSuggestions = (partialCommand: string) => {
    const parts = partialCommand.trim().split(" ");
    const lastWord = parts[parts.length - 1];

    if (parts.length === 1) {
      // Komut tamamlama
      const commandSuggestions = getAvailableCommands().filter((cmd) =>
        cmd.startsWith(lastWord)
      );
      return commandSuggestions;
    } else {
      // Dosya/dizin tamamlama
      const filesDirs = getFilesAndDirsInCurrentPath();
      return filesDirs.filter((item) => item.startsWith(lastWord));
    }
  };

  const applyTab = () => {
    const parts = currentCommand.trim().split(" ");
    const lastWord = parts[parts.length - 1];

    const newSuggestions = findSuggestions(currentCommand);

    if (newSuggestions.length === 1) {
      // Tek öneri varsa doğrudan tamamla
      if (parts.length === 1) {
        setCurrentCommand(newSuggestions[0]);
      } else {
        parts[parts.length - 1] = newSuggestions[0];
        setCurrentCommand(parts.join(" "));
      }
      setShowSuggestions(false);
    } else if (newSuggestions.length > 1) {
      // Birden fazla öneri varsa göster
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    }
  };

  const navigateSuggestions = () => {
    if (suggestions.length === 0 || !showSuggestions) return;

    // Bir sonraki öneriye git
    const nextIndex = (selectedSuggestionIndex + 1) % suggestions.length;
    setSelectedSuggestionIndex(nextIndex);
  };

  const selectCurrentSuggestion = () => {
    if (suggestions.length === 0 || !showSuggestions) return;

    const parts = currentCommand.trim().split(" ");
    const suggestion = suggestions[selectedSuggestionIndex];

    if (parts.length === 1) {
      setCurrentCommand(suggestion);
    } else {
      parts[parts.length - 1] = suggestion;
      setCurrentCommand(parts.join(" "));
    }

    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const executeCommand = (command: string) => {
    const [cmd, ...args] = command.trim().split(" ");

    // Komut geçmişine ekle
    setCommandHistory([command, ...commandHistory]);
    setHistoryIndex(-1);

    let output = "";

    switch (cmd) {
      case "ls":
        output = files
          .filter((file) => file.path === currentPath)
          .map(
            (file) =>
              `${file.type === "folder" ? "d" : "-"}rwxr-xr-x ${file.name}`
          )
          .join("\n");
        break;

      case "cd":
        if (args[0]) {
          const targetPath = args[0];
          if (targetPath === "..") {
            const parentPath =
              currentPath.split("/").slice(0, -1).join("/") || "/";
            setCurrentPath(parentPath);
            output = `Changed directory to ${parentPath}`;
          } else {
            const targetFolder = files.find(
              (f) =>
                f.path === currentPath &&
                f.name === targetPath &&
                f.type === "folder"
            );

            if (targetFolder) {
              const newPath = `${currentPath}/${targetPath}`.replace(
                /\/+/g,
                "/"
              );
              setCurrentPath(newPath);
              output = `Changed directory to ${newPath}`;
            } else {
              output = `cd: ${targetPath}: No such directory`;
            }
          }
        }
        break;

      case "pwd":
        output = currentPath;
        break;

      case "touch":
        if (args[0]) {
          const fileExists = files.some(
            (f) =>
              f.path === currentPath && f.name === args[0] && f.type === "file"
          );

          if (fileExists) {
            output = `touch: cannot create file '${args[0]}': File exists`;
          } else {
            const newFile = {
              id: crypto.randomUUID(),
              name: args[0],
              type: "file" as const,
              path: currentPath,
              content: "",
            };
            addFile(newFile);
            output = `Created file ${args[0]}`;
          }
        } else {
          output = "touch: missing file operand";
        }
        break;

      case "mkdir":
        if (args[0]) {
          const folderExists = files.some(
            (f) =>
              f.path === currentPath &&
              f.name === args[0] &&
              f.type === "folder"
          );

          if (folderExists) {
            output = `mkdir: cannot create directory '${args[0]}': Directory exists`;
          } else {
            const newFolder = {
              id: crypto.randomUUID(),
              name: args[0],
              type: "folder" as const,
              path: currentPath,
            };
            addFile(newFolder);
            output = `Created directory ${args[0]}`;
          }
        } else {
          output = "mkdir: missing operand";
        }
        break;

      case "cat":
        if (args[0]) {
          const file = files.find(
            (f) =>
              f.path === currentPath && f.name === args[0] && f.type === "file"
          );

          if (file) {
            output = file.content || "(empty file)";
          } else {
            output = `cat: ${args[0]}: No such file`;
          }
        } else {
          output = "cat: missing file operand";
        }
        break;

      case "nano":
        if (args[0]) {
          const file = files.find(
            (f) =>
              f.path === currentPath && f.name === args[0] && f.type === "file"
          );

          if (file) {
            // Pencere oluştur
            const size = { width: 800, height: 600 };
            const position = calculateCascadingPosition(
              size.width,
              size.height
            );

            addWindow({
              id: uuidv4(),
              title: `Nano: ${args[0]}`,
              type: "nano",
              position,
              size,
              isMinimized: false,
              isMaximized: false,
              zIndex: 1,
              fileId: file.id,
            });
            output = `Opening ${args[0]} in nano editor...`;
          } else {
            // Dosya yoksa oluştur
            const newFileId = crypto.randomUUID();
            const newFile = {
              id: newFileId,
              name: args[0],
              type: "file" as const,
              path: currentPath,
              content: "",
            };
            addFile(newFile);

            // Pencere oluştur
            const size = { width: 800, height: 600 };
            const position = calculateCascadingPosition(
              size.width,
              size.height
            );

            addWindow({
              id: uuidv4(),
              title: `Nano: ${args[0]}`,
              type: "nano",
              position,
              size,
              isMinimized: false,
              isMaximized: false,
              zIndex: 1,
              fileId: newFileId,
            });

            output = `Created and opening new file ${args[0]} in nano editor...`;
          }
        } else {
          output = "nano: missing file operand";
        }
        break;

      case "clear":
        setCommands([]);
        return;

      case "help":
        output = `Available commands:
  ls - List directory contents
  cd - Change directory
  pwd - Print working directory
  touch - Create a file
  mkdir - Create a directory
  cat - Display file contents
  nano - Open simple text editor
  clear - Clear terminal
  help - Display this help message`;
        break;

      case "":
        return;

      default:
        output = `Command not found: ${cmd}`;
    }

    setCommands([...commands, { command, output }]);
    setCurrentCommand("");
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (showSuggestions) {
        selectCurrentSuggestion();
      } else {
        executeCommand(currentCommand);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (showSuggestions) {
        navigateSuggestions();
      } else {
        applyTab();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (showSuggestions) {
        // Öneriler gösteriliyorsa, önceki öneriye git
        const prevIndex =
          selectedSuggestionIndex > 0
            ? selectedSuggestionIndex - 1
            : suggestions.length - 1;
        setSelectedSuggestionIndex(prevIndex);
      } else {
        // Komut geçmişinde gezin
        const nextIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        if (nextIndex >= 0 && commandHistory[nextIndex]) {
          setCurrentCommand(commandHistory[nextIndex]);
          setHistoryIndex(nextIndex);
        }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (showSuggestions) {
        // Öneriler gösteriliyorsa, sonraki öneriye git
        const nextIndex = (selectedSuggestionIndex + 1) % suggestions.length;
        setSelectedSuggestionIndex(nextIndex);
      } else {
        // Komut geçmişinde gezin
        const prevIndex = Math.max(historyIndex - 1, -1);
        if (prevIndex >= 0) {
          setCurrentCommand(commandHistory[prevIndex]);
        } else {
          setCurrentCommand("");
        }
        setHistoryIndex(prevIndex);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string, index: number) => {
    const parts = currentCommand.trim().split(" ");
    if (parts.length === 1) {
      setCurrentCommand(suggestion);
    } else {
      parts[parts.length - 1] = suggestion;
      setCurrentCommand(parts.join(" "));
    }
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleOpenFile = () => {
    const size = { width: 800, height: 600 };
    const position = calculateCascadingPosition(size.width, size.height);

    addWindow({
      id: uuidv4(),
      title: "Dosya Seç",
      type: "file-manager",
      position,
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
      mode: "open", // Dosya açma modu
    });
  };

  const handleSaveFile = () => {
    const size = { width: 800, height: 600 };
    const position = calculateCascadingPosition(size.width, size.height);

    addWindow({
      id: uuidv4(),
      title: "Dosya Kaydet",
      type: "file-manager",
      position,
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
      mode: "save", // Dosya kaydetme modu
    });
  };

  return (
    <div className="bg-[#1a1b26] text-[#a9b1d6] font-mono p-4 h-full overflow-auto">
      {commands.map((cmd, index) => (
        <div key={index} className="mb-2">
          <div className="flex">
            <span className="text-[#f7768e]">$</span>
            <span className="ml-2">{cmd.command}</span>
          </div>
          {cmd.output && (
            <div className="mt-1 whitespace-pre-wrap">{cmd.output}</div>
          )}
        </div>
      ))}
      <div className="flex relative">
        <span className="text-[#f7768e]">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => {
            setCurrentCommand(e.target.value);
            setShowSuggestions(false);
          }}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none ml-2 flex-1 text-[#a9b1d6]"
          spellCheck={false}
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 top-full mt-1 bg-[#24283b] border border-[#414868] rounded-md overflow-hidden shadow-lg z-10">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className={`px-3 py-1 cursor-pointer ${
                  idx === selectedSuggestionIndex
                    ? "bg-[#414868] text-white"
                    : "hover:bg-[#414868]"
                }`}
                onClick={() => selectSuggestion(suggestion, idx)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
