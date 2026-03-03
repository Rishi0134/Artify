import { useEffect, useState } from "react";
import { adminApi } from "../services/adminApi";
import Pagination from "../components/Pagination";
import "./Artworks.css";

const Artworks = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [artworks, setArtworks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  const loadArtworks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminApi.artworks({
        page,
        limit: 10,
        search,
        status,
        category,
      });
      setArtworks(response.data || []);
      setMeta(response.meta || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load artworks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtworks();
  }, [page, search, status, category]);

  const updateStatus = async (id, status) => {
    try {
      const reason =
        status === "rejected" ? prompt("Reason for rejection") || "Rejected" : "";
      await adminApi.updateArtworkStatus(id, status, reason);
      await loadArtworks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update artwork status");
    }
  };

  const removeArtwork = async (id) => {
    try {
      await adminApi.deleteArtwork(id);
      await loadArtworks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete artwork");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <section className="admin-page">
      <h2>Artworks Management</h2>

      <form className="admin-filter" onSubmit={handleSearch}>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search artwork title or description"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Filter by category"
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p className="admin-loading">Loading artworks...</p>}
      {error && <p className="admin-error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {artworks.map((artwork) => (
                  <tr key={artwork._id}>
                    <td>{artwork.title}</td>
                    <td>{artwork.artist?.name || "N/A"}</td>
                    <td>{artwork.category || artwork.categoryRef?.name || "General"}</td>
                    <td>{artwork.status}</td>
                    <td className="admin-actions">
                      <button onClick={() => updateStatus(artwork._id, "approved")}>Approve</button>
                      <button onClick={() => updateStatus(artwork._id, "rejected")}>Reject</button>
                      <button className="danger" onClick={() => removeArtwork(artwork._id)}>
                        Delete
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
    </section>
  );
};

export default Artworks;
