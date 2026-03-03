import { useEffect, useState } from "react";
import { adminApi } from "../services/adminApi";
import Pagination from "../components/Pagination";
import "./Orders.css";

const Orders = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminApi.orders({
        page,
        limit: 10,
        search,
        status,
        paymentStatus,
      });
      setOrders(response.data || []);
      setMeta(response.meta || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, search, status, paymentStatus]);

  const updateStatus = async (id, status) => {
    try {
      await adminApi.updateOrderStatus(id, status);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status");
    }
  };

  const refund = async (id) => {
    try {
      const reason = prompt("Refund reason") || "Refund issued by admin";
      await adminApi.refundOrder(id, reason);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to refund order");
    }
  };

  const viewDetails = async (id) => {
    try {
      const response = await adminApi.orderDetails(id);
      setSelectedOrder(response.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load order details");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <section className="admin-page">
      <h2>Orders Management</h2>
      <form className="admin-filter" onSubmit={handleSearch}>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by customer or artwork"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
        >
          <option value="">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button type="submit">Search</button>
      </form>

      {loading && <p className="admin-loading">Loading orders...</p>}
      {error && <p className="admin-error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Artwork</th>
                  <th>Customer</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.artwork?.title || "N/A"}</td>
                    <td>{order.customer?.name || "N/A"}</td>
                    <td>Rs. {order.price}</td>
                    <td>{order.status}</td>
                    <td>{order.paymentStatus}</td>
                    <td className="admin-actions">
                      <button onClick={() => viewDetails(order._id)}>Details</button>
                      <button onClick={() => updateStatus(order._id, "accepted")}>Accept</button>
                      <button onClick={() => updateStatus(order._id, "completed")}>Complete</button>
                      <button className="danger" onClick={() => refund(order._id)}>
                        Refund
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

      {selectedOrder && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Order Details</h3>
            <p>
              <strong>Artwork:</strong> {selectedOrder.artwork?.title || "N/A"}
            </p>
            <p>
              <strong>Customer:</strong> {selectedOrder.customer?.name || "N/A"}
            </p>
            <p>
              <strong>Customer Email:</strong> {selectedOrder.customer?.email || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {selectedOrder.status}
            </p>
            <p>
              <strong>Payment:</strong> {selectedOrder.paymentStatus}
            </p>
            <p>
              <strong>Price:</strong> Rs. {selectedOrder.price}
            </p>
            <button onClick={() => setSelectedOrder(null)}>Close</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Orders;
