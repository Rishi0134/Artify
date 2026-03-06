const express = require("express");
const crypto = require("crypto");

const Order = require("../models/Order");
const Artwork = require("../models/Artwork");
const Cart = require("../models/Cart");
const asyncHandler = require("../utils/asyncHandler");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

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

const normalizeQuantity = (quantity) => {
  const parsed = Number(quantity || 1);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
};

const createTrackingEntry = (status, note, updatedBy = null) => ({
  status,
  note,
  updatedBy,
  at: new Date(),
});

const toObjectIdString = (value) => String(value || "");

const getCartWithArtworks = async (customerId) => {
  const cart = await Cart.findOne({ customer: customerId }).populate({
    path: "items.artwork",
    populate: { path: "artist", select: "name email" },
  });

  if (!cart) {
    return {
      cart: null,
      validItems: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
    };
  }

  const validItems = cart.items
    .filter((item) => item.artwork && !item.artwork.isDeleted)
    .map((item) => {
      const quantity = normalizeQuantity(item.quantity);
      const price = Number(item.artwork.price || 0);
      const subtotal = price * quantity;

      return {
        artwork: item.artwork,
        quantity,
        price,
        subtotal,
      };
    });

  const subtotal = validItems.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = 0;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  return {
    cart,
    validItems,
    subtotal,
    tax,
    shipping,
    total,
  };
};

const serializeCart = (payload) => {
  const { cart, validItems, subtotal, tax, shipping, total } = payload;

  return {
    _id: cart?._id || null,
    customer: cart?.customer || null,
    items: validItems.map((item) => ({
      artwork: {
        _id: item.artwork._id,
        title: item.artwork.title,
        image: item.artwork.image,
        category: item.artwork.category,
        artist: item.artwork.artist,
      },
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    })),
    amounts: {
      subtotal,
      tax,
      shipping,
      total,
    },
  };
};

const createOrderFromCart = async ({
  customerId,
  paymentMethod,
  paymentStatus,
  shippingAddress,
  gatewayData = {},
}) => {
  const cartSnapshot = await getCartWithArtworks(customerId);

  if (!cartSnapshot.validItems.length) {
    const error = new Error("Cart is empty");
    error.statusCode = 400;
    throw error;
  }

  const orderItems = cartSnapshot.validItems.map((item) => ({
    artwork: item.artwork._id,
    artist: item.artwork.artist?._id || item.artwork.artist,
    titleSnapshot: item.artwork.title,
    imageSnapshot: item.artwork.image,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.subtotal,
  }));

  const timeline = [
    createTrackingEntry("pending", "Order placed successfully", customerId),
  ];

  if (paymentStatus === "paid") {
    timeline.push(createTrackingEntry("pending", "Payment confirmed", customerId));
  }

  const order = await Order.create({
    artwork: orderItems[0]?.artwork || null,
    customer: customerId,
    items: orderItems,
    price: cartSnapshot.total,
    amounts: {
      subtotal: cartSnapshot.subtotal,
      tax: cartSnapshot.tax,
      shipping: cartSnapshot.shipping,
      total: cartSnapshot.total,
    },
    shippingAddress: {
      fullName: shippingAddress?.fullName || "",
      phone: shippingAddress?.phone || "",
      addressLine1: shippingAddress?.addressLine1 || "",
      addressLine2: shippingAddress?.addressLine2 || "",
      city: shippingAddress?.city || "",
      state: shippingAddress?.state || "",
      postalCode: shippingAddress?.postalCode || "",
      country: shippingAddress?.country || "India",
    },
    paymentStatus,
    payment: {
      method: paymentMethod,
      gatewayOrderId: gatewayData.gatewayOrderId || "",
      gatewayPaymentId: gatewayData.gatewayPaymentId || "",
      gatewaySignature: gatewayData.gatewaySignature || "",
      paidAt: paymentStatus === "paid" ? new Date() : null,
    },
    trackingTimeline: timeline,
  });

  await Cart.updateOne(
    { customer: customerId },
    {
      $set: { items: [] },
    }
  );

  return order;
};

router.get(
  "/cart",
  protect,
  authorize("customer", "user"),
  asyncHandler(async (req, res) => {
    const cartSnapshot = await getCartWithArtworks(req.user._id);

    res.json({
      success: true,
      data: serializeCart(cartSnapshot),
    });
  })
);

router.post(
  "/cart/add",
  protect,
  authorize("customer", "user"),
  asyncHandler(async (req, res) => {
    const { artworkId } = req.body;
    const quantity = normalizeQuantity(req.body.quantity);

    const artwork = await Artwork.findById(artworkId);
    if (!artwork || artwork.isDeleted) {
      res.status(404);
      throw new Error("Artwork not found");
    }

    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      cart = await Cart.create({ customer: req.user._id, items: [] });
    }

    const index = cart.items.findIndex(
      (item) => toObjectIdString(item.artwork) === toObjectIdString(artwork._id)
    );

    if (index >= 0) {
      cart.items[index].quantity += quantity;
    } else {
      cart.items.push({ artwork: artwork._id, quantity });
    }

    await cart.save();

    const cartSnapshot = await getCartWithArtworks(req.user._id);

    res.status(201).json({
      success: true,
      message: "Added to cart",
      data: serializeCart(cartSnapshot),
    });
  })
);

router.put(
  "/cart/item/:artworkId",
  protect,
  authorize("customer", "user"),
  asyncHandler(async (req, res) => {
    const quantity = Number(req.body.quantity || 1);
    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    const index = cart.items.findIndex(
      (item) => toObjectIdString(item.artwork) === toObjectIdString(req.params.artworkId)
    );

    if (index < 0) {
      res.status(404);
      throw new Error("Artwork not found in cart");
    }

    if (quantity <= 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = normalizeQuantity(quantity);
    }

    await cart.save();

    const cartSnapshot = await getCartWithArtworks(req.user._id);

    res.json({
      success: true,
      data: serializeCart(cartSnapshot),
    });
  })
);

router.delete(
  "/cart/item/:artworkId",
  protect,
  authorize("customer", "user"),
  asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    cart.items = cart.items.filter(
      (item) => toObjectIdString(item.artwork) !== toObjectIdString(req.params.artworkId)
    );

    await cart.save();

    const cartSnapshot = await getCartWithArtworks(req.user._id);

    res.json({
      success: true,
      data: serializeCart(cartSnapshot),
    });
  })
);

router.delete(
  "/cart/clear",
  protect,
  authorize("customer", "user"),
  asyncHandler(async (req, res) => {
    await Cart.updateOne({ customer: req.user._id }, { $set: { items: [] } }, { upsert: true });

    res.json({
      success: true,
      message: "Cart cleared",
      data: {
        items: [],
        amounts: {
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
        },
      },
    });
  })
);

router.post(
  "/checkout/create",
  protect,
  authorize("customer", "user"),
  asyncHandler(async (req, res) => {
    const paymentMethod = req.body.paymentMethod === "cod" ? "cod" : "razorpay";
    const shippingAddress = req.body.shippingAddress || {};

    const cartSnapshot = await getCartWithArtworks(req.user._id);

    if (!cartSnapshot.validItems.length) {
      res.status(400);
      throw new Error("Cart is empty");
    }

    if (paymentMethod === "cod") {
      const order = await createOrderFromCart({
        customerId: req.user._id,
        paymentMethod,
        paymentStatus: "pending",
        shippingAddress,
      });

      return res.status(201).json({
        success: true,
        message: "Order placed with Cash on Delivery",
        data: {
          order,
          paymentRequired: false,
        },
      });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!razorpayKeyId || !razorpaySecret) {
      res.status(500);
      throw new Error("Razorpay keys are missing in backend environment");
    }

    const amountPaise = Math.round(cartSnapshot.total * 100);
    const receipt = `artify_${Date.now()}`;

    const auth = Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString("base64");

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt,
        notes: {
          customerId: String(req.user._id),
        },
      }),
    });

    const razorpayOrder = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      res.status(502);
      throw new Error(razorpayOrder?.error?.description || "Failed to create Razorpay order");
    }

    res.status(201).json({
      success: true,
      message: "Checkout initialized",
      data: {
        paymentRequired: true,
        checkout: {
          key: razorpayKeyId,
          amount: amountPaise,
          currency: razorpayOrder.currency,
          gatewayOrderId: razorpayOrder.id,
          receipt: razorpayOrder.receipt,
        },
        summary: {
          items: cartSnapshot.validItems.length,
          subtotal: cartSnapshot.subtotal,
          tax: cartSnapshot.tax,
          shipping: cartSnapshot.shipping,
          total: cartSnapshot.total,
        },
      },
    });
  })
);

router.post(
  "/checkout/verify",
  protect,
  authorize("customer", "user"),
  asyncHandler(async (req, res) => {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      shippingAddress,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400);
      throw new Error("Payment verification fields are required");
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!secret) {
      res.status(500);
      throw new Error("Razorpay secret is missing in backend environment");
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const providedBuffer = Buffer.from(String(razorpaySignature));
    const isValid =
      expectedBuffer.length === providedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (!isValid) {
      res.status(400);
      throw new Error("Payment signature verification failed");
    }

    const order = await createOrderFromCart({
      customerId: req.user._id,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      shippingAddress,
      gatewayData: {
        gatewayOrderId: razorpayOrderId,
        gatewayPaymentId: razorpayPaymentId,
        gatewaySignature: razorpaySignature,
      },
    });

    res.status(201).json({
      success: true,
      message: "Payment verified and order placed",
      data: order,
    });
  })
);

router.get(
  "/my-orders",
  protect,
  authorize("customer", "user"),
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ customer: req.user._id, isDeleted: false })
      .populate("items.artwork")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  })
);

router.get(
  "/my-orders/:id/tracking",
  protect,
  authorize("customer", "user"),
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
      .populate("items.artwork")
      .populate("trackingTimeline.updatedBy", "name email role");

    if (!order || order.isDeleted) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (toObjectIdString(order.customer) !== toObjectIdString(req.user._id)) {
      res.status(403);
      throw new Error("You can only track your own orders");
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingTimeline: order.trackingTimeline,
        items: order.items,
      },
    });
  })
);

router.get(
  "/artist-orders",
  protect,
  authorize("artist"),
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ isDeleted: false, "items.artist": req.user._id })
      .populate("customer", "name email")
      .populate("items.artwork")
      .sort({ createdAt: -1 });

    const filteredOrders = orders.map((order) => {
      const relevantItems = (order.items || []).filter(
        (item) => toObjectIdString(item.artist) === toObjectIdString(req.user._id)
      );

      const artistTotal = relevantItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

      return {
        ...order.toObject(),
        artistItems: relevantItems,
        artistTotal,
        artwork: relevantItems[0]?.artwork || null,
      };
    });

    res.json({
      success: true,
      count: filteredOrders.length,
      data: filteredOrders,
    });
  })
);

router.put(
  "/cancel/:id",
  protect,
  authorize("customer", "user"),
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order || order.isDeleted) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (toObjectIdString(order.customer) !== toObjectIdString(req.user._id)) {
      res.status(403);
      throw new Error("You can only cancel your own orders");
    }

    if (!["pending", "accepted"].includes(order.status)) {
      res.status(400);
      throw new Error("Only pending or accepted orders can be cancelled");
    }

    order.status = "cancelled";
    order.trackingTimeline.push(
      createTrackingEntry("cancelled", "Order cancelled by customer", req.user._id)
    );

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  })
);

router.get(
  "/",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ isDeleted: false })
      .populate("customer", "name email")
      .populate("items.artwork")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  })
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.isDeleted = true;
    await order.save();

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  })
);

router.put(
  "/:id",
  protect,
  authorize("artist"),
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order || order.isDeleted) {
      res.status(404);
      throw new Error("Order not found");
    }

    const hasArtistArtwork = (order.items || []).some(
      (item) => toObjectIdString(item.artist) === toObjectIdString(req.user._id)
    );

    if (!hasArtistArtwork) {
      res.status(403);
      throw new Error("You can only manage your own artwork orders");
    }

    const { status } = req.body;

    if (!TRACKING_ALLOWED_STATUS.includes(status)) {
      res.status(400);
      throw new Error("Invalid order status");
    }

    order.status = status;
    order.trackingTimeline.push(
      createTrackingEntry(status, `Status updated by artist to ${status}`, req.user._id)
    );

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  })
);

module.exports = router;
