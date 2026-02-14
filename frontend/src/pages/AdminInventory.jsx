import { useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "../constants/categories.js";

function getToken() {
  return localStorage.getItem("access_token");
}

async function apiListItems() {
  const res = await fetch("/api/v1/items/");
  if (!res.ok) throw new Error("Failed to load items");
  return res.json();
}

async function apiCreateItem(item) {
  const token = getToken();
  const res = await fetch("/api/v1/items/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to create item");
  }
  return res.json();
}

async function apiUpdateItem(item_number, patch) {
  const token = getToken();
  const res = await fetch(`/api/v1/items/${encodeURIComponent(item_number)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to update item");
  }
  return res.json();
}

async function apiDeleteItem(item_number) {
  const token = getToken();
  const res = await fetch(`/api/v1/items/${encodeURIComponent(item_number)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to delete item");
  }
}

async function apiUploadItemImage(item_number, file) {
  const token = getToken();
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`/api/v1/items/${encodeURIComponent(item_number)}/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to upload image");
  }
  return res.json();
}

async function apiChangeRole(email, role) {
  const token = getToken();
  const res = await fetch("/api/v1/admin/change-role", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ email, role }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to change role");
  }
  return res.json();
}

function InventoryRow({ item, selected, onClick, onDelete, onEdit }) {
  return (
    <button
      type="button"
      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start ${
        selected ? "active" : ""
      }`}
      onClick={onClick}
    >
      <div className="me-2">
        <div className="fw-semibold">
          {item.name}{" "}
          <span className={selected ? "text-white-50" : "text-muted"}>
            #{item.item_number}
          </span>
        </div>
        <div className={selected ? "text-white-50 small" : "text-muted small"}>
          {item.category}
          {item.subcategory ? ` • ${item.subcategory}` : ""} • Stock: {item.qty_in_stock} • ${Number(item.price).toFixed(2)}
        </div>
      </div>

      <div className="d-flex gap-2">
        <span className={`btn btn-sm ${selected ? "btn-outline-light" : "btn-outline-secondary"}`}
          onClick={(e) => { e.stopPropagation(); onEdit(item); }}
        >
          Edit
        </span>

        <span
          className={`btn btn-sm ${selected ? "btn-outline-light" : "btn-outline-danger"}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.item_number);
          }}
        >
          Delete
        </span>
      </div>
    </button>
  );
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState([]);
  const [selectedItemNumber, setSelectedItemNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add form
  const [form, setForm] = useState({
    item_number: "",
    name: "",
    description: "",
    qty_per_purchase: 1,
    qty_in_stock: 0,
    price: 0,
    category: "Office Supplies",
    subcategory: "",
    image_file: null,
  });

  // Edit modal state
  const [editing, setEditing] = useState(null); // item object or null
  const [editPatch, setEditPatch] = useState({});

  // Change role panel state
  const [roleEmail, setRoleEmail] = useState("");
  const [roleValue, setRoleValue] = useState("shop");
  const [roleMsg, setRoleMsg] = useState("");

  function setField(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function load() {
    try {
      setError("");
      setLoading(true);
      const data = await apiListItems();
      setItems(data);
      setSelectedItemNumber((prev) => prev || data[0]?.item_number || null);
    } catch (e) {
      setError(e?.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const selected = useMemo(() => {
    return items.find((x) => x.item_number === selectedItemNumber) || null;
  }, [items, selectedItemNumber]);

  async function onDelete(itemNumber) {
    try {
      setError("");
      await apiDeleteItem(itemNumber);
      setItems((prev) => prev.filter((x) => x.item_number !== itemNumber));
      if (selectedItemNumber === itemNumber) {
        const next = items.find((x) => x.item_number !== itemNumber);
        setSelectedItemNumber(next?.item_number || null);
      }
    } catch (e) {
      setError(e?.message || "Failed to delete item");
    }
  }

  async function onAdd(e) {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        item_number: String(form.item_number),
        name: form.name,
        description: form.description,
        qty_per_purchase: Number(form.qty_per_purchase),
        qty_in_stock: Number(form.qty_in_stock),
        price: Number(form.price),
        image_url: null,
        category: form.category,
        subcategory: form.subcategory ? form.subcategory : null,
      };

      const created = await apiCreateItem(payload);

      let finalItem = created;
      if (form.image_file) {
        finalItem = await apiUploadItemImage(created.item_number, form.image_file);
      }

      setItems((prev) => [finalItem, ...prev]);
      setSelectedItemNumber(finalItem.item_number);

      setForm({
        item_number: "",
        name: "",
        description: "",
        qty_per_purchase: 1,
        qty_in_stock: 0,
        price: 0,
        category: "Office Supplies",
        subcategory: "",
        image_file: null,
      });
    } catch (e) {
      setError(e?.message || "Failed to add item");
    }
  }

  function onEditStart(item) {
    setEditing(item);
    setEditPatch({
      name: item.name,
      description: item.description,
      qty_per_purchase: item.qty_per_purchase,
      qty_in_stock: item.qty_in_stock,
      price: Number(item.price),
      category: item.category,
      subcategory: item.subcategory || "",
    });
  }

  async function onEditSave() {
    try {
      setError("");
      const updated = await apiUpdateItem(editing.item_number, {
        ...editPatch,
        subcategory: editPatch.subcategory ? editPatch.subcategory : null,
      });
      setItems((prev) => prev.map((x) => (x.item_number === updated.item_number ? updated : x)));
      setEditing(null);
      setEditPatch({});
    } catch (e) {
      setError(e?.message || "Failed to update item");
    }
  }

  async function onChangeRole(e) {
    e.preventDefault();
    try {
      setRoleMsg("");
      const res = await apiChangeRole(roleEmail, roleValue);
      setRoleMsg(`Updated: ${res.email} → ${res.role}`);
      setRoleEmail("");
      setRoleValue("shop");
    } catch (e2) {
      setRoleMsg(e2?.message || "Failed to change role");
    }
  }

  return (
    <div className="container-fluid py-4 page-content">
      <div className="mb-3 d-flex justify-content-between align-items-end gap-2">
        <div>
          <h1 className="h3 mb-0">Admin Inventory</h1>
          <div className="text-muted">Manage inventory items (add / delete / edit). Orders + chart come next.</div>
        </div>
        <button className="btn btn-outline-secondary" onClick={load}>Refresh</button>
      </div>

      {loading ? <div className="text-muted mb-2">Loading…</div> : null}
      {error ? <div className="alert alert-danger py-2">{error}</div> : null}

      <div className="row g-3">
        {/* LEFT: list */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header fw-semibold">Inventory Items</div>
            <div className="list-group list-group-flush">
              {items.map((item) => (
                <InventoryRow
                  key={item.item_number}
                  item={item}
                  selected={item.item_number === selectedItemNumber}
                  onClick={() => setSelectedItemNumber(item.item_number)}
                  onDelete={onDelete}
                  onEdit={onEditStart}
                />
              ))}
              {!loading && items.length === 0 ? <div className="p-3 text-muted">No items yet.</div> : null}
            </div>
          </div>

          <div className="card shadow-sm mt-3">
            <div className="card-header fw-semibold">Selected Item</div>
            <div className="card-body">
              {selected ? (
                <>
                  <div className="fw-bold">{selected.name}</div>
                  <div className="text-muted small">Item #{selected.item_number}</div>
                  <div className="text-muted small">
                    {selected.category}{selected.subcategory ? ` • ${selected.subcategory}` : ""}
                  </div>
                  <div className="mt-2">{selected.description}</div>
                  <div className="mt-3 small">
                    <div>Qty/purchase: {selected.qty_per_purchase}</div>
                    <div>Stock: {selected.qty_in_stock}</div>
                    <div>Price: ${Number(selected.price).toFixed(2)}</div>
                  </div>
                </>
              ) : (
                <div className="text-muted">Select an item to preview.</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: add + chart + change role */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header fw-semibold">Add Item</div>
            <div className="card-body">
              <form className="row g-3" onSubmit={onAdd}>
                <div className="col-md-6">
                  <label className="form-label">Item number</label>
                  <input className="form-control" value={form.item_number} onChange={(e) => setField("item_number", e.target.value)} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setField("description", e.target.value)} required />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Qty per purchase</label>
                  <input type="number" min="1" className="form-control" value={form.qty_per_purchase} onChange={(e) => setField("qty_per_purchase", e.target.value)} required />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Qty in stock</label>
                  <input type="number" min="0" className="form-control" value={form.qty_in_stock} onChange={(e) => setField("qty_in_stock", e.target.value)} required />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Price</label>
                  <input type="number" min="0" step="0.01" className="form-control" value={form.price} onChange={(e) => setField("price", e.target.value)} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={form.category} onChange={(e) => setField("category", e.target.value)} required>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Subcategory (optional)</label>
                  <input className="form-control" value={form.subcategory} onChange={(e) => setField("subcategory", e.target.value)} />
                </div>

                <div className="col-12">
                  <label className="form-label">Image</label>
                  <input className="form-control" type="file" accept="image/*"
                    onChange={(e) => setField("image_file", e.target.files?.[0] || null)}
                  />
                  <div className="text-muted small mt-1">If provided, image uploads after the item is created.</div>
                </div>

                <div className="col-12">
                  <button className="btn btn-primary" type="submit">Add item</button>
                </div>
              </form>
            </div>
          </div>

          <div className="card shadow-sm mt-3">
            <div className="card-header fw-semibold">Inventory Chart</div>
            <div className="card-body text-muted">Chart goes here later.</div>
          </div>

          <div className="card shadow-sm mt-3">
            <div className="card-header fw-semibold">Change Role</div>
            <div className="card-body">
              <form className="row g-2" onSubmit={onChangeRole}>
                <div className="col-md-7">
                  <input className="form-control" placeholder="User email" value={roleEmail} onChange={(e) => setRoleEmail(e.target.value)} required />
                </div>
                <div className="col-md-3">
                  <select className="form-control" value={roleValue} onChange={(e) => setRoleValue(e.target.value)}>
                    <option value="shop">shop</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div className="col-md-2 d-grid">
                  <button className="btn btn-outline-primary" type="submit">Apply</button>
                </div>
              </form>
              {roleMsg ? <div className="text-muted small mt-2" style={{ whiteSpace: "pre-line" }}>{roleMsg}</div> : null}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing ? (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Item #{editing.item_number}</h5>
                <button type="button" className="btn-close" onClick={() => setEditing(null)} />
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={editPatch.name || ""} onChange={(e) => setEditPatch((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} value={editPatch.description || ""} onChange={(e) => setEditPatch((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label">Qty/purchase</label>
                    <input type="number" min="1" className="form-control" value={editPatch.qty_per_purchase ?? 1}
                      onChange={(e) => setEditPatch((p) => ({ ...p, qty_per_purchase: Number(e.target.value) }))} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Stock</label>
                    <input type="number" min="0" className="form-control" value={editPatch.qty_in_stock ?? 0}
                      onChange={(e) => setEditPatch((p) => ({ ...p, qty_in_stock: Number(e.target.value) }))} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Price</label>
                    <input type="number" min="0" step="0.01" className="form-control" value={editPatch.price ?? 0}
                      onChange={(e) => setEditPatch((p) => ({ ...p, price: Number(e.target.value) }))} />
                  </div>
                </div>

                <div className="row g-2 mt-1">
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select className="form-control" value={editPatch.category || "Office Supplies"}
                      onChange={(e) => setEditPatch((p) => ({ ...p, category: e.target.value }))}>
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Subcategory</label>
                    <input className="form-control" value={editPatch.subcategory || ""} onChange={(e) => setEditPatch((p) => ({ ...p, subcategory: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setEditing(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={onEditSave}>Save</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
