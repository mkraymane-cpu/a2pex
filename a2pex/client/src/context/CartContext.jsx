import { createContext, useEffect, useMemo, useState } from 'react';

export const CartContext = createContext(null);

const STORAGE_KEY = 'a2pex_cart';

function loadInitialCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitialCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, size, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === product.id && i.size === size
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          clubName: product.clubName,
          season: product.season,
          kitType: product.kitType,
          brand: product.brand,
          slug: product.slug,
          image: product.images?.[0]?.url || null,
          unitPrice: product.finalPrice,
          size,
          quantity,
          maxStock: product.stockQuantity,
        },
      ];
    });
  };

  const removeItem = (productId, size) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  };

  const updateQuantity = (productId, size, quantity) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.size === size
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock || quantity)) }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const { subtotal, itemCount } = useMemo(() => {
    return items.reduce(
      (acc, i) => ({
        subtotal: acc.subtotal + i.unitPrice * i.quantity,
        itemCount: acc.itemCount + i.quantity,
      }),
      { subtotal: 0, itemCount: 0 }
    );
  }, [items]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
