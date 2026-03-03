import { Outlet, useNavigate } from "react-router-dom";
import { clearStoredAuth, getStoredUser } from "../../utils/auth";
import Sidebar from "../components/Sidebar";
import "./AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const logout = () => {
    clearStoredAuth();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Admin Portal</h1>
            <p>Manage platform operations from one panel.</p>
          </div>
          <div className="admin-header-right">
            <span>{user?.name || "Admin"}</span>
            <button onClick={logout}>Logout</button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
