import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/artists", label: "Artist Requests" },
  { to: "/admin/artworks", label: "Artworks" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/reports", label: "Reports" },
];

const Sidebar = () => (
  <aside className="admin-sidebar">
    <h2 className="admin-sidebar-title">Artify Admin</h2>
    <nav className="admin-nav">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
