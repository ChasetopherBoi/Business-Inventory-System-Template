import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import RegisterPage from "./pages/Register.jsx";
import LoginPage from "./pages/Login.jsx";
import AdminInventoryPage from "./pages/AdminInventory.jsx";
import ShopPage from "./pages/Shop.jsx";
import CartPage from "./pages/Cart.jsx";
import OrdersPage from "./pages/Orders.jsx";
import AdminOrdersPage from "./pages/AdminOrders.jsx";
import { CartProvider } from "./context/CartContext.jsx";

function getToken() {
  return localStorage.getItem("access_token");
}
function setToken(token) {
  localStorage.setItem("access_token", token);
}
function clearToken() {
  localStorage.removeItem("access_token");
}

async function apiGetMe(token) {
  const res = await fetch("/api/v1/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch /me");
  return res.json();
}

function FullPageSpinner() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          border: "3px solid #ccc",
          borderTop: "3px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <div>Loading…</div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

async function apiLogin(email, password) {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

function PageShell({ children }) {
  return <div className="container py-4">{children}</div>;
}

function Home() {
  return (
    <PageShell>
      <h1 className="h3">Dashboard</h1>
      <p className="text-muted mb-0">Welcome. Use the navigation above.</p>
    </PageShell>
  );
}


async function apiRegister(name, email, password) {
  const res = await fetch("/api/v1/users/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: name, email, password }),
  });

  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { /* not json */ }

  if (!res.ok) {
    console.error("HTTP", res.status, text);
    throw new Error((data && (data.detail || data.message)) || text || `HTTP ${res.status}`);
  }

  return data;
}

function RequireAuth({ me, children }) {
  if (!me) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ me, children }) {
  if (!me) return <Navigate to="/login" replace />;
  if (me.role !== "admin") return <Navigate to="/shop" replace />;
  return children;
}

export default function App() {
  const [token, setTokenState] = useState(getToken());
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  async function refreshMe(currentToken) {
    try {
      const data = await apiGetMe(currentToken);
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setAuthChecked(true);
    }
  }

  useEffect(() => {
    if (token) {
      refreshMe(token);
    } else {
      setMe(null);
      setAuthChecked(true);
    }
  }, [token]);

  async function onLogin(e, email, password) {
    e.preventDefault();
    setError("");

    try {
      const data = await apiLogin(email, password);

      setToken(data.access_token);
      setTokenState(data.access_token);

      const user = await apiGetMe(data.access_token);
      setMe(user);

      if (user.role === "admin") navigate("/admin");
      else navigate("/shop");
    } catch {
      setError("Invalid email or password");
    }
  }

  function onLogout() {
    clearToken();
    setTokenState(null);
    setMe(null);
    navigate("/login");
  }

  if (!authChecked) return <FullPageSpinner />;

  return (
    <CartProvider me={me}>
      <NavBar me={me} onLogout={onLogout} />

      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<LoginPage onLogin={onLogin} error={error} />} />
          <Route path="/register" element={<RegisterPage onRegister={apiRegister} />} />

          <Route
            path="/shop"
            element={
              <RequireAuth me={me}>
                <ShopPage me={me} />
              </RequireAuth>
            }
          />
          <Route
            path="/cart"
            element={
              <RequireAuth me={me}>
                <CartPage />
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAuth me={me}>
                <OrdersPage />
              </RequireAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAdmin me={me}>
                <AdminInventoryPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <RequireAdmin me={me}>
                <AdminOrdersPage />
              </RequireAdmin>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </CartProvider>
  );
}
