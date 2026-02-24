const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const artworkRoutes = require("./routes/artworkRoutes");
const orderRoutes = require("./routes/orderRoutes");
const chatRoutes = require("./routes/chatRoutes");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
app.use(
  helmet({
    // Allow frontend on a different origin (localhost:5173) to render images from backend uploads.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later",
});

app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chats", chatRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));
// Test route
app.get("/", (req, res) => {
  res.send("Artify Backend Running 🚀");
});

// Error middleware (ALWAYS LAST)
app.use(errorHandler);

module.exports = app;
