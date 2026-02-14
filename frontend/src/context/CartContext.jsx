// src/context/CartContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearLegacyCart,
  loadCart,
  saveCart,
  clearCart as clearCartStorage,
} from "../utils/cartStorage";

const CartContext = createContext(null);

export function CartProvider({ me, children }) {
  const [items, setItems] = useState([]);

  // One-time cleanup: remove old global cart keys so carts don't leak between users
  useEffect(() => {
    clearLegacyCart();
  }, []);

  // Whenever "me" changes, load that user's cart
  useEffect(() => {
    if (!me) {
      setItems([]);
      return;
    }
    setItems(loadCart(me));
  }, [me?.id, me?.email]);

  // Persist any cart change for this user
  useEffect(() => {
    if (!me) return;
    saveCart(me, items);
  }, [items, me?.id, me?.email]);

  const addItem = useCallback(
    (product, qty = 1) => {
      if (!me) return;
      if (!product?.id) return;

      setItems((prev) => {
        const next = [...prev];
        const idx = next.findIndex((x) => String(x.id) === String(product.id));

        if (idx >= 0) {
          const currentQty = Number(next[idx].qty) || 1;
          next[idx] = { ...next[idx], qty: currentQty + (Number(qty) || 1) };
        } else {
          next.push({
            id: product.id,
            name: product.name ?? product.title ?? "Item",
            price: Number(product.price) || 0,
            qty: Number(qty) || 1,
          });
        }
        return next;
      });
    },
    [me]
  );

  const removeItem = useCallback(
    (productId) => {
      if (!me) return;
      setItems((prev) => prev.filter((x) => String(x.id) !== String(productId)));
    },
    [me]
  );

  const setQty = useCallback(
    (productId, qty) => {
      if (!me) return;
      const q = Number(qty);
      if (!Number.isFinite(q)) return;

      setItems((prev) => {
        if (q <= 0) return prev.filter((x) => String(x.id) !== String(productId));
        return prev.map((x) =>
          String(x.id) === String(productId) ? { ...x, qty: q } : x
        );
      });
    },
    [me]
  );

  const clear = useCallback(() => {
    if (!me) return;
    setItems([]);
    clearCartStorage(me);
  }, [me]);

  const count = useMemo(() => {
    return items.reduce((sum, x) => sum + (Number(x.qty) || 1), 0);
  }, [items]);

  const value = useMemo(() => {
    return { items, count, addItem, removeItem, setQty, clear };
  }, [items, count, addItem, removeItem, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  // This error ONLY triggers if a component is not wrapped by <CartProvider>
  if (!ctx) throw new Error("useCart must be used inside <CartProvider me={me}>");
  return ctx;
}
