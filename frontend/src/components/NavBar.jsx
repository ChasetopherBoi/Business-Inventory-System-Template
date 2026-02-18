import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { CATEGORIES } from "../constants/categories.js";
import { useCart } from "../context/CartContext.jsx";
import cartIcon from "../assets/cart-icon.png";
import { useState } from "react";


export default function NavBar({ me, onLogout }) {
  const nav = useNavigate();
  const { count, clear } = useCart();
  const location = useLocation();
  const [openCat, setOpenCat] = useState(null);

  const params = new URLSearchParams(location.search);
  const category = params.get("category") || "";
  const sub = params.get("sub") || "";

  const isAdmin = me?.role === "admin";
  const isAuthed = !!me;

  function handleLogout() {
    clear();
    onLogout?.();
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-navbar sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to={isAdmin ? "/admin" : "/shop"}>
          Business Portal
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          {/* LEFT */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-2">
            {/* SHOP / CATEGORIES (non-admin) */}
            {isAuthed && !isAdmin && (
              <li className="nav-item dropdown">
                <NavLink
                  to="/shop"
                  className={({ isActive }) =>
                    `nav-link dropdown-toggle ${isActive ? "active" : ""}`
                  }
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Shop
                </NavLink>

                <ul className="dropdown-menu">
                  {CATEGORIES.map((c) =>
                    c.subs ? (
                    <li className="dropend" key={c.value}>
                      <button
                        type="button"
                        className={`dropdown-item dropdown-subtoggle main-category ${category === c.value ? "active" : ""}`}
                        aria-expanded={openCat === c.value}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenCat((prev) => (prev === c.value ? null : c.value));
                        }}
                      >
                        {c.label} <span id="dropdown-arrow-down">▾</span><span id="dropdown-arrow-right">→</span>
                      </button>
                      <ul className={`dropdown-menu dropdown-submenu ${openCat === c.value ? "show" : ""}`}>
                        {c.subs.map((s) => (
                          <li key={s}>
                            <Link
                              className={`dropdown-item sub-category ${
                                category === c.value && sub === s ? "active" : ""
                              }`}
                              to={`/shop?category=${c.value}&sub=${encodeURIComponent(s)}`}
                              onClick={() => setOpenCat(null)}
                            >
                              {s}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    ) : (
                      <li key={c.value}>
                        <Link
                          className={`dropdown-item main-category ${category === c.value ? "active" : ""}`}
                          to={`/shop?category=${c.value}`}
                        >
                          {c.label}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </li>
            )}

            {/* ADMIN LINKS */}
            {isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink to="/admin" end className="nav-link">
                    Inventory
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/admin/orders" className="nav-link">
                    Orders
                  </NavLink>
                </li>
              </>
            )}

            {/* SHOPPER LINKS */}
            {isAuthed && !isAdmin && (
              <li className="nav-item">
                <NavLink to="/orders" className="nav-link">
                  Orders
                </NavLink>
              </li>
            )}
          </ul>

          {/* RIGHT */}
          <div className="d-flex align-items-lg-center gap-2">
            {isAuthed && !isAdmin && (
              <button id="cart-button" className="btn btn-outline-light btn-sm" onClick={() => nav("/cart")}>
                <img src={cartIcon} alt="" className="cart-icon" />
                <span>
                  Cart{count > 0 ? ` (${count})` : ""}
                </span>
              </button>
            )}

            {isAuthed ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light btn-sm dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {me?.full_name || "Account"}
                </button>
                <ul className="dropdown-menu dropdown-menu-end" id="account-dropdown">
                  <li>
                    <span className="dropdown-item-text">
                      <div className="fw-semibold" style={{color: "white"}}>{me?.full_name}</div>
                      <div className="small opacity-75" style={{color: "white"}}>{me?.role}</div>
                    </span>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button id="logout-button" className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <NavLink className="btn btn-outline-light btn-sm" to="/login">
                  Login
                </NavLink>
                <NavLink className="btn btn-light btn-sm" to="/register">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
