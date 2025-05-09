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
  path: string;
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
  const [sudoMode, setSudoMode] = useState(false);
  const [sudoCommand, setSudoCommand] = useState("");
  const [sudoPassword, setSudoPassword] = useState("");
  // Her terminal penceresi için kendi yerel yolunu tut
  const [localCurrentPath, setLocalCurrentPath] = useState("/");

  const {
    files,
    getUserAccessibleFiles,
    hasReadPermission,
    hasWritePermission,
    hasExecutePermission,
    addFile,
    updateFile,
  } = useFileManagerStore();

  const {
    currentUser,
    users,
    isUserAdmin,
    setAdminStatus,
    addUser: addUserToSystem,
  } = useUserStore();

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

  // Kullanıcının home dizinini yerel yol olarak belirle
  useEffect(() => {
    if (currentUser) {
      const homePath = `/home/${currentUser.username}`;
      setLocalCurrentPath(homePath);
    }
  }, [currentUser]);

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
      "chmod",
      "chown",
      "sudo",
      "useradd",
      "usermod",
      "whoami",
    ];
  };

  const getFilesAndDirsInCurrentPath = () => {
    // Kullanıcının erişebileceği dosyaları getir - yerel yolu kullan
    return getUserAccessibleFiles(currentUser.username, localCurrentPath).map(
      (file) => file.name
    );
  };

  const getUsernames = () => {
    return users.map((user) => user.username);
  };

  const findSuggestions = (partialCommand: string) => {
    const parts = partialCommand.trim().split(" ");
    const lastWord = parts[parts.length - 1];
    const command = parts[0];

    if (parts.length === 1) {
      // Komut tamamlama
      const commandSuggestions = getAvailableCommands().filter((cmd) =>
        cmd.startsWith(lastWord)
      );
      return commandSuggestions;
    } else {
      // Dosya/dizin tamamlama (genel durum)
      if (command === "chown" && parts.length === 2) {
        // chown için kullanıcı adları öner
        return getUsernames().filter((username) =>
          username.startsWith(lastWord)
        );
      } else {
        // Diğer komutlar için dosya/dizin adları öner
        const filesDirs = getFilesAndDirsInCurrentPath();
        return filesDirs.filter((item) => item.startsWith(lastWord));
      }
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

  const executeSudoCommand = (password: string) => {
    // Şifre kontrolü
    if (password !== currentUser.password) {
      setCommands([
        ...commands,
        {
          command: "sudo " + sudoCommand,
          output: "sudo: incorrect password",
          path: localCurrentPath,
        },
      ]);
      setSudoMode(false);
      setSudoCommand("");
      setSudoPassword("");
      return;
    }

    // Sudo komutu çalıştır
    executeCommand(sudoCommand, true);
    setSudoMode(false);
    setSudoCommand("");
    setSudoPassword("");
  };

  const executeCommand = (command: string, isSudo: boolean = false) => {
    const [cmd, ...args] = command.trim().split(" ");

    // Komut geçmişine ekle
    setCommandHistory([command, ...commandHistory]);
    setHistoryIndex(-1);

    let output = "";
    let newPath = localCurrentPath;

    // Admin yetkisi olmayan kullanıcıların yetkili işlemleri için sudo kontrolü
    const isAdmin = isSudo || isUserAdmin(currentUser.username);

    switch (cmd) {
      case "ls":
        // Kullanıcının erişebileceği dosyaları göster - yerel yolu kullan
        const accessibleFiles = getUserAccessibleFiles(
          currentUser.username,
          localCurrentPath
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
          let nextPath = "";

          // Mutlak yol mu?
          if (targetPath.startsWith("/")) {
            nextPath = targetPath;
          }
          // Kısayol: ~ ile başlıyorsa kullanıcının ev dizinine git
          else if (targetPath === "~" || targetPath.startsWith("~/")) {
            const homePath = `/home/${currentUser.username}`;
            nextPath =
              targetPath === "~"
                ? homePath
                : `${homePath}/${targetPath.substring(2)}`;
          }
          // Özel durum: '..' ile üst dizine git
          else if (targetPath === "..") {
            const parentPath =
              localCurrentPath.split("/").slice(0, -1).join("/") || "/";
            nextPath = parentPath;
          }
          // Nispi yol
          else {
            nextPath = `${localCurrentPath}/${targetPath}`.replace(/\/+/g, "/");
          }

          // Yol kontrolü ve normalize
          nextPath = nextPath.replace(/\/+/g, "/");
          if (nextPath === "") nextPath = "/";

          // Hedef yolun varlığını kontrol et
          // Önce "/" ile başlayan yol bileşenlerini ayır
          const pathParts = nextPath.split("/").filter((part) => part !== "");
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
            newPath = nextPath;
            setLocalCurrentPath(nextPath); // Global yerine local state'i güncelle
            output = `Changed directory to ${nextPath}`;
          }
        } else {
          // Argüman verilmemişse ev dizinine git
          const homePath = `/home/${currentUser.username}`;
          newPath = homePath;
          setLocalCurrentPath(homePath); // Global yerine local state'i güncelle
          output = `Changed directory to ${homePath}`;
        }
        break;

      case "pwd":
        output = localCurrentPath; // Global yerine local state'i kullan
        break;

      case "touch":
        if (args[0]) {
          // Şu anki dizine yazma izni kontrolü - yerel yolu kullan
          const currentDir = files.find(
            (f) =>
              f.path === localCurrentPath.split("/").slice(0, -1).join("/") &&
              f.name === localCurrentPath.split("/").pop()
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
              f.path === localCurrentPath &&
              f.name === args[0] &&
              f.type === "file"
          );

          if (fileExists) {
            output = `touch: cannot create file '${args[0]}': File exists`;
          } else {
            const newFile = {
              id: uuidv4(),
              name: args[0],
              type: "file" as const,
              path: localCurrentPath,
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
          // Şu anki dizine yazma izni kontrolü - yerel yolu kullan
          const currentDir = files.find(
            (f) =>
              f.path === localCurrentPath.split("/").slice(0, -1).join("/") &&
              f.name === localCurrentPath.split("/").pop()
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
              f.path === localCurrentPath &&
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
              path: localCurrentPath,
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
              f.path === localCurrentPath &&
              f.name === args[0] &&
              f.type === "file"
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
          handleOpenFile(args[0]);
        } else {
          output = "nano: missing file operand";
        }
        return;

      case "chmod":
        if (args.length < 2) {
          output =
            "chmod: missing operand\nTry 'chmod [+/-][r/w/x] [target] [user]'";
          break;
        }

        const modeStr = args[0];
        const targetFile = args[1];
        const targetUser = args[2] || "*"; // Kullanıcı belirtilmezse herkes için işlem yap

        // İzin değişikliği yapılacak dosyayı bul - yerel yolu kullan
        const fileToChange = files.find(
          (f) => f.path === localCurrentPath && f.name === targetFile
        );

        if (!fileToChange) {
          output = `chmod: cannot access '${targetFile}': No such file or directory`;
          break;
        }

        // Dosya sahibi veya admin değilse yetkiyi reddet
        if (fileToChange.owner !== currentUser.username && !isAdmin) {
          output = `chmod: changing permissions of '${targetFile}': Operation not permitted`;
          break;
        }

        // İzinleri ayarla
        if (!fileToChange.permissions) {
          fileToChange.permissions = {
            read: [],
            write: [],
            execute: [],
          };
        }

        const operation = modeStr[0]; // + veya -
        const permission = modeStr.slice(1); // r, w, x

        if (
          !["+", "-"].includes(operation) ||
          !["r", "w", "x"].includes(permission)
        ) {
          output = `chmod: invalid mode: '${modeStr}'`;
          break;
        }

        let permissionsUpdated = false;

        if (permission === "r") {
          if (operation === "+") {
            // İzin ekle
            if (!fileToChange.permissions.read.includes(targetUser)) {
              fileToChange.permissions.read.push(targetUser);
              permissionsUpdated = true;
            }
          } else {
            // İzin kaldır
            fileToChange.permissions.read =
              fileToChange.permissions.read.filter(
                (user) => user !== targetUser
              );
            permissionsUpdated = true;
          }
        } else if (permission === "w") {
          if (operation === "+") {
            if (!fileToChange.permissions.write.includes(targetUser)) {
              fileToChange.permissions.write.push(targetUser);
              permissionsUpdated = true;
            }
          } else {
            fileToChange.permissions.write =
              fileToChange.permissions.write.filter(
                (user) => user !== targetUser
              );
            permissionsUpdated = true;
          }
        } else if (permission === "x") {
          if (operation === "+") {
            if (!fileToChange.permissions.execute.includes(targetUser)) {
              fileToChange.permissions.execute.push(targetUser);
              permissionsUpdated = true;
            }
          } else {
            fileToChange.permissions.execute =
              fileToChange.permissions.execute.filter(
                (user) => user !== targetUser
              );
            permissionsUpdated = true;
          }
        }

        if (permissionsUpdated) {
          // Dosya izinlerini güncelle
          updateFile(fileToChange.id, {
            permissions: fileToChange.permissions,
          });
          output = `Changed permissions of '${targetFile}' for user '${
            targetUser === "*" ? "all users" : targetUser
          }'`;
        } else {
          output = `Permissions already set for '${targetFile}'`;
        }
        break;

      case "chown":
        if (args.length < 2) {
          output = "chown: missing operand\nTry 'chown user file'";
          break;
        }

        const newOwner = args[0];
        const targetFileName = args[1];

        // Kullanıcı var mı kontrol et
        const userExists = users.some((user) => user.username === newOwner);
        if (!userExists) {
          output = `chown: invalid user: '${newOwner}'`;
          break;
        }

        // Hedef dosyayı bul - yerel yolu kullan
        const fileToChangeOwner = files.find(
          (f) => f.path === localCurrentPath && f.name === targetFileName
        );

        if (!fileToChangeOwner) {
          output = `chown: cannot access '${targetFileName}': No such file or directory`;
          break;
        }

        // Sadece dosya sahibi veya admin sahipliği değiştirebilir
        if (fileToChangeOwner.owner !== currentUser.username && !isAdmin) {
          output = `chown: changing ownership of '${targetFileName}': Operation not permitted`;
          break;
        }

        // Sahipliği değiştir
        updateFile(fileToChangeOwner.id, { owner: newOwner });
        output = `Changed owner of '${targetFileName}' from '${
          fileToChangeOwner.owner || "root"
        }' to '${newOwner}'`;
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
chmod - Change file permissions (+/-[r/w/x] file [user])
chown - Change file owner (user file)
 sudo - Execute command as root
useradd - Add a new user (admin only)
usermod - Modify user permissions (admin only)
whoami - Print current user
 help - Display this help`;
        break;

      case "clear":
        setCommands([]);
        return;

      case "sudo":
        if (args.length === 0) {
          output = "sudo: a command is required";
          break;
        }

        // Zaten admin ise direkt çalıştır
        if (isUserAdmin(currentUser.username)) {
          executeCommand(args.join(" "), true);
          return;
        }

        // Sudo moduna geç ve şifre iste
        setSudoMode(true);
        setSudoCommand(args.join(" "));
        return;

      case "useradd":
        if (!isAdmin) {
          output = "useradd: Permission denied";
          break;
        }

        if (args.length < 2) {
          output =
            "useradd: missing username and password\nTry 'useradd username password'";
          break;
        }

        const newUsername = args[0];
        const newPassword = args[1];
        const makeAdmin = args.includes("--admin");

        try {
          // Yeni kullanıcı oluştur
          addUserToSystem(newUsername, newPassword, undefined, makeAdmin);
          output = `User '${newUsername}' created successfully${
            makeAdmin ? " with admin privileges" : ""
          }`;
        } catch (error: any) {
          output = `useradd: ${error.message}`;
        }
        break;

      case "usermod":
        if (!isAdmin) {
          output = "usermod: Permission denied";
          break;
        }

        if (args.length < 2) {
          output =
            "usermod: missing option and username\nTry 'usermod --admin username'";
          break;
        }

        const modOption = args[0];
        const modUsername = args[1];

        if (modOption !== "--admin" && modOption !== "--remove-admin") {
          output = `usermod: invalid option '${modOption}'`;
          break;
        }

        const modTargetUser = users.find((u) => u.username === modUsername);
        if (!modTargetUser) {
          output = `usermod: user '${modUsername}' does not exist`;
          break;
        }

        // Admin yetkisi ekle veya kaldır
        setAdminStatus(modUsername, modOption === "--admin");
        output = `User '${modUsername}' ${
          modOption === "--admin" ? "granted" : "removed"
        } admin privileges`;
        break;

      case "whoami":
        output = currentUser.username;
        if (isUserAdmin(currentUser.username)) {
          output += " (admin)";
        }
        break;

      default:
        output = `${cmd}: command not found`;
    }

    // Yeni komutu ekle, çalıştırıldığı dizini de sakla
    setCommands([
      ...commands,
      {
        command,
        output,
        path: localCurrentPath,
      },
    ]);

    setCurrentCommand("");
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Sudo modundayken şifre girişi
    if (sudoMode) {
      if (e.key === "Enter") {
        executeSudoCommand(sudoPassword);
      }
      return;
    }

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

  const handleOpenFile = (fileName: string) => {
    // Önce dosyayı bul - yerel yolu kullan
    const file = files.find(
      (f) =>
        f.path === localCurrentPath && f.name === fileName && f.type === "file"
    );

    if (!file) {
      setCommands([
        ...commands,
        {
          command: `nano ${fileName}`,
          output: `nano: ${fileName}: No such file`,
          path: localCurrentPath,
        },
      ]);
      return;
    }

    if (!hasReadPermission(file, currentUser.username)) {
      setCommands([
        ...commands,
        {
          command: `nano ${fileName}`,
          output: `nano: ${fileName}: Permission denied`,
          path: localCurrentPath,
        },
      ]);
      return;
    }

    const size = { width: 800, height: 600 };
    const position = calculateCascadingPosition(size.width, size.height);

    addWindow({
      id: uuidv4(),
      title: `Nano - ${fileName}`,
      type: "nano",
      position,
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
      fileId: file.id,
    });
  };

  // Terminal promptunu oluşturan yardımcı fonksiyon
  const renderPrompt = (path: string = localCurrentPath) => {
    const isAdmin = isUserAdmin(currentUser?.username);
    // Home dizinine kısaltma
    let displayPath = path;
    const homePath = `/home/${currentUser.username}`;

    if (path.startsWith(homePath)) {
      // /home/username dizinini ~ ile değiştir
      displayPath = path.replace(homePath, "~");
    }

    return (
      <span className="text-[#f7768e]">
        <span className="text-green-400">{currentUser.username}</span>
        <span className="text-white">:</span>
        <span className="text-blue-400">{displayPath}</span>
        <span>{isAdmin ? "# " : "$ "}</span>
      </span>
    );
  };

  return (
    <div className="bg-[#1a1b26] text-[#a9b1d6] font-mono p-4 h-full overflow-auto">
      {commands.map((cmd, index) => (
        <div key={index} className="mb-2">
          <div className="flex">
            <span className="text-[#f7768e]">
              <span className="text-green-400">{currentUser.username}</span>
              <span className="text-white">:</span>
              <span className="text-blue-400">
                {(() => {
                  const homePath = `/home/${currentUser.username}`;
                  let displayPath = cmd.path || "/";

                  // Home dizinini ~ ile göster
                  if (displayPath.startsWith(homePath)) {
                    displayPath = displayPath.replace(homePath, "~");
                  }

                  return displayPath;
                })()}
              </span>
              {isUserAdmin(currentUser.username) ? "# " : "$ "}
            </span>
            <span className="ml-2">{cmd.command}</span>
          </div>
          {cmd.output && (
            <div className="mt-1 whitespace-pre-wrap">{cmd.output}</div>
          )}
        </div>
      ))}
      <div className="flex relative">
        {sudoMode ? (
          <>
            <span className="text-[#f7768e]">
              <span className="text-green-400">{currentUser.username}</span>
              <span className="text-white">:</span>
              <span className="text-blue-400">
                {(() => {
                  const homePath = `/home/${currentUser.username}`;
                  let displayPath = localCurrentPath;
                  if (displayPath.startsWith(homePath)) {
                    displayPath = displayPath.replace(homePath, "~");
                  }
                  return displayPath;
                })()}
              </span>
              {"# "}
            </span>
            <input
              type="password"
              value={sudoPassword}
              onChange={(e) => setSudoPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="[sudo] password for current user:"
              className="bg-transparent border-none outline-none ml-2 flex-1 text-[#a9b1d6]"
              autoFocus
            />
          </>
        ) : (
          <>
            {renderPrompt()}
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
          </>
        )}

        {showSuggestions && suggestions.length > 0 && !sudoMode && (
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
