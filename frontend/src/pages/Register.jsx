import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
      setError("");
      
    if (!name.trim() || !email.trim() || !password.trim()) {
    setError("Please fill out name, email, and password.");
    return;
    }

    try {
      await onRegister(name, email, password, "shop");
      navigate("/login");
    } catch (err) {
      setError(err?.message || "Registration failed");
    }
  }

  return (
    <div
      style={{
        margin: "auto",
        width: "100vw",
        height: "calc(100dvh - 90px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
          Register
        </div>

        <form
          className="card p-3"
          style={{ maxWidth: 420, margin: "auto" }}
          onSubmit={handleSubmit}
        >
          <label className="form-label">Name</label>
          <input
            className="form-control mb-3"
            placeholder="Full name"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />

          <label className="form-label">Email</label>
          <input
            className="form-control mb-3"
            placeholder="user@company.com"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="form-label">Password</label>
          <input
            className="form-control mb-3"
            type="password"
            placeholder="********"
            value={password}
            required
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-primary" type="submit">
            Create account
          </button>

          {error ? (
            <div className="text-danger mt-3" style={{ whiteSpace: "pre-line" }}>
                {error}
            </div>
            ) : null}


                  <div className="mt-3">
                      <span>Already have an account? </span>
            <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
