import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearStoredAuth, getStoredUser } from "../utils/auth";
import "./ArtistLayout.css";

const ArtistLayout = () => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearStoredAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="artist-shell">
      <aside className="artist-sidebar">
        <h2 className="artist-brand">Artify Studio</h2>
        <p className="artist-subtitle">{user?.name || "Artist"}</p>
        <nav className="artist-nav">
          <NavLink to="/artist/dashboard">Dashboard</NavLink>
          <NavLink to="/artist/chat">Chats</NavLink>
        </nav>
        <button type="button" className="artist-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className="artist-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ArtistLayout;
