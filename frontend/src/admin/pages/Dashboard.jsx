import { useEffect, useState } from "react";
import { adminApi } from "../services/adminApi";
import "./Dashboard.css";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await adminApi.dashboard();
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="admin-loading">Loading dashboard...</p>;
  if (error) return <p className="admin-error">{error}</p>;

  const totals = data?.totals || {};

  return (
    <section className="dashboard-page">
      <div className="dashboard-grid">
        <article className="dashboard-card"><h3>Total Users</h3><p>{totals.totalUsers || 0}</p></article>
        <article className="dashboard-card"><h3>Total Artists</h3><p>{totals.totalArtists || 0}</p></article>
        <article className="dashboard-card"><h3>Total Artworks</h3><p>{totals.totalArtworks || 0}</p></article>
        <article className="dashboard-card"><h3>Total Orders</h3><p>{totals.totalOrders || 0}</p></article>
        <article className="dashboard-card"><h3>Total Revenue</h3><p>Rs. {totals.totalRevenue || 0}</p></article>
        <article className="dashboard-card"><h3>Pending Artist Requests</h3><p>{totals.pendingArtistRequests || 0}</p></article>
      </div>

      <div className="activity-panel">
        <h2>Recent Activity</h2>
        {data?.recentActivity?.length ? (
          <ul>
            {data.recentActivity.map((activity) => (
              <li key={activity._id}>
                <strong>{activity.action}</strong>
                <span>{new Date(activity.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent activity found.</p>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
