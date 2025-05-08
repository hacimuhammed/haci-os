import { create } from "zustand";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
}

interface FileManagerState {
  files: FileItem[];
  currentPath: string;
  addFile: (file: FileItem) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;
  setCurrentPath: (path: string) => void;
}

export const useFileManagerStore = create<FileManagerState>((set) => ({
  files: [],
  currentPath: "/home",
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  removeFile: (id) =>
    set((state) => ({ files: state.files.filter((file) => file.id !== id) })),
  updateFile: (id, updates) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.id === id ? { ...file, ...updates } : file
      ),
    })),
  setCurrentPath: (path) => set({ currentPath: path }),
}));
