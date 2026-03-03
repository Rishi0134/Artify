import { useEffect, useState } from "react";
import { adminApi } from "../services/adminApi";
import Pagination from "../components/Pagination";
import "./Artists.css";

const Artists = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminApi.artistRequests({
        page,
        limit: 10,
        search,
        status,
      });
      setRequests(response.data || []);
      setMeta(response.meta || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load artist requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [page, search, status]);

  const approve = async (id) => {
    try {
      await adminApi.approveArtistRequest(id);
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve request");
    }
  };

  const reject = async (id) => {
    try {
      const reason = prompt("Rejection reason:") || "Rejected by admin";
      await adminApi.rejectArtistRequest(id, reason);
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject request");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <section className="admin-page">
      <h2>Artist Approval Requests</h2>
      <form className="admin-filter" onSubmit={handleSearch}>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search user name or email"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit">Search</button>
      </form>

      {loading && <p className="admin-loading">Loading requests...</p>}
      {error && <p className="admin-error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Portfolio</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.user?.name || "N/A"}</td>
                    <td>{request.user?.email || "N/A"}</td>
                    <td>
                      {request.portfolioUrl ? (
                        <a href={request.portfolioUrl} target="_blank" rel="noreferrer">
                          View Portfolio
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>{request.status}</td>
                    <td className="admin-actions">
                      <button onClick={() => approve(request._id)}>Approve</button>
                      <button className="danger" onClick={() => reject(request._id)}>
                        Reject
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

export default Artists;
