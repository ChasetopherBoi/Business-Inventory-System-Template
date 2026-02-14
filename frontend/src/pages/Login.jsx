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
      <div className="container d-flex align-items-center gap-5 py-4 justify-content-center" style={{ maxWidth: "1000px", minWidth: "500px" }}>
        <div class="row align-items-center">
          <div class="col-md-6 text-md">
            <h3 class="mb-1 text-nowrap" style={{ maxWidth: "50%" }}>Admin Login:</h3>
          </div>
          <div class="col-md-6 text-md-end">
            <h6 class="mb-1">admin@admin.com</h6>
            <h6 class="mb-0">Passcode123</h6>
          </div>
        </div>
      </div>
            <div className="container d-flex align-items-center gap-5 py-4 justify-content-center" style={{ maxWidth: "1000px", minWidth: "500px" }}>
        <div class="row align-items-center">
          <div class="col-md-6 text-md">
            <h3 class="mb-1 text-nowrap" style={{ maxWidth: "50%" }}>Business Login:</h3>
          </div>
          <div class="col-md-6 text-md-end">
            <h6 class="mb-1">manager@store.com</h6>
            <h6 class="mb-0">Boss4567</h6>
          </div>
        </div>
      </div>
    </div>
  );
}
