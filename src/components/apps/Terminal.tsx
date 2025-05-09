import {
  calculateCascadingPosition,
  calculateCenterPosition,
} from "../../utils/window";
import { useEffect, useRef, useState } from "react";

import { useFileManagerStore } from "../../store/fileManagerStore";
import { useUserStore } from "../../store/userStore";
import { useWindowManagerStore } from "../../store/windowManagerStore";
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

  const {
    files,
    currentPath,
    setCurrentPath,
    addFile,
    getUserAccessibleFiles,
    hasReadPermission,
    hasWritePermission,
    hasExecutePermission,
  } = useFileManagerStore();

  const { currentUser } = useUserStore();
  const { addWindow } = useWindowManagerStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Kullanıcı giriş yapmamışsa engelle
  if (!currentUser) {
    return (
      <div className="font-mono p-4 bg-black text-green-500 h-full overflow-auto">
        <div>Error: Authentication required to use terminal</div>
      </div>
    );
  }

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
    // Kullanıcının erişebileceği dosyaları getir
    return getUserAccessibleFiles(currentUser.username, currentPath).map(
      (file) => file.name
    );
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
        // Kullanıcının erişebileceği dosyaları göster
        const accessibleFiles = getUserAccessibleFiles(
          currentUser.username,
          currentPath
        );
        output = accessibleFiles
          .map((file) => {
            const permissions = [
              file.type === "folder" ? "d" : "-",
              hasReadPermission(file, currentUser.username) ? "r" : "-",
              hasWritePermission(file, currentUser.username) ? "w" : "-",
              hasExecutePermission(file, currentUser.username) ? "x" : "-",
              "---", // Diğer kullanıcılar için izinler
            ].join("");

            return `${permissions} ${file.owner || "root"} ${file.name}`;
          })
          .join("\n");

        if (accessibleFiles.length === 0) {
          output = "Directory is empty";
        }
        break;

      case "cd":
        if (args[0]) {
          let targetPath = args[0];
          let newPath = "";

          // Mutlak yol mu?
          if (targetPath.startsWith("/")) {
            newPath = targetPath;
          }
          // Kısayol: ~ ile başlıyorsa kullanıcının ev dizinine git
          else if (targetPath === "~" || targetPath.startsWith("~/")) {
            const homePath = `/home/${currentUser.username}`;
            newPath =
              targetPath === "~"
                ? homePath
                : `${homePath}/${targetPath.substring(2)}`;
          }
          // Özel durum: '..' ile üst dizine git
          else if (targetPath === "..") {
            const parentPath =
              currentPath.split("/").slice(0, -1).join("/") || "/";
            newPath = parentPath;
          }
          // Nispi yol
          else {
            newPath = `${currentPath}/${targetPath}`.replace(/\/+/g, "/");
          }

          // Yol kontrolü ve normalize
          newPath = newPath.replace(/\/+/g, "/");
          if (newPath === "") newPath = "/";

          // Hedef yolun varlığını kontrol et
          // Önce "/" ile başlayan yol bileşenlerini ayır
          const pathParts = newPath.split("/").filter((part) => part !== "");
          let currentPathCheck = "/";
          let targetExists = true;
          let permissionExists = true;

          // Yolu adım adım kontrol et
          for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            const nextPath =
              currentPathCheck === "/"
                ? `/${part}`
                : `${currentPathCheck}/${part}`;

            // Özel durum: /home dizini ve /home/username kontrolleri
            if (
              nextPath === "/home" ||
              nextPath === `/home/${currentUser.username}`
            ) {
              // /home ve /home/username her zaman var kabul edilir
              currentPathCheck = nextPath;
              continue;
            }

            // Dosya sisteminde var mı?
            const pathExists = files.some((f) => {
              if (i === 0 && part === "home") return true; // /home her zaman var
              if (nextPath === `/home/${currentUser.username}`) return true; // kullanıcı home'u her zaman var

              return (
                f.path === currentPathCheck &&
                f.name === part &&
                f.type === "folder"
              );
            });

            if (!pathExists) {
              targetExists = false;
              break;
            }

            // Erişim izni var mı?
            if (
              nextPath !== "/home" &&
              nextPath !== `/home/${currentUser.username}`
            ) {
              const folder = files.find(
                (f) =>
                  f.path === currentPathCheck &&
                  f.name === part &&
                  f.type === "folder"
              );

              if (
                folder &&
                !hasExecutePermission(folder, currentUser.username)
              ) {
                permissionExists = false;
                break;
              }
            }

            currentPathCheck = nextPath;
          }

          // Hedef yol var mı ve erişim izni var mı?
          if (!targetExists) {
            output = `cd: ${targetPath}: No such directory`;
          } else if (!permissionExists) {
            output = `cd: ${targetPath}: Permission denied`;
          } else {
            setCurrentPath(newPath);
            output = `Changed directory to ${newPath}`;
          }
        } else {
          // Argüman verilmemişse ev dizinine git
          const homePath = `/home/${currentUser.username}`;
          setCurrentPath(homePath);
          output = `Changed directory to ${homePath}`;
        }
        break;

      case "pwd":
        output = currentPath;
        break;

      case "touch":
        if (args[0]) {
          // Şu anki dizine yazma izni kontrolü
          const currentDir = files.find(
            (f) =>
              f.path === currentPath.split("/").slice(0, -1).join("/") &&
              f.name === currentPath.split("/").pop()
          );

          if (
            currentDir &&
            !hasWritePermission(currentDir, currentUser.username)
          ) {
            output = `touch: cannot create file '${args[0]}': Permission denied`;
            break;
          }

          const fileExists = files.some(
            (f) =>
              f.path === currentPath && f.name === args[0] && f.type === "file"
          );

          if (fileExists) {
            output = `touch: cannot create file '${args[0]}': File exists`;
          } else {
            const newFile = {
              id: uuidv4(),
              name: args[0],
              type: "file" as const,
              path: currentPath,
              content: "",
              owner: currentUser.username,
              permissions: {
                read: [currentUser.username],
                write: [currentUser.username],
                execute: [currentUser.username],
              },
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
          // Şu anki dizine yazma izni kontrolü
          const currentDir = files.find(
            (f) =>
              f.path === currentPath.split("/").slice(0, -1).join("/") &&
              f.name === currentPath.split("/").pop()
          );

          if (
            currentDir &&
            !hasWritePermission(currentDir, currentUser.username)
          ) {
            output = `mkdir: cannot create directory '${args[0]}': Permission denied`;
            break;
          }

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
              id: uuidv4(),
              name: args[0],
              type: "folder" as const,
              path: currentPath,
              owner: currentUser.username,
              permissions: {
                read: [currentUser.username],
                write: [currentUser.username],
                execute: [currentUser.username],
              },
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

          if (!file) {
            output = `cat: ${args[0]}: No such file`;
          } else if (!hasReadPermission(file, currentUser.username)) {
            output = `cat: ${args[0]}: Permission denied`;
          } else {
            output = file.content || "(empty file)";
          }
        } else {
          output = "cat: missing file operand";
        }
        break;

      case "nano":
        if (args[0]) {
          handleOpenFile();
        } else {
          output = "nano: missing file operand";
        }
        break;

      case "help":
        output = `Available commands:
ls - List directory contents
cd - Change directory
pwd - Print working directory
touch - Create empty file
mkdir - Create directory
clear - Clear terminal
cat - Display file content
nano - Edit file
help - Display this help`;
        break;

      case "clear":
        setCommands([]);
        return;

      default:
        output = `${cmd}: command not found`;
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
