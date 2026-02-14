import { useEffect, useMemo, useState } from "react";
import { CartContext } from "./CartContext.js";

function loadCart() {
  try {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function CartProvider({ children }) {
  const [lines, setLines] = useState(loadCart()); // [{ item_number, quantity }]

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(lines));
  }, [lines]);

  const api = useMemo(() => {
    return {
      lines,
      add(item_number, quantity = 1) {
        setLines((prev) => {
          const found = prev.find((x) => x.item_number === item_number);
          if (found) {
            return prev.map((x) =>
              x.item_number === item_number
                ? { ...x, quantity: x.quantity + quantity }
                : x
            );
          }
          return [...prev, { item_number, quantity }];
        });
      },
      setQty(item_number, quantity) {
        setLines((prev) =>
          prev
            .map((x) => (x.item_number === item_number ? { ...x, quantity } : x))
            .filter((x) => x.quantity > 0)
        );
      },
      remove(item_number) {
        setLines((prev) => prev.filter((x) => x.item_number !== item_number));
      },
      clear() {
        setLines([]);
      },
      count() {
        return lines.reduce((sum, x) => sum + x.quantity, 0);
      },
    };
  }, [lines]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}
