import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

// Ürün için interface tanımı
export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  discountPrice?: number;
  sku: string;
  createdAt: number;
  updatedAt: number;
}

// Store için interface tanımı
interface ProductStoreState {
  products: Product[];
  // CRUD İşlemleri
  addProduct: (
    product: Omit<Product, "id" | "slug" | "createdAt" | "updatedAt">
  ) => string;
  updateProduct: (
    id: string,
    updates: Partial<Omit<Product, "id" | "slug" | "createdAt" | "updatedAt">>
  ) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
}

// Slug oluşturma yardımcı fonksiyonu
export const createSlug = (title: string): string => {
  // Title'ı küçük harfe çevir ve özel karakterleri kaldır
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Alfanumerik olmayan karakterleri sil
    .replace(/[\s_-]+/g, "-") // Boşlukları tire ile değiştir
    .replace(/^-+|-+$/g, ""); // Baştaki ve sondaki tireleri kaldır

  // Base-36 timestamp kodu oluştur
  const timestamp = Date.now().toString(36);

  return `${baseSlug}-${timestamp}`;
};

// ProductStore oluştur
export const useProductStore = create<ProductStoreState>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (productData) => {
        const id = uuidv4();
        const timestamp = Date.now();
        const product: Product = {
          id,
          slug: createSlug(productData.title),
          ...productData,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          products: [...state.products, product],
        }));

        return id;
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? {
                  ...product,
                  ...updates,
                  updatedAt: Date.now(),
                }
              : product
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        }));
      },

      getProduct: (id) => {
        return get().products.find((product) => product.id === id);
      },
    }),
    {
      name: "product-storage",
      skipHydration: true,
    }
  )
);
