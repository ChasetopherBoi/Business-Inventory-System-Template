import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";

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

function Shop() {
  return (
    <PageShell>
      <h1 className="h3">Shop</h1>
      <p className="text-muted">This will be the non-admin view.</p>
    </PageShell>
  );
}

function Admin() {
  return (
    <PageShell>
      <h1 className="h3">Admin Panel</h1>
      <p className="text-muted">Inventory management will go here next.</p>
    </PageShell>
  );
}

function Login({ onLogin, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div
      style={{
        margin: "auto",
        width: "100vw",
        height: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <PageShell>
        <div className="h3 mb-3" style={{ margin: "auto", maxWidth: 420 }}>
          Login
        </div>

        <form
          className="card p-3"
          style={{ maxWidth: 420, margin: "auto" }}
          onSubmit={(e) => onLogin(e, email, password)}
        >
          <label className="form-label">Email</label>
          <input
            className="form-control mb-3"
            placeholder={"user@example.com"}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="form-label">Password</label>
          <input
            className="form-control mb-3"
            type="password"
            placeholder={"********"}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-primary" type="submit">
            Log in
          </button>

          {error ? <div className="text-danger mt-3">{error}</div> : null}
        </form>
      </PageShell>
    </div>
  );
}

function Register() {
  return (
    <PageShell>
      <h1 className="h3">Create account</h1>
      <p className="text-muted">We’ll wire this to POST /users soon.</p>
    </PageShell>
  );
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

      // Immediately load /me using the fresh token
      const user = await apiGetMe(data.access_token);
      setMe(user);

      // Route based on role
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
    <>
      <NavBar me={me} onLogout={onLogout} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={onLogin} error={error} />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/shop"
          element={
            <RequireAuth me={me}>
              <Shop />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAdmin me={me}>
              <Admin />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
