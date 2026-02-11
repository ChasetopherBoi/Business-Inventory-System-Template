import { Link, NavLink } from "react-router-dom";

<NavLink
  to="/shop"
  className={({ isActive }) =>
    "nav-link" + (isActive ? "active" : "fw-200")
  }
>
  Shop
</NavLink>


export default function NavBar({ me, onLogout }) {
  const isAuthed = !!me;
  const isAdmin = me?.role === "admin";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top py-3" style={{ minHeight: 90 }}>
      <div className="container-fluid px-4">
              <Link className="navbar-brand fw-bold fs-2" to="/" style={{paddingRight: "30px"}}>
          Business Inventory
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse mt-3 mt-lg-0" id="navbarMain">
          <ul className="navbar-nav me-auto gap-lg-3">
            {isAuthed && (
              <li className="nav-item">
                <NavLink className="nav-link fs-5" to="/shop">
                  Shop
                </NavLink>
              </li>
            )}
            {isAuthed && isAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link fs-5" to="/admin">
                  Admin Panel
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex flex-column flex-lg-row gap-2 align-items-lg-center">
            {!isAuthed ? (
              <>
                <Link className="btn btn-outline-light btn-lg" to="/login">
                  Login
                </Link>
                <Link className="btn btn-warning btn-lg" to="/register">
                  Create account
                </Link>
              </>
            ) : (
              <>
                <div className="text-light small">
                  <div className="fw-semibold fs-6" style={{minWidth: 150}}>{me.email}</div>
                  <div className="opacity-75" style={{textAlign: "left"}}>{me.role}</div>
                </div>
                <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
