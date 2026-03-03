import { useEffect, useState } from "react";
import { adminApi } from "../services/adminApi";
import Pagination from "../components/Pagination";
import "./Users.css";

const Users = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fixedAdmins, setFixedAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const [fixedAdminsResponse, usersResponse] = await Promise.all([
        adminApi.fixedAdmins(),
        adminApi.users({
          page,
          limit: 10,
          search,
          role,
          status,
        }),
      ]);
      setFixedAdmins(fixedAdminsResponse.data || []);
      setUsers(usersResponse.data || []);
      setMeta(usersResponse.meta || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, search, role, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleRole = async (id, role) => {
    try {
      await adminApi.changeUserRole(id, role);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user role");
    }
  };

  const handleBlockToggle = async (user) => {
    try {
      if (user.isBlocked) {
        await adminApi.unblockUser(user._id);
      } else {
        await adminApi.blockUser(user._id);
      }
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user status");
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteUser(id);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to soft delete user");
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await adminApi.userDetails(id);
      setSelectedUser(response.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load user details");
    }
  };

  return (
    <section className="admin-page">
      <h2>Users Management</h2>
      <p className="admin-note">
        System admins are protected and cannot be changed, blocked, or deleted.
      </p>

      <form className="admin-filter" onSubmit={handleSearch}>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or email"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="artist">Artist</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="deleted">Deleted</option>
        </select>
        <button type="submit">Search</button>
      </form>

      {loading && <p className="admin-loading">Loading users...</p>}
      {error && <p className="admin-error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="admin-table-wrap">
            <h3>Protected Admin Accounts</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fixedAdmins.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>Admin</td>
                    <td>Active</td>
                    <td className="admin-actions">
                      <button onClick={() => handleViewDetails(user._id)}>Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-table-wrap">
            <h3>Registered Users</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role === "customer" ? "user" : user.role}
                        onChange={(e) => handleRole(user._id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="artist">Artist</option>
                      </select>
                    </td>
                    <td>{user.isBlocked ? "Blocked" : "Active"}</td>
                    <td className="admin-actions">
                      <button onClick={() => handleViewDetails(user._id)}>Details</button>
                      <button onClick={() => handleBlockToggle(user)}>
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                      <button className="danger" onClick={() => handleDelete(user._id)}>
                        Soft Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}

      {selectedUser && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>User Details</h3>
            <p>
              <strong>Name:</strong> {selectedUser.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Role:</strong> {selectedUser.role}
            </p>
            <p>
              <strong>Blocked:</strong> {selectedUser.isBlocked ? "Yes" : "No"}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(selectedUser.createdAt).toLocaleString()}
            </p>
            <button onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Users;
