import { useEffect, useState } from "react";
import { getImageUrl } from "../utils/api";
import { shopApi } from "../utils/shopApi";
import "./Shop.css";

const FALLBACK_ARTWORK_IMAGE = "https://via.placeholder.com/80x80?text=Art";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [tracking, setTracking] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await shopApi.myOrders();
      setOrders(response.data || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadTracking = async (orderId) => {
    try {
      const response = await shopApi.trackOrder(orderId);
      setTracking((prev) => ({ ...prev, [orderId]: response.data || null }));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load tracking");
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await shopApi.cancelOrder(orderId);
      await loadOrders();
      await loadTracking(orderId);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to cancel order");
    }
  };

  return (
    <section className="shop-page">
      <h1>My Orders</h1>
      {loading && <p>Loading orders...</p>}
      {error && <p className="shop-error">{error}</p>}

      {!loading && orders.length === 0 && <p>No orders found.</p>}

      {!loading && orders.length > 0 && (
        <div className="shop-list">
          {orders.map((order) => (
            <article className="order-card" key={order._id}>
              <div className="order-head">
                <div>
                  <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                  <p>Status: {order.status}</p>
                  <p>Payment: {order.paymentStatus}</p>
                  <p>Total: Rs. {order.price}</p>
                </div>
                <div className="shop-actions">
                  <button type="button" onClick={() => loadTracking(order._id)}>
                    Track Order
                  </button>
                  {["pending", "accepted"].includes(order.status) && (
                    <button type="button" onClick={() => cancelOrder(order._id)}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="order-items">
                {(order.items || []).map((item, index) => (
                  <div className="order-item" key={`${order._id}_${index}`}>
                    <img
                      src={getImageUrl(item.imageSnapshot || item.artwork?.image) || FALLBACK_ARTWORK_IMAGE}
                      alt={item.titleSnapshot || item.artwork?.title || "Artwork"}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_ARTWORK_IMAGE;
                      }}
                    />
                    <div>
                      <p>{item.titleSnapshot || item.artwork?.title || "Artwork"}</p>
                      <p>
                        Rs. {item.price} x {item.quantity} = Rs. {item.subtotal}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {tracking[order._id]?.trackingTimeline?.length > 0 && (
                <div className="tracking-box">
                  <h4>Tracking Timeline</h4>
                  {tracking[order._id].trackingTimeline.map((entry, index) => (
                    <p key={`${order._id}_track_${index}`}>
                      {new Date(entry.at).toLocaleString()} - {entry.status} - {entry.note}
                    </p>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyOrders;
