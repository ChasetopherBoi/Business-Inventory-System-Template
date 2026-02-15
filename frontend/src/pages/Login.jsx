import { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginPage({ onLogin, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div
      style={{
        margin: "auto",
        padding: "auto",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div className="container py-4">
        <div
          className="h1 mb-3 fw-bold"
          style={{ paddingBottom: "75px", textAlign: "center" }}
        >
          Business Portal
        </div>

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
            placeholder="user@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label className="form-label">Password</label>
          <input
            className="form-control mb-3"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button className="btn btn-primary" type="submit">
            Log in
          </button>

          {error ? <div className="text-danger mt-3">{error}</div> : null}

          <div className="mt-3">
            <Link to="/register">Create an account</Link>
          </div>
        </form>
      </div>
      <div className="card mt-4 shadow-sm text-start" style={{ minWidth: 442, maxWidth: 442, margin: "auto" }}>
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <h5 className="card-title mb-0">Demo Logins</h5>
            <span className="badge text-bg-secondary">Recruiter / Testing</span>
          </div>

          <div className="row g-4 mt-1">
            <div className="col-md-6">
              <div className="border rounded p-4 h-100 d-flex flex-column justify-content-center align-items-center">
                <div className="fw-semibold">ADMIN</div>
                <div className="small text-muted">admin@admin.com</div>
                <div className="small text-muted">Passcode123</div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-4 h-100 d-flex flex-column justify-content-center align-items-center">
                <div className="fw-semibold">BUSINESS</div>
                <div className="small text-muted">manager@store.com</div>
                <div className="small text-muted">Boss4567</div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label fw-semibold">Notes:</label>
            <div></div>
          </div>
        </div>
      </div>

    </div>
  );
}
