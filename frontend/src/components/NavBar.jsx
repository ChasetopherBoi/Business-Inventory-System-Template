import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { CATEGORIES } from "../constants/categories.js";
import { useCart } from "../context/CartContext.jsx";

export default function NavBar({ me, onLogout }) {
  const nav = useNavigate();
  const { count, clear } = useCart();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const category = params.get("category") || "";
  const sub = params.get("sub") || "";
  const onShop = location.pathname === "/shop";

  // treat anything not admin as "shopper" for UI purposes
  const isAdmin = me?.role === "admin";
  const showShopperLinks = !!me && !isAdmin;
  const isAuthed = !!me;
  const showShopperCart = isAuthed && !isAdmin;

  function handleLogout() {
    // Clear this user's cart data + UI state
    clear();
    onLogout?.();
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Business Portal
        </Link>

        <div className="collapse navbar-collapse show">
          {/* LEFT */}
          <ul className="navbar-nav me-auto align-items-center">
            {isAuthed && (
              <li className="nav-item dropdown">
                <NavLink to="/shop" end className="nav-link dropdown-toggle">
                  Shop
                </NavLink>

                <ul className="dropdown-menu">
                  {CATEGORIES.map((c) =>
                    c.subs ? (
                      <li className="dropend" key={c.value}>
                        <Link
                          className={`dropdown-item ${
                            onShop && category === c.value && !sub ? "active" : ""
                          }`}
                          to={`/shop?category=${c.value}`}
                        >
                          {c.label}
                        </Link>

                        <ul className="dropdown-menu">
                          {c.subs.map((s) => (
                            <li key={s}>
                              <Link
                                className={`dropdown-item ${
                                  onShop && category === c.value && sub === s ? "active" : ""
                                }`}
                                to={`/shop?category=${c.value}&sub=${s}`}
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
                          className={`dropdown-item ${
                            onShop && category === c.value && !sub ? "active" : ""
                          }`}
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

            {isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin" end>
                    Inventory
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/orders" end>
                    Orders
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* RIGHT */}
          {showShopperLinks && (
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => nav("/orders")}
            >
              Orders
            </button>
          )}
          <div className="d-flex align-items-center gap-3">
            {showShopperCart && (
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => nav("/cart")}
              >
                Cart{count > 0 ? ` (${count})` : ""}
              </button>
            )}

            {isAuthed && (
              <div className="text-end text-light small">
                <div>{me.full_name}</div>
                <div className="text-secondary">{me.role}</div>
              </div>
            )}

            {isAuthed ? (
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary btn-sm" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
