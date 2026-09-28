import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="wordmark">
          Dispatch
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          {isAuthenticated && (
            <Link to="/new" className="btn btn-primary btn-sm">
              New post
            </Link>
          )}
          {isAuthenticated ? (
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
