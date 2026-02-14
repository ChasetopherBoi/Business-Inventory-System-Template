import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function getToken() {
  return localStorage.getItem("access_token");
}

async function apiMyOrders() {
  const token = getToken();
  const res = await fetch("/api/v1/orders/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to load orders");
  }
  return res.json();
}

export default function OrdersPage() {
  const loc = useLocation();
  const placed = Boolean(loc.state?.placed);
  const orderId = loc.state?.orderId;

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function load({ silent = false } = {}) {
    try {
      if (!silent) setLoading(true);
      setError("");
      const data = await apiMyOrders();
      setOrders(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e?.message || "Failed to load orders");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    load();

    // Poll every 10 seconds for status changes
    const id = setInterval(() => load({ silent: true }), 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <h1 className="h3 mb-0">Orders</h1>

        <div className="d-flex align-items-center gap-2">
          {lastUpdated ? (
            <span className="text-muted small">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          ) : null}
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => load()}
            disabled={loading}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {placed ? (
        <div className="alert alert-success mt-3">
          Order placed{orderId ? ` (#${orderId})` : ""}!
        </div>
      ) : null}

      {error ? <div className="alert alert-danger mt-3">{error}</div> : null}

      {loading ? (
        <div className="text-muted mt-3">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="text-muted mt-3">No orders yet.</div>
      ) : (
        <div className="d-grid gap-3 mt-3">
          {orders.map((o) => (
            <div key={o.id} className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between gap-3">
                  <div className="fw-bold">Order #{o.id}</div>
                  <div className="text-muted">
                    {new Date(o.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="text-muted small">Status: {o.status}</div>

                <div className="mt-3">
                  {(o.items ?? []).map((it) => (
                    <div key={it.item_number} className="d-flex justify-content-between small">
                      <span>{it.name} x{it.quantity}</span>
                      <span>${Number(it.line_total).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <hr />

                <div className="d-flex justify-content-between small">
                  <span>Subtotal</span>
                  <span>${Number(o.subtotal).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span>Tax</span>
                  <span>${Number(o.tax).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>${Number(o.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
