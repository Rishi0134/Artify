import { useEffect, useState } from "react";
import { api, withAuth } from "../../utils/api";
import { adminApi } from "../services/adminApi";
import "./Reports.css";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [topArtwork, setTopArtwork] = useState([]);
  const [topArtists, setTopArtists] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const [rev, growth, artwork, artists] = await Promise.all([
          adminApi.monthlyRevenue(),
          adminApi.userGrowth(),
          adminApi.topSellingArtwork(),
          adminApi.topArtists(),
        ]);

        setMonthlyRevenue(rev.data || []);
        setUserGrowth(growth.data || []);
        setTopArtwork(artwork.data || []);
        setTopArtists(artists.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const exportUsersCsv = async () => {
    const response = await api.get("/api/admin/export/users.csv", {
      ...withAuth(),
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users-report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) return <p className="admin-loading">Loading reports...</p>;
  if (error) return <p className="admin-error">{error}</p>;

  return (
    <section className="admin-page">
      <div className="reports-head">
        <h2>Analytics Reports</h2>
        <button onClick={exportUsersCsv}>Export Users CSV</button>
      </div>

      <div className="reports-grid">
        <article className="report-card">
          <h3>Monthly Revenue</h3>
          <ul>
            {monthlyRevenue.map((item, idx) => (
              <li key={idx}>Y{item._id.year}-M{item._id.month}: Rs. {item.revenue}</li>
            ))}
          </ul>
        </article>

        <article className="report-card">
          <h3>User Growth</h3>
          <ul>
            {userGrowth.map((item, idx) => (
              <li key={idx}>Y{item._id.year}-M{item._id.month}: {item.newUsers} users</li>
            ))}
          </ul>
        </article>

        <article className="report-card">
          <h3>Top Selling Artworks</h3>
          <ul>
            {topArtwork.map((item, idx) => (
              <li key={idx}>{item.title || "Unknown"}: {item.totalSales} sales</li>
            ))}
          </ul>
        </article>

        <article className="report-card">
          <h3>Top Artists</h3>
          <ul>
            {topArtists.map((item, idx) => (
              <li key={idx}>{item.name || "Unknown"}: Rs. {item.revenue}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
};

export default Reports;
