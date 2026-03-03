import { api, withAuth } from "../../utils/api";

const unwrap = (response) => response.data;

export const adminApi = {
  dashboard: () => api.get("/api/admin/dashboard", withAuth()).then(unwrap),

  users: (params) => api.get("/api/admin/users", { ...withAuth(), params }).then(unwrap),
  fixedAdmins: () => api.get("/api/admin/users/fixed-admins", withAuth()).then(unwrap),
  userDetails: (id) => api.get(`/api/admin/users/${id}`, withAuth()).then(unwrap),
  blockUser: (id) => api.patch(`/api/admin/users/${id}/block`, {}, withAuth()).then(unwrap),
  unblockUser: (id) => api.patch(`/api/admin/users/${id}/unblock`, {}, withAuth()).then(unwrap),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`, withAuth()).then(unwrap),
  changeUserRole: (id, role) =>
    api.patch(`/api/admin/users/${id}/role`, { role }, withAuth()).then(unwrap),

  artistRequests: (params) =>
    api.get("/api/admin/artist-requests", { ...withAuth(), params }).then(unwrap),
  approveArtistRequest: (id) =>
    api.patch(`/api/admin/artist-requests/${id}/approve`, {}, withAuth()).then(unwrap),
  rejectArtistRequest: (id, reason) =>
    api.patch(`/api/admin/artist-requests/${id}/reject`, { reason }, withAuth()).then(unwrap),

  artworks: (params) => api.get("/api/admin/artworks", { ...withAuth(), params }).then(unwrap),
  updateArtworkStatus: (id, status, reason = "") =>
    api.patch(`/api/admin/artworks/${id}/status`, { status, reason }, withAuth()).then(unwrap),
  deleteArtwork: (id) => api.delete(`/api/admin/artworks/${id}`, withAuth()).then(unwrap),

  orders: (params) => api.get("/api/admin/orders", { ...withAuth(), params }).then(unwrap),
  orderDetails: (id) => api.get(`/api/admin/orders/${id}`, withAuth()).then(unwrap),
  updateOrderStatus: (id, status) =>
    api.patch(`/api/admin/orders/${id}/status`, { status }, withAuth()).then(unwrap),
  refundOrder: (id, reason) =>
    api.patch(`/api/admin/orders/${id}/refund`, { reason }, withAuth()).then(unwrap),

  categories: () => api.get("/api/admin/categories", withAuth()).then(unwrap),
  createCategory: (payload) => api.post("/api/admin/categories", payload, withAuth()).then(unwrap),
  updateCategory: (id, payload) =>
    api.patch(`/api/admin/categories/${id}`, payload, withAuth()).then(unwrap),
  deleteCategory: (id) => api.delete(`/api/admin/categories/${id}`, withAuth()).then(unwrap),

  monthlyRevenue: () => api.get("/api/admin/analytics/monthly-revenue", withAuth()).then(unwrap),
  userGrowth: () => api.get("/api/admin/analytics/user-growth", withAuth()).then(unwrap),
  topSellingArtwork: () =>
    api.get("/api/admin/analytics/top-selling-artwork", withAuth()).then(unwrap),
  topArtists: () => api.get("/api/admin/analytics/top-artists", withAuth()).then(unwrap),

  recentActivities: () => api.get("/api/admin/activities/recent", withAuth()).then(unwrap),
};
