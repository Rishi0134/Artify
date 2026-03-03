const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const artworkRoutes = require("./routes/artworkRoutes");
const orderRoutes = require("./routes/orderRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

/* =======================
   SECURITY MIDDLEWARE
======================= */

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  message: "Too many requests, try again later",
});

app.use(limiter);
app.use(cors());

/* =======================
   BODY PARSER
======================= */

app.use(express.json());

/* =======================
   LOGGER
======================= */

app.use(morgan("dev"));

/* =======================
   HEALTH CHECK
======================= */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OK",
    data: {},
  });
});

/* =======================
   API ROUTES
======================= */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/admin", adminRoutes);

/* =======================
   STATIC UPLOADS
======================= */

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

/* =======================
   ERROR HANDLER (ALWAYS LAST)
======================= */

app.use(errorHandler);

module.exports = app;