import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  slug?: string; // Added slug
  variantId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variantId?: string) => void;
  updateQuantity: (id: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) => item.id === newItem.id && item.variantId === newItem.variantId
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          const existingItem = updatedItems[existingItemIndex];
          // Check stock limit
          const newQuantity = (Number(existingItem.quantity) || 0) + (Number(newItem.quantity) || 1);
          const stock = Number(newItem.stock) || 999;
          
          if (newQuantity > stock) {
              updatedItems[existingItemIndex] = {
                ...existingItem,
                quantity: Math.min(newQuantity, stock),
                stock: stock,
                slug: newItem.slug || existingItem.slug // Update slug if provided
              };
          } else {
              updatedItems[existingItemIndex] = {
                ...existingItem,
                quantity: newQuantity,
                stock: stock,
                slug: newItem.slug || existingItem.slug // Update slug if provided
              };
          }
          set({ items: updatedItems });
        } else {
          // Check stock limit for new item
          const qty = Number(newItem.quantity) || 1;
          const stock = Number(newItem.stock) || 999;
          
          if (qty > stock) {
              newItem.quantity = stock;
          }
          newItem.stock = stock;
          set({ items: [...currentItems, newItem] });
        }
      },
      removeItem: (id, variantId) => {
        set({
          items: get().items.filter(
            (item) => !(item.id === id && item.variantId === variantId)
          ),
        });
      },
      updateQuantity: (id, quantity, variantId) => {
        const currentItems = get().items;
        const updatedItems = currentItems.map((item) => {
          if (item.id === id && item.variantId === variantId) {
            // Ensure quantity doesn't exceed stock
            const stock = Number(item.stock) || 999;
            const validQuantity = Math.min(Math.max(1, Number(quantity) || 1), stock);
            return { ...item, quantity: validQuantity };
          }
          return item;
        });
        set({ items: updatedItems });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
      totalPrice: () =>
        get().items.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0),
    }),
    {
      name: "cart-storage",
    }
  )
);
