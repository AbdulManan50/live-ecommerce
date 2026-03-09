import { create } from "zustand";

export const useCartStore = create((set) => ({
  items: [],

  addToCart: (product: any) =>
    set((state: any) => ({
      items: [...state.items, product],
    })),
}));
