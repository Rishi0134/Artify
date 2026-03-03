import { useEffect, useState } from "react";
import { api, getImageUrl, withAuth } from "../utils/api";
import "./ArtistDashboard.css";

const FALLBACK_ARTWORK_IMAGE = "https://via.placeholder.com/600x600?text=Artwork";

const ArtistDashboard = () => {
  const [artworks, setArtworks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });
  const [image, setImage] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [artworksRes, ordersRes] = await Promise.all([
        api.get("/api/artworks/my", withAuth()),
        api.get("/api/orders/artist-orders", withAuth()),
      ]);

      setArtworks(artworksRes.data?.data || []);
      setOrders(ordersRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load artist data");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateArtwork = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Artwork name is required");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setError("Valid price is required");
      return;
    }
    if (!image) {
      setError("Artwork image is required");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("description", formData.description.trim());
      payload.append("price", formData.price);
      payload.append("category", formData.category.trim());
      payload.append("image", image);

      await api.post("/api/artworks", payload, withAuth());
      setFormData({ title: "", description: "", price: "", category: "" });
      setImage(null);
      await fetchDashboardData();
    } catch (err) {
      const validationMessage = err.response?.data?.errors?.[0]?.msg;
      setError(validationMessage || err.response?.data?.message || "Failed to upload artwork");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArtwork = async (id) => {
    try {
      await api.delete(`/api/artworks/${id}`, withAuth());
      setArtworks((prev) => prev.filter((art) => art._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete artwork");
    }
  };

  const handleOrderStatus = async (id, status) => {
    try {
      const res = await api.put(`/api/orders/${id}`, { status }, withAuth());
      const updated = res.data?.data;
      setOrders((prev) =>
        prev.map((order) => (order._id === id ? { ...order, status: updated.status } : order))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status");
    }
  };

  return (
    <section className="artist-dashboard">
      <h1>Artist Dashboard</h1>
      <p className="artist-dashboard-subtitle">Manage your paintings, orders, and customer requests.</p>

      {error ? <p className="artist-error">{error}</p> : null}

      <div className="artist-grid">
        <div className="artist-card">
          <h2>Upload Painting</h2>
          <form className="artist-form" onSubmit={handleCreateArtwork}>
            <input
              type="text"
              placeholder="Painting Name"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <input
              type="number"
              min="1"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} required />
            <button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Upload Painting"}
            </button>
          </form>
        </div>

        <div className="artist-card">
          <h2>My Paintings</h2>
          <div className="artist-list">
            {artworks.length === 0 ? <p>No paintings uploaded yet.</p> : null}
            {artworks.map((art) => (
              <article key={art._id} className="artist-item">
                <img
                  src={getImageUrl(art.image) || FALLBACK_ARTWORK_IMAGE}
                  alt={art.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_ARTWORK_IMAGE;
                  }}
                />
                <div>
                  <h3>{art.title}</h3>
                  <p>{art.description || "No description"}</p>
                  <p>Price: Rs. {art.price}</p>
                </div>
                <button type="button" onClick={() => handleDeleteArtwork(art._id)}>
                  Delete
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="artist-card">
        <h2>Orders Received</h2>
        <div className="artist-list">
          {orders.length === 0 ? <p>No orders yet.</p> : null}
          {orders.map((order) => (
            <article key={order._id} className="artist-item order-item">
              <div>
                <h3>{order.artwork?.title || "Artwork"}</h3>
                <p>Customer: {order.customer?.name}</p>
                <p>Email: {order.customer?.email}</p>
                <p>Price: Rs. {order.price}</p>
                <p>Status: {order.status}</p>
              </div>
              <select
                value={order.status}
                onChange={(e) => handleOrderStatus(order._id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArtistDashboard;
