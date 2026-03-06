const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");
const { logActivity } = require("../utils/activityLogger");

const User = require("../models/User");
const Artwork = require("../models/Artwork");
const Order = require("../models/Order");
const Category = require("../models/Category");
const ArtistRequest = require("../models/ArtistRequest");
const ActivityLog = require("../models/ActivityLog");
const { isFixedAdminEmail, FIXED_ADMIN_EMAILS } = require("../config/adminAccounts");

const FIXED_ADMIN_EMAIL_LIST = Array.from(FIXED_ADMIN_EMAILS);
const TRACKING_ALLOWED_STATUS = [
  "pending",
  "accepted",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "completed",
  "rejected",
  "cancelled",
];

const normalizeUserRole = (role = "") => (role === "customer" ? "user" : role);
const firstOrderArtworkTitle = (order) =>
  order?.items?.[0]?.titleSnapshot || order?.artwork?.title || "";

const buildSearchFilter = (search, fields = []) => {
  if (!search) return {};

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: search.trim(), $options: "i" },
    })),
  };
};

const dashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalArtists,
    totalArtworks,
    totalOrders,
    totalRevenueResult,
    pendingArtistRequests,
    recentActivity,
  ] = await Promise.all([
    User.countDocuments({ isDeleted: false, role: { $in: ["user", "customer"] } }),
    User.countDocuments({ isDeleted: false, role: "artist" }),
    Artwork.countDocuments({ isDeleted: false }),
    Order.countDocuments({ isDeleted: false }),
    Order.aggregate([
      {
        $match: {
          isDeleted: false,
          paymentStatus: { $in: ["paid"] },
          status: { $in: ["accepted", "completed"] },
        },
      },
      { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
    ]),
    ArtistRequest.countDocuments({ status: "pending" }),
    ActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("actor", "name email role"),
  ]);

  return sendResponse(res, {
    message: "Dashboard data fetched",
    data: {
      totals: {
        totalUsers,
        totalArtists,
        totalArtworks,
        totalOrders,
        totalRevenue: totalRevenueResult[0]?.totalRevenue || 0,
        pendingArtistRequests,
      },
      recentActivity,
    },
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search = "", role = "", status = "active" } = req.query;

  const query = {
    ...buildSearchFilter(search, ["name", "email"]),
    email: { $nin: FIXED_ADMIN_EMAIL_LIST },
  };

  if (role) {
    query.role = role;
  }

  if (status === "deleted") {
    query.isDeleted = true;
  } else if (status === "blocked") {
    query.isDeleted = false;
    query.isBlocked = true;
  } else {
    query.isDeleted = false;
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  return sendResponse(res, {
    message: "Users fetched",
    data: users,
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

const listFixedAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({
    email: { $in: FIXED_ADMIN_EMAIL_LIST },
  })
    .select("-password")
    .sort({ name: 1 });

  return sendResponse(res, {
    message: "Fixed admins fetched",
    data: admins,
  });
});

const getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  return sendResponse(res, {
    message: "User details fetched",
    data: user,
  });
});

const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.isDeleted) {
    res.status(404);
    throw new Error("User not found");
  }
  if (isFixedAdminEmail(user.email)) {
    res.status(403);
    throw new Error("Fixed admin accounts cannot be blocked");
  }

  user.isBlocked = true;
  await user.save();

  await logActivity({
    actor: req.user._id,
    action: "USER_BLOCKED",
    entityType: "User",
    entityId: user._id,
    metadata: { email: user.email },
  });

  return sendResponse(res, {
    message: "User blocked successfully",
    data: { id: user._id, isBlocked: user.isBlocked },
  });
});

const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.isDeleted) {
    res.status(404);
    throw new Error("User not found");
  }
  if (isFixedAdminEmail(user.email)) {
    res.status(403);
    throw new Error("Fixed admin accounts cannot be unblocked");
  }

  user.isBlocked = false;
  await user.save();

  await logActivity({
    actor: req.user._id,
    action: "USER_UNBLOCKED",
    entityType: "User",
    entityId: user._id,
    metadata: { email: user.email },
  });

  return sendResponse(res, {
    message: "User unblocked successfully",
    data: { id: user._id, isBlocked: user.isBlocked },
  });
});

const softDeleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (isFixedAdminEmail(user.email)) {
    res.status(403);
    throw new Error("Fixed admin accounts cannot be deleted");
  }

  if (String(user._id) === String(req.user._id)) {
    res.status(400);
    throw new Error("Admin cannot delete own account");
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  user.deletedBy = req.user._id;
  await user.save();

  await logActivity({
    actor: req.user._id,
    action: "USER_SOFT_DELETED",
    entityType: "User",
    entityId: user._id,
    metadata: { email: user.email },
  });

  return sendResponse(res, {
    message: "User soft deleted successfully",
    data: { id: user._id, isDeleted: true },
  });
});

const changeUserRole = asyncHandler(async (req, res) => {
  const allowedRoles = ["user", "artist"];
  const role = normalizeUserRole(req.body.role || "");

  if (!allowedRoles.includes(role)) {
    res.status(400);
    throw new Error("Invalid role. Allowed: user, artist");
  }

  const user = await User.findById(req.params.id);

  if (!user || user.isDeleted) {
    res.status(404);
    throw new Error("User not found");
  }
  if (isFixedAdminEmail(user.email)) {
    res.status(403);
    throw new Error("Fixed admin account role cannot be changed");
  }
  user.role = role;
  await user.save();

  await logActivity({
    actor: req.user._id,
    action: "USER_ROLE_CHANGED",
    entityType: "User",
    entityId: user._id,
    metadata: { role },
  });

  return sendResponse(res, {
    message: "User role updated",
    data: { id: user._id, role: user.role },
  });
});

const listArtistRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status = "", search = "" } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  const pipeline = [
    { $match: query },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $match: {
        ...(search
          ? {
              $or: [
                { "user.name": { $regex: search, $options: "i" } },
                { "user.email": { $regex: search, $options: "i" } },
              ],
            }
          : {}),
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "total" }],
      },
    },
  ];

  const [result] = await ArtistRequest.aggregate(pipeline);
  const total = result.totalCount[0]?.total || 0;

  return sendResponse(res, {
    message: "Artist requests fetched",
    data: result.data,
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

const approveArtistRequest = asyncHandler(async (req, res) => {
  const request = await ArtistRequest.findById(req.params.id).populate("user");

  if (!request) {
    res.status(404);
    throw new Error("Artist request not found");
  }

  request.status = "approved";
  request.rejectionReason = "";
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  if (request.user) {
    request.user.role = "artist";
    await request.user.save();
  }

  await logActivity({
    actor: req.user._id,
    action: "ARTIST_REQUEST_APPROVED",
    entityType: "ArtistRequest",
    entityId: request._id,
    metadata: { userId: request.user?._id },
  });

  return sendResponse(res, {
    message: "Artist request approved",
    data: request,
  });
});

const rejectArtistRequest = asyncHandler(async (req, res) => {
  const { reason = "Rejected by admin" } = req.body;
  const request = await ArtistRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error("Artist request not found");
  }

  request.status = "rejected";
  request.rejectionReason = reason;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  await logActivity({
    actor: req.user._id,
    action: "ARTIST_REQUEST_REJECTED",
    entityType: "ArtistRequest",
    entityId: request._id,
    metadata: { reason },
  });

  return sendResponse(res, {
    message: "Artist request rejected",
    data: request,
  });
});

const listArtworks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search = "", category = "", status = "" } = req.query;

  const query = {
    isDeleted: false,
    ...buildSearchFilter(search, ["title", "description"]),
  };

  if (category) {
    query.category = category;
  }

  if (status) {
    query.status = status;
  }

  const [artworks, total] = await Promise.all([
    Artwork.find(query)
      .populate("artist", "name email")
      .populate("categoryRef", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Artwork.countDocuments(query),
  ]);

  return sendResponse(res, {
    message: "Artworks fetched",
    data: artworks,
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

const updateArtworkStatus = asyncHandler(async (req, res) => {
  const { status, reason = "" } = req.body;

  if (!["approved", "rejected", "pending"].includes(status)) {
    res.status(400);
    throw new Error("Invalid artwork status");
  }

  const artwork = await Artwork.findById(req.params.id);

  if (!artwork || artwork.isDeleted) {
    res.status(404);
    throw new Error("Artwork not found");
  }

  artwork.status = status;
  artwork.moderationReason = reason;
  artwork.moderatedBy = req.user._id;
  artwork.moderatedAt = new Date();

  await artwork.save();

  await logActivity({
    actor: req.user._id,
    action: "ARTWORK_STATUS_UPDATED",
    entityType: "Artwork",
    entityId: artwork._id,
    metadata: { status, reason },
  });

  return sendResponse(res, {
    message: "Artwork status updated",
    data: artwork,
  });
});

const deleteArtwork = asyncHandler(async (req, res) => {
  const artwork = await Artwork.findById(req.params.id);

  if (!artwork || artwork.isDeleted) {
    res.status(404);
    throw new Error("Artwork not found");
  }

  artwork.isDeleted = true;
  artwork.deletedAt = new Date();
  await artwork.save();

  await logActivity({
    actor: req.user._id,
    action: "ARTWORK_DELETED",
    entityType: "Artwork",
    entityId: artwork._id,
    metadata: { title: artwork.title },
  });

  return sendResponse(res, {
    message: "Artwork deleted",
    data: { id: artwork._id, isDeleted: artwork.isDeleted },
  });
});

const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status = "", paymentStatus = "", search = "" } = req.query;

  const query = { isDeleted: false };

  if (status) {
    query.status = status;
  }

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  const orders = await Order.find(query)
    .populate("customer", "name email")
    .populate({ path: "items.artwork", select: "title artist image" })
    .sort({ createdAt: -1 });

  const filteredOrders = orders.filter((order) => {
    if (!search) return true;

    const term = search.toLowerCase();
    const customerName = order.customer?.name?.toLowerCase() || "";
    const customerEmail = order.customer?.email?.toLowerCase() || "";
    const artworkTitle = firstOrderArtworkTitle(order).toLowerCase();

    return (
      customerName.includes(term) ||
      customerEmail.includes(term) ||
      artworkTitle.includes(term)
    );
  });

  const paginated = filteredOrders.slice(skip, skip + limit);
  const normalized = paginated.map((order) => ({
    ...order.toObject(),
    artwork: order.items?.[0]?.artwork || order.artwork || null,
  }));

  return sendResponse(res, {
    message: "Orders fetched",
    data: normalized,
    meta: buildPaginationMeta({ page, limit, total: filteredOrders.length }),
  });
});

const getOrderDetails = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("customer", "name email role")
    .populate({ path: "items.artwork", populate: { path: "artist", select: "name email" } });

  if (!order || order.isDeleted) {
    res.status(404);
    throw new Error("Order not found");
  }

  return sendResponse(res, {
    message: "Order details fetched",
    data: {
      ...order.toObject(),
      artwork: order.items?.[0]?.artwork || order.artwork || null,
    },
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!TRACKING_ALLOWED_STATUS.includes(status)) {
    res.status(400);
    throw new Error("Invalid order status");
  }

  const order = await Order.findById(req.params.id);

  if (!order || order.isDeleted) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  order.trackingTimeline = order.trackingTimeline || [];
  order.trackingTimeline.push({
    status,
    note: `Order status updated by admin to ${status}`,
    updatedBy: req.user._id,
    at: new Date(),
  });
  await order.save();

  await logActivity({
    actor: req.user._id,
    action: "ORDER_STATUS_UPDATED",
    entityType: "Order",
    entityId: order._id,
    metadata: { status },
  });

  return sendResponse(res, {
    message: "Order status updated",
    data: order,
  });
});

const refundOrder = asyncHandler(async (req, res) => {
  const { reason = "Refund issued by admin" } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order || order.isDeleted) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.paymentStatus = "refunded";
  order.trackingTimeline = order.trackingTimeline || [];
  order.trackingTimeline.push({
    status: order.status,
    note: "Payment refunded by admin",
    updatedBy: req.user._id,
    at: new Date(),
  });
  order.refund = {
    isRefunded: true,
    reason,
    refundedAt: new Date(),
    refundedBy: req.user._id,
  };
  await order.save();

  await logActivity({
    actor: req.user._id,
    action: "ORDER_REFUNDED",
    entityType: "Order",
    entityId: order._id,
    metadata: { reason },
  });

  return sendResponse(res, {
    message: "Order refunded (simulation)",
    data: order,
  });
});

const listCategories = asyncHandler(async (req, res) => {
  const search = req.query.search || "";

  const query = {
    isDeleted: false,
    ...buildSearchFilter(search, ["name", "description"]),
  };

  const categories = await Category.find(query).sort({ createdAt: -1 });

  return sendResponse(res, {
    message: "Categories fetched",
    data: categories,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description = "" } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("Category name is required");
  }

  const existing = await Category.findOne({ name: name.trim(), isDeleted: false });

  if (existing) {
    res.status(409);
    throw new Error("Category already exists");
  }

  const category = await Category.create({ name: name.trim(), description });

  await logActivity({
    actor: req.user._id,
    action: "CATEGORY_CREATED",
    entityType: "Category",
    entityId: category._id,
    metadata: { name: category.name },
  });

  return sendResponse(res, {
    statusCode: 201,
    message: "Category created",
    data: category,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category || category.isDeleted) {
    res.status(404);
    throw new Error("Category not found");
  }

  const { name, description, isActive } = req.body;

  if (name) category.name = name.trim();
  if (description !== undefined) category.description = description;
  if (typeof isActive === "boolean") category.isActive = isActive;

  await category.save();

  await logActivity({
    actor: req.user._id,
    action: "CATEGORY_UPDATED",
    entityType: "Category",
    entityId: category._id,
    metadata: { name: category.name },
  });

  return sendResponse(res, {
    message: "Category updated",
    data: category,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category || category.isDeleted) {
    res.status(404);
    throw new Error("Category not found");
  }

  const artworkCount = await Artwork.countDocuments({
    isDeleted: false,
    $or: [{ categoryRef: category._id }, { category: category.name }],
  });

  if (artworkCount > 0) {
    res.status(409);
    throw new Error("Cannot delete category. Artworks exist under this category");
  }

  category.isDeleted = true;
  await category.save();

  await logActivity({
    actor: req.user._id,
    action: "CATEGORY_DELETED",
    entityType: "Category",
    entityId: category._id,
    metadata: { name: category.name },
  });

  return sendResponse(res, {
    message: "Category deleted",
    data: { id: category._id, isDeleted: category.isDeleted },
  });
});

const monthlyRevenue = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    {
      $match: {
        isDeleted: false,
        paymentStatus: "paid",
        status: { $in: ["accepted", "completed"] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$price" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return sendResponse(res, {
    message: "Monthly revenue analytics fetched",
    data,
  });
});

const userGrowth = asyncHandler(async (req, res) => {
  const data = await User.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        newUsers: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return sendResponse(res, {
    message: "User growth analytics fetched",
    data,
  });
});

const topSellingArtworks = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $match: { isDeleted: false, status: { $in: ["accepted", "completed"] } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.artwork",
        totalSales: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.subtotal" },
      },
    },
    { $sort: { totalSales: -1, totalRevenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "artworks",
        localField: "_id",
        foreignField: "_id",
        as: "artwork",
      },
    },
    { $unwind: { path: "$artwork", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        artworkId: "$artwork._id",
        title: "$artwork.title",
        totalSales: 1,
        totalRevenue: 1,
      },
    },
  ]);

  return sendResponse(res, {
    message: "Top selling artworks fetched",
    data,
  });
});

const topArtists = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $match: { isDeleted: false, status: { $in: ["accepted", "completed"] } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.artist",
        orders: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.subtotal" },
      },
    },
    { $sort: { revenue: -1, orders: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "artist",
      },
    },
    { $unwind: { path: "$artist", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        artistId: "$artist._id",
        name: "$artist.name",
        email: "$artist.email",
        orders: 1,
        revenue: 1,
      },
    },
  ]);

  return sendResponse(res, {
    message: "Top artists fetched",
    data,
  });
});

const recentActivities = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const data = await ActivityLog.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("actor", "name email role");

  return sendResponse(res, {
    message: "Recent activity fetched",
    data,
  });
});

const exportUsersCsv = asyncHandler(async (req, res) => {
  const users = await User.find({ isDeleted: false }).select(
    "name email role isBlocked createdAt"
  );

  const headers = ["Name", "Email", "Role", "Blocked", "CreatedAt"];
  const rows = users.map((user) => [
    user.name,
    user.email,
    user.role,
    user.isBlocked ? "Yes" : "No",
    user.createdAt.toISOString(),
  ]);

  const csvEscape = (value) => `"${String(value || "").replace(/"/g, '""')}"`;
  const csvBody = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=users-report.csv");

  return res.status(200).send(csvBody);
});

module.exports = {
  dashboardStats,
  listUsers,
  listFixedAdmins,
  getUserDetails,
  blockUser,
  unblockUser,
  softDeleteUser,
  changeUserRole,
  listArtistRequests,
  approveArtistRequest,
  rejectArtistRequest,
  listArtworks,
  updateArtworkStatus,
  deleteArtwork,
  listOrders,
  getOrderDetails,
  updateOrderStatus,
  refundOrder,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  monthlyRevenue,
  userGrowth,
  topSellingArtworks,
  topArtists,
  recentActivities,
  exportUsersCsv,
};
