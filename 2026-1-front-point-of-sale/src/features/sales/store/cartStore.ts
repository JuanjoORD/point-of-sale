import { create } from 'zustand';
import { Producto } from '@/features/inventory/types/inventory.types';
import { CartActionResult, CartItem } from '../types/sales.types';

interface CartState {
  items: CartItem[];
  addItem: (product: Producto, stockDisponible: number | null) => CartActionResult;
  setQuantity: (id_producto: number, cantidad: number) => CartActionResult;
  removeItem: (id_producto: number) => void;
  clear: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

const validateQuantity = (item: CartItem, cantidad: number): CartActionResult => {
  if (cantidad <= 0) {
    return { ok: false, error: 'La cantidad debe ser mayor a 0.' };
  }
  if (!item.es_servicio && item.stock_disponible !== null && cantidad > item.stock_disponible) {
    return {
      ok: false,
      error: `Stock insuficiente. Disponible: ${item.stock_disponible}`,
    };
  }
  return { ok: true };
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product, stockDisponible) => {
    if (!product.es_servicio && (stockDisponible ?? 0) <= 0) {
      return { ok: false, error: 'Sin stock disponible para este producto.' };
    }

    const existing = get().items.find((item) => item.id_producto === product.id_producto);
    if (existing) {
      return get().setQuantity(product.id_producto, existing.cantidad + 1);
    }

    const newItem: CartItem = {
      id_producto: product.id_producto,
      nombre_producto: product.nombre_producto,
      codigo_barras: product.codigo_barras,
      precio_venta: product.precio_venta,
      es_servicio: product.es_servicio,
      cantidad: 1,
      stock_disponible: product.es_servicio ? null : stockDisponible,
    };

    const validation = validateQuantity(newItem, 1);
    if (!validation.ok) return validation;

    set({ items: [...get().items, newItem] });
    return { ok: true };
  },

  setQuantity: (id_producto, cantidad) => {
    const item = get().items.find((i) => i.id_producto === id_producto);
    if (!item) return { ok: false, error: 'Producto no encontrado en el carrito.' };

    const validation = validateQuantity(item, cantidad);
    if (!validation.ok) return validation;

    set({
      items: get().items.map((i) =>
        i.id_producto === id_producto ? { ...i, cantidad } : i,
      ),
    });
    return { ok: true };
  },

  removeItem: (id_producto) => {
    set({ items: get().items.filter((i) => i.id_producto !== id_producto) });
  },

  clear: () => set({ items: [] }),

  getSubtotal: () =>
    roundMoney(
      get().items.reduce((sum, item) => sum + item.precio_venta * item.cantidad, 0),
    ),

  getTotalItems: () => get().items.reduce((sum, item) => sum + item.cantidad, 0),
}));
