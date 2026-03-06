import { api, withAuth } from "./api";

const unwrap = (response) => response.data;

export const shopApi = {
  artworkDetails: (id) => api.get(`/api/artworks/${id}`).then(unwrap),

  getCart: () => api.get("/api/orders/cart", withAuth()).then(unwrap),
  addToCart: (artworkId, quantity = 1) =>
    api.post("/api/orders/cart/add", { artworkId, quantity }, withAuth()).then(unwrap),
  updateCartItem: (artworkId, quantity) =>
    api.put(`/api/orders/cart/item/${artworkId}`, { quantity }, withAuth()).then(unwrap),
  removeCartItem: (artworkId) =>
    api.delete(`/api/orders/cart/item/${artworkId}`, withAuth()).then(unwrap),
  clearCart: () => api.delete("/api/orders/cart/clear", withAuth()).then(unwrap),

  createCheckout: (payload) => api.post("/api/orders/checkout/create", payload, withAuth()).then(unwrap),
  verifyCheckout: (payload) => api.post("/api/orders/checkout/verify", payload, withAuth()).then(unwrap),

  myOrders: () => api.get("/api/orders/my-orders", withAuth()).then(unwrap),
  trackOrder: (id) => api.get(`/api/orders/my-orders/${id}/tracking`, withAuth()).then(unwrap),
  cancelOrder: (id) => api.put(`/api/orders/cancel/${id}`, {}, withAuth()).then(unwrap),
};
