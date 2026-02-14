import { useEffect, useState } from "react";

    
function getToken() {
  return localStorage.getItem("access_token");
}

async function apiAllOrders() {
  const token = getToken();
  const res = await fetch("/api/v1/orders/", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to load orders");
  }
  return res.json();
}

async function apiSetStatus(orderId, statusValue) {
  const token = getToken();
  const res = await fetch(`/api/v1/orders/${orderId}/status?status_value=${encodeURIComponent(statusValue)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to update status");
  }
  return res.json();
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");

    async function load() {
        try {
            setError("");
            const data = await apiAllOrders();
            setOrders(data);
        } catch (e) {
            setError(e?.message || "Failed to load orders");
        }
    }

    useEffect(() => {
    (async () => {
        try {
        setError("");
        const data = await apiAllOrders();
        setOrders(data);
        } catch (e) {
        setError(e?.message || "Failed to load orders");
        }
    })();
    }, []);


  async function onChangeStatus(orderId, statusValue) {
    try {
      setError("");
      const updated = await apiSetStatus(orderId, statusValue);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (e) {
      setError(e?.message || "Failed to update status");
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-end">
        <h1 className="h3">Admin Orders</h1>
        <button className="btn btn-outline-secondary" onClick={load}>Refresh</button>
      </div>

      {error ? <div className="alert alert-danger mt-3">{error}</div> : null}

      {orders.length === 0 ? (
        <div className="text-muted mt-3">No orders.</div>
      ) : (
        <div className="d-grid gap-3 mt-3">
          {orders.map((o) => (
            <div key={o.id} className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div className="fw-bold">Order #{o.id}</div>
                  <div className="text-muted">{new Date(o.created_at).toLocaleString()}</div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div className="text-muted small">Status</div>
                  <select
                    className="form-control"
                    style={{ width: 200 }}
                    value={o.status}
                    onChange={(e) => onChangeStatus(o.id, e.target.value)}
                  >
                    <option value="in_progress">in_progress</option>
                    <option value="shipped">shipped</option>
                    <option value="complete">complete</option>
                  </select>
                </div>

                <div className="mt-3">
                  {o.items.map((it) => (
                    <div key={it.item_number} className="d-flex justify-content-between small">
                      <span>{it.name} x{it.quantity}</span>
                      <span>${Number(it.line_total).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <hr />
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
