const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    artwork: { type: mongoose.Schema.Types.ObjectId, ref: "Artwork", required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    titleSnapshot: { type: String, required: true, trim: true },
    imageSnapshot: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true, trim: true },
    note: { type: String, default: "", trim: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    artwork: { type: mongoose.Schema.Types.ObjectId, ref: "Artwork", default: null },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], default: [] },
    price: { type: Number, required: true, min: 0, default: 0 },
    amounts: {
      subtotal: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      shipping: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 },
    },
    shippingAddress: {
      fullName: { type: String, default: "", trim: true },
      phone: { type: String, default: "", trim: true },
      addressLine1: { type: String, default: "", trim: true },
      addressLine2: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      state: { type: String, default: "", trim: true },
      postalCode: { type: String, default: "", trim: true },
      country: { type: String, default: "India", trim: true },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "completed",
        "rejected",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    payment: {
      method: {
        type: String,
        enum: ["razorpay", "cod"],
        default: "razorpay",
      },
      gatewayOrderId: { type: String, default: "" },
      gatewayPaymentId: { type: String, default: "" },
      gatewaySignature: { type: String, default: "" },
      paidAt: { type: Date, default: null },
    },
    trackingTimeline: { type: [timelineSchema], default: [] },
    refund: {
      isRefunded: { type: Boolean, default: false },
      reason: { type: String, default: "" },
      refundedAt: { type: Date, default: null },
      refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
