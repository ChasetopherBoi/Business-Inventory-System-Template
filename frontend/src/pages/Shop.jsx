import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

async function apiListItems() {
  const res = await fetch("/api/v1/items/");
  if (!res.ok) throw new Error("Failed to load inventory");
  return res.json();
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function InventoryCard({ me, item, onAdd }) {
  const isAdmin = me?.role === "admin";
  const canAdd = !!me && !isAdmin;

  return (
    <div className="card h-100 shadow-sm">
      <div
        className="bg-light border-bottom"
        style={{
          height: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {item.image_url ? (
          <img
            src={`http://127.0.0.1:8000${item.image_url}`}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="text-muted">No image</div>
        )}
      </div>

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div>
            <div className="fw-bold">{item.name}</div>
            <div className="text-muted small">Item #{item.item_number}</div>
            <div className="text-muted small">
              {item.category}
              {item.subcategory ? ` • ${item.subcategory}` : ""}
            </div>
          </div>
          <div className="fw-bold">${Number(item.price).toFixed(2)}</div>
        </div>

        <div className="mt-2 small text-muted" style={{ minHeight: 40 }}>
          {item.description}
        </div>

        <div className="mt-auto pt-2">
          <div className="d-flex justify-content-between small">
            <span>Qty per purchase</span>
            <span className="fw-semibold">{item.qty_per_purchase}</span>
          </div>
          <div className="d-flex justify-content-between small">
            <span>In stock</span>
            <span className="fw-semibold">{item.qty_in_stock}</span>
          </div>

          {canAdd ? (
            <button className="btn btn-primary w-100 mt-2" onClick={onAdd}>
              Add to cart
            </button>
          ) : (
            <div className="text-muted small mt-2">
              {isAdmin ? "Admin view" : "Login to add to cart"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage({ me }) {
  const { addItem } = useCart();

  const query = useQuery();
  const category = query.get("category") || "";
  const sub = query.get("sub") || "";

  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setLoading(true);
      const data = await apiListItems();
      setItems(data);
    } catch (e) {
      setError(e?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return items
      .filter((it) => {
        if (!category) return true;
        if (it.category !== category) return false;
        if (sub && it.subcategory !== sub) return false;
        return true;
      })
      .filter((it) => {
        if (!term) return true;
        const hay = `${it.item_number} ${it.name} ${it.description}`.toLowerCase();
        return hay.includes(term);
      });
  }, [items, q, category, sub]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
        <div>
          <h1 className="h3 mb-0">Shop</h1>
          <div className="text-muted">
            {category ? (
              <>
                Category: <span className="fw-semibold">{category}</span>
                {sub ? (
                  <>
                    {" "}
                    • <span className="fw-semibold">{sub}</span>
                  </>
                ) : null}
              </>
            ) : (
              "Browse available inventory items."
            )}
          </div>
        </div>

        <div className="d-flex gap-2" style={{ minWidth: 260 }}>
          <input
            className="form-control"
            placeholder="Search items…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn btn-outline-secondary" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? <div className="text-muted mt-3">Loading items…</div> : null}
      {error ? <div className="alert alert-danger mt-3">{error}</div> : null}

      <div className="row g-3 mt-2">
        {filtered.map((item) => (
          <div key={item.item_number} className="col-12 col-sm-6 col-lg-4">
            <InventoryCard
              me={me}
              item={item}
              onAdd={() =>
                addItem(
                  {
                    // IMPORTANT: CartContext expects `id`
                    id: item.item_number, // use item_number as the cart id
                    name: item.name,
                    price: Number(item.price) || 0,
                  },
                  1
                )
              }
            />
          </div>
        ))}

        {!loading && filtered.length === 0 ? (
          <div className="text-muted mt-3">No items match your search.</div>
        ) : null}
      </div>
    </div>
  );
}
