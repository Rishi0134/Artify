const express = require("express");
const { body } = require("express-validator");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { validate } = require("../middleware/validationMiddleware");

const router = express.Router();

// Get all artists (Public)
router.get(
  "/artists",
  asyncHandler(async (req, res) => {
    const artists = await User.find({ role: "artist" }).select(
      "name email profileImage specialty"
    );

    res.json({
      success: true,
      count: artists.length,
      data: artists,
    });
  })
);

// Update artist profile
router.put(
  "/artist-profile",
  protect,
  authorize("artist"),
  upload.single("profileImage"),
  [
    body("name").optional().trim().isLength({ min: 2, max: 50 }),
    body("specialty").optional().trim().isLength({ min: 2, max: 80 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (req.body.name) {
      user.name = req.body.name;
    }

    if (req.body.specialty !== undefined) {
      user.specialty = req.body.specialty;
    }

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        specialty: user.specialty,
      },
    });
  })
);

// Create User
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      data: user,
    });
  })
);

// Get Profile
router.get(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    res.json(req.user);
  })
);

// Admin Only
router.get(
  "/admin-only",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    res.json({ message: "Welcome Admin" });
  })
);

module.exports = router;
