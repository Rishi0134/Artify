import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";
import { clearStoredAuth, getStoredUser } from "../utils/auth";
import { shopApi } from "../utils/shopApi";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setUser(getStoredUser());
  }, [location.pathname]);

  useEffect(() => {
    const loadCartCount = async () => {
      const currentUser = getStoredUser();
      if (!currentUser || !["user", "customer"].includes(currentUser.role)) {
        setCartCount(0);
        return;
      }

      try {
        const response = await shopApi.getCart();
        const items = response?.data?.items || [];
        const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    loadCartCount();
  }, [location.pathname]);

  const handleLogout = () => {
    clearStoredAuth();
    setUser(null);
    navigate("/", { replace: true });
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="logo">
        <NavLink to="/">Artify</NavLink>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/gallery" className={({ isActive }) => isActive ? "active" : ""}>
            Gallery
          </NavLink>
        </li>
        <li>
          <NavLink to="/artists" className={({ isActive }) => isActive ? "active" : ""}>
            Artists
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => isActive ? "active" : ""}>
            About
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""}>
            Contact
          </NavLink>
        </li>
        {user && ["user", "customer"].includes(user.role) ? (
          <>
            <li>
              <NavLink to="/cart" className={({ isActive }) => isActive ? "active" : ""}>
                Cart ({cartCount})
              </NavLink>
            </li>
            <li>
              <NavLink to="/my-orders" className={({ isActive }) => isActive ? "active" : ""}>
                My Orders
              </NavLink>
            </li>
          </>
        ) : null}
        {!user ? (
          <li>
            <NavLink to="/login" className="login-btn">Login</NavLink>
          </li>
        ) : (
          <li>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
