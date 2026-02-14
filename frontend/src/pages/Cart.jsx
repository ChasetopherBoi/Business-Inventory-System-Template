import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const TAX_RATE = 0.0825;

function getToken() {
  return localStorage.getItem("access_token");
}

async function apiCheckout(lines) {
  const token = getToken();
  const res = await fetch("/api/v1/orders/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ lines }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Checkout failed");
  }
  return res.json();
}

export default function CartPage() {
  const nav = useNavigate();
  const { items, setQty, removeItem, clear } = useCart();

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const subtotal = useMemo(() => {
    return items.reduce((sum, x) => sum + (Number(x.price) || 0) * (Number(x.qty) || 1), 0);
  }, [items]);

  const tax = useMemo(() => {
    return Math.round(subtotal * TAX_RATE * 100) / 100;
  }, [subtotal]);

  const total = useMemo(() => {
    return Math.round((subtotal + tax) * 100) / 100;
  }, [subtotal, tax]);

  const checkoutLines = useMemo(() => {
    // Convert CartContext items into the backend's expected shape
    // Your backend expects: [{ item_number, quantity }, ...]
    return items.map((x) => ({
      item_number: x.id, // we stored item_number as id in Shop.jsx
      quantity: Number(x.qty) || 1,
    }));
  }, [items]);

  async function onCheckout() {
    try {
      setError("");
      setBusy(true);

      const order = await apiCheckout(checkoutLines);
      clear();
      nav("/orders", { state: { placed: true, orderId: order.id } });
    } catch (e) {
      setError(e?.message || "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <h1 className="h3 mb-0">Cart</h1>

        {items.length > 0 ? (
          <button className="btn btn-outline-danger btn-sm" onClick={clear} disabled={busy}>
            Clear cart
          </button>
        ) : null}
      </div>

      {error ? <div className="alert alert-danger mt-3">{error}</div> : null}

      {items.length === 0 ? (
        <div className="text-muted mt-3">Your cart is empty.</div>
      ) : (
        <div className="row g-3 mt-1">
          {/* LEFT: HORIZONTAL ROW CARDS */}
          <div className="col-12 col-lg-8">
            <div className="d-flex flex-column gap-2">
              {items.map((x) => {
                const qty = Number(x.qty) || 1;
                const price = Number(x.price) || 0;
                const lineTotal = price * qty;

                return (
                  <div key={x.id} className="card shadow-sm">
                    <div className="card-body">
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                        {/* Left: Name + id */}
                        <div style={{ minWidth: 220 }}>
                          <div className="fw-semibold">{x.name}</div>
                          <div className="text-muted small">#{x.id}</div>
                        </div>

                        {/* Middle: Price */}
                        <div className="text-nowrap">
                          <div className="text-muted small">Price</div>
                          <div className="fw-semibold">${price.toFixed(2)}</div>
                        </div>

                        {/* Middle: Qty */}
                        <div className="text-nowrap">
                          <div className="text-muted small">Qty</div>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            style={{ width: 96 }}
                            value={qty}
                            onChange={(e) => setQty(x.id, Number(e.target.value))}
                            disabled={busy}
                          />
                        </div>

                        {/* Middle: Line total */}
                        <div className="text-nowrap">
                          <div className="text-muted small">Line total</div>
                          <div className="fw-semibold">${lineTotal.toFixed(2)}</div>
                        </div>

                        {/* Right: Actions */}
                        <div className="ms-auto">
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => removeItem(x.id)}
                            disabled={busy}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h6 mb-3">Order Summary</h2>

                <div className="d-flex justify-content-between">
                  <span className="text-muted">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between mt-1">
                  <span className="text-muted">Tax (8.25%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <button
                  className="btn btn-primary w-100 mt-3"
                  disabled={busy || items.length === 0}
                  onClick={onCheckout}
                >
                  {busy ? "Processing…" : "Checkout"}
                </button>

                <div className="text-muted small mt-2">
                  Demo checkout. Inventory will be validated server-side.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
