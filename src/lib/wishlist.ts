import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: string;
  slug?: string; // Added slug
  name: string;
  price: number;
  image: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  setItems: (items: WishlistItem[]) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);
        if (!existingItem) {
          set({ items: [...currentItems, item] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      setItems: (items) => set({ items }),
      isInWishlist: (id) => {
        return get().items.some((i) => i.id === id);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "wishlist-storage",
    }
  )
);
