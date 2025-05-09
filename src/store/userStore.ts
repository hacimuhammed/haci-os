import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useFileManagerStore } from "./fileManagerStore";
import { v4 as uuidv4 } from "uuid";

export interface User {
  id: string;
  username: string;
  password: string; // Gerçek sistemde hashlenmiş olmalı
  createdAt: Date;
  lastLogin?: Date;
  avatar?: string;
  isAdmin?: boolean; // Admin yetkisi
}

interface UserState {
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  addUser: (
    username: string,
    password: string,
    avatar?: string,
    isAdmin?: boolean
  ) => User;
  removeUser: (id: string) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  initializeSystem: () => void;
  isUserAdmin: (username: string) => boolean;
  setAdminStatus: (username: string, isAdmin: boolean) => void;
}

// Varsayılan kullanıcıları oluşturan fonksiyon
const createDefaultUsers = (): User[] => {
  return [
    {
      id: uuidv4(),
      username: "haci",
      password: "password", // Gerçek uygulamada hash kullanın
      createdAt: new Date(),
      isAdmin: true, // haci kullanıcısına admin yetkisi verildi
    },
    {
      id: uuidv4(),
      username: "misafir",
      password: "guest", // Gerçek uygulamada hash kullanın
      createdAt: new Date(),
      isAdmin: false,
    },
  ];
};

// Kullanıcının home klasörü için standart klasörler oluşturan yardımcı fonksiyon
export const createUserHomeDirectories = (username: string) => {
  const directories = ["Downloads", "Pictures", "Documents", "Music", "Videos"];
  return directories.map((dir) => ({
    id: uuidv4(),
    name: dir,
    type: "folder" as const,
    path: `/home/${username}`,
  }));
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: createDefaultUsers(),
      currentUser: null,
      isAuthenticated: false,

      // Kullanıcı admin mi?
      isUserAdmin: (username: string) => {
        const user = get().users.find((u) => u.username === username);
        return user?.isAdmin === true;
      },

      // Kullanıcıya admin yetkisi ver/al
      setAdminStatus: (username: string, isAdmin: boolean) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.username === username ? { ...user, isAdmin } : user
          ),
          // Eğer aktif kullanıcıysa onu da güncelle
          currentUser:
            state.currentUser?.username === username
              ? { ...state.currentUser, isAdmin }
              : state.currentUser,
        }));
      },

      // Sistem başlatma (varsayılan kullanıcılar için dosya sistemi oluşturma)
      initializeSystem: () => {
        const { users } = get();
        const fileManagerStore = useFileManagerStore.getState();

        // Her kullanıcı için dosya sistemi yapısını oluştur
        users.forEach((user) => {
          // Kullanıcının dizin yapısını oluştur
          if (
            !fileManagerStore.files.some(
              (file) => file.path === "/home" && file.name === user.username
            )
          ) {
            fileManagerStore.initializeUserDirectory(user.username);
          }
        });
      },

      // Yeni kullanıcı ekleme
      addUser: (
        username: string,
        password: string,
        avatar?: string,
        isAdmin: boolean = false
      ) => {
        // Kullanıcı adı kontrolü
        const existingUser = get().users.find(
          (user) => user.username === username
        );
        if (existingUser) {
          throw new Error("Username already exists");
        }

        const newUser: User = {
          id: uuidv4(),
          username,
          password,
          createdAt: new Date(),
          avatar,
          isAdmin,
        };

        set((state) => ({
          users: [...state.users, newUser],
        }));

        return newUser;
      },

      // Kullanıcı silme
      removeUser: (id: string) => {
        // Mevcut kullanıcıyı silmeye çalışıyorsa önce çıkış yap
        const { currentUser, logout } = get();
        if (currentUser?.id === id) {
          logout();
        }

        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }));
      },

      // Kullanıcı girişi
      login: (username: string, password: string) => {
        const user = get().users.find(
          (u) => u.username === username && u.password === password
        );

        if (user) {
          // Son giriş zamanını güncelle
          const updatedUser = { ...user, lastLogin: new Date() };

          set({
            currentUser: updatedUser,
            isAuthenticated: true,
            users: get().users.map((u) => (u.id === user.id ? updatedUser : u)),
          });

          return true;
        }

        return false;
      },

      // Kullanıcı çıkışı
      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
        });
      },

      // Kullanıcı güncelleme
      updateUser: (id: string, updates: Partial<User>) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          ),
          // Eğer aktif kullanıcıysa onu da güncelle
          currentUser:
            state.currentUser?.id === id
              ? { ...state.currentUser, ...updates }
              : state.currentUser,
        }));
      },
    }),
    {
      name: "user-storage", // localStorage anahtarı
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
