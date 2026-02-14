// src/utils/cartStorage.js

const LEGACY_KEYS = ["cart", "cartItems"];

function safeKeyPart(value) {
  // make a stable safe key fragment (especially for emails)
  return encodeURIComponent(String(value));
}

export function getCartKey(me) {
  const userId = me?.id ?? me?.email ?? "guest";
  return `cart:${safeKeyPart(userId)}`;
}

export function clearLegacyCart() {
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }
}

export function loadCart(me) {
  try {
    const raw = localStorage.getItem(getCartKey(me));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(me, items) {
  localStorage.setItem(getCartKey(me), JSON.stringify(items ?? []));
}

export function clearCart(me) {
  localStorage.removeItem(getCartKey(me));
}

// Optional dev helper (you can delete if you don't want it)
export function clearAllUserCarts() {
  const keys = Object.keys(localStorage);
  for (const k of keys) {
    if (k.startsWith("cart:")) localStorage.removeItem(k);
  }
}
