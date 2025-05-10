import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserHomeDirectories } from './userStore';

export type FileItem = {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'desktop';
  path: string;
  content?: string;
  icon?: string;
  owner?: string; // Dosyanın sahibi olan kullanıcı adı
  permissions?: {
    read: string[]; // Okuma izni olan kullanıcılar
    write: string[]; // Yazma izni olan kullanıcılar
    execute: string[]; // Çalıştırma izni olan kullanıcılar
  };
};

type FileManagerState = {
  files: FileItem[];
  currentPath: string;
  addFile: (file: FileItem) => void;
  addMultipleFiles: (files: FileItem[]) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;
  renameFile: (id: string, newName: string) => void;
  setCurrentPath: (path: string) => void;
  getUserFiles: (username: string) => FileItem[];
  getUserAccessibleFiles: (username: string, path: string) => FileItem[];
  initializeUserDirectory: (username: string) => void;
  hasReadPermission: (file: FileItem, username: string) => boolean;
  hasWritePermission: (file: FileItem, username: string) => boolean;
  hasExecutePermission: (file: FileItem, username: string) => boolean;
};

export const useFileManagerStore = create<FileManagerState>()(
  persist(
    (set, get) => ({
      files: [],
      currentPath: '/home',

      addFile: file => set(state => ({ files: [...state.files, file] })),

      addMultipleFiles: files =>
        set(state => ({
          files: [...state.files, ...files],
        })),

      removeFile: id =>
        set(state => ({
          files: state.files.filter(file => file.id !== id),
        })),

      updateFile: (id, updates) =>
        set(state => ({
          files: state.files.map(file =>
            file.id === id ? { ...file, ...updates } : file,
          ),
        })),

      renameFile: (id, newName) =>
        set(state => ({
          files: state.files.map(file =>
            file.id === id ? { ...file, name: newName } : file,
          ),
        })),

      setCurrentPath: path => set({ currentPath: path }),

      // İzin kontrolü fonksiyonları
      hasReadPermission: (file: FileItem, username: string) => {
        // Eğer dosya sahibi ise tam izin
        if (file.owner === username) {
          return true;
        }

        // Permissions tanımlı değilse sadece sahibi erişebilir
        if (!file.permissions) {
          return false;
        }

        // Okuma izni kontrolü
        return (
          file.permissions.read.includes(username)
          || file.permissions.read.includes('*')
        ); // * tüm kullanıcılara izin verir
      },

      hasWritePermission: (file: FileItem, username: string) => {
        // Eğer dosya sahibi ise tam izin
        if (file.owner === username) {
          return true;
        }

        // Permissions tanımlı değilse sadece sahibi erişebilir
        if (!file.permissions) {
          return false;
        }

        // Yazma izni kontrolü
        return (
          file.permissions.write.includes(username)
          || file.permissions.write.includes('*')
        );
      },

      hasExecutePermission: (file: FileItem, username: string) => {
        // Eğer dosya sahibi ise tam izin
        if (file.owner === username) {
          return true;
        }

        // Permissions tanımlı değilse sadece sahibi erişebilir
        if (!file.permissions) {
          return false;
        }

        // Çalıştırma izni kontrolü
        return (
          file.permissions.execute.includes(username)
          || file.permissions.execute.includes('*')
        );
      },

      // Belirli bir kullanıcının dosyalarını getir
      getUserFiles: (username) => {
        const userHomePath = `/home/${username}`;
        return get().files.filter(
          file =>
            file.path.startsWith(userHomePath) || file.owner === username,
        );
      },

      // Belirli bir yoldaki, kullanıcının erişebileceği dosyaları getir
      getUserAccessibleFiles: (username, path) => {
        // Özel durum: Kök dizindeyken /home dizinini görebilmelidir
        if (path === '/') {
          const rootElements = get().files.filter(
            file =>
              file.path === '/'
              // /home klasörünü herkes görebilir veya
              && (file.name === 'home'
                // ya da dosya sahibiyse ya da dosyaya okuma izni varsa
                || file.owner === username
                || file.permissions?.read?.includes(username)
                || file.permissions?.read?.includes('*')),
          );

          // Eğer /home klasörü yoksa, otomatik olarak oluştur
          if (!rootElements.some(f => f.name === 'home')) {
            const homeDir = {
              id: uuidv4(),
              name: 'home',
              type: 'folder' as const,
              path: '/',
              permissions: {
                read: ['*'], // Herkes görebilir
                write: ['admin'], // Sadece admin yazabilir
                execute: ['*'], // Herkes çalıştırabilir
              },
            };
            get().addFile(homeDir);
            return [...rootElements, homeDir];
          }

          return rootElements;
        }

        // Özel durum: /home dizinindeyken kendi klasörünü görebilmelidir
        if (path === '/home') {
          return get().files.filter(
            file =>
              file.path === '/home'
              // Kendi klasörünü görebilir veya
              && (file.name === username
                // Dosya sahibiyse veya dosyaya okuma izni varsa
                || file.owner === username
                || file.permissions?.read?.includes(username)
                || file.permissions?.read?.includes('*')),
          );
        }

        // Normal durum: Belirtilen yoldaki erişebileceği dosyaları getir
        return get().files.filter((file) => {
          // Dosya belirtilen yolda mı?
          const isInPath = file.path === path;

          // Kullanıcının okuma izni var mı?
          const canRead = get().hasReadPermission(file, username);

          return isInPath && canRead;
        });
      },

      // Kullanıcının ana dizinini ve varsayılan klasörlerini oluştur
      initializeUserDirectory: (username) => {
        // Önce kullanıcı ana dizinini oluştur - sadece admin ve kendisinin erişim izni olsun
        const userHomeDir: FileItem = {
          id: uuidv4(),
          name: username,
          type: 'folder',
          path: '/home',
          owner: username,
          permissions: {
            read: [username, 'admin'],
            write: [username, 'admin'],
            execute: [username, 'admin'],
          },
        };

        // Desktop klasörü ekle
        const desktopFolder: FileItem = {
          id: uuidv4(),
          name: 'Desktop',
          type: 'folder',
          path: `/home/${username}`,
          owner: username,
          permissions: {
            read: [username, 'admin'],
            write: [username, 'admin'],
            execute: [username, 'admin'],
          },
        };

        // Varsayılan klasörleri oluştur
        const userFolders = createUserHomeDirectories(username).map(
          folder => ({
            ...folder,
            permissions: {
              read: [username, 'admin'],
              write: [username, 'admin'],
              execute: [username, 'admin'],
            },
          }),
        );

        // Tüm dosyaları ekle
        set(state => ({
          files: [...state.files, userHomeDir, desktopFolder, ...userFolders],
        }));
      },
    }),
    {
      name: 'file-manager-storage',
      partialize: state => ({
        files: state.files,
        currentPath: state.currentPath,
      }),
    },
  ),
);
