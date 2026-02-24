const express = require("express");
const { body, param, query } = require("express-validator");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const Artwork = require("../models/Artwork");
const asyncHandler = require("../utils/asyncHandler");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { validate } = require("../middleware/validationMiddleware");

/*
==================================================
GET ALL ARTWORKS (Public)
Supports:
- Pagination
- Keyword search
==================================================
*/

router.get(
  "/",
  [
    query("page").optional().isNumeric().withMessage("Page must be number"),
    query("limit").optional().isNumeric().withMessage("Limit must be number"),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const keyword = req.query.keyword
      ? {
          title: { $regex: req.query.keyword, $options: "i" },
        }
      : {};

    const count = await Artwork.countDocuments({ ...keyword });

    const artworks = await Artwork.find({ ...keyword })
      .populate("artist", "name email")
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count,
      page,
      pages: Math.ceil(count / limit),
      data: artworks,
    });
  })
);

/*
==================================================
GET MY ARTWORKS (Artist Only)
==================================================
*/

router.get(
  "/my",
  protect,
  authorize("artist"),
  asyncHandler(async (req, res) => {
    const artworks = await Artwork.find({ artist: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: artworks.length,
      data: artworks,
    });
  })
);

/*
==================================================
GET SINGLE ARTWORK (Public)
==================================================
*/

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid artwork ID")],
  validate,
  asyncHandler(async (req, res) => {
    const artwork = await Artwork.findById(req.params.id).populate(
      "artist",
      "name email"
    );

    if (!artwork) {
      res.status(404);
      throw new Error("Artwork not found");
    }

    res.json({
      success: true,
      data: artwork,
    });
  })
);

/*
==================================================
CREATE ARTWORK (Artist Only)
==================================================
*/

router.post(
  "/",
  protect,
  authorize("artist"),
  upload.single("image"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isNumeric()
      .withMessage("Price must be numeric"),
    body("description").optional().trim(),
    body("category").optional().trim(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error("Image is required");
    }

    const { title, description, price, category } = req.body;

    const imageUrl = `/uploads/${req.file.filename}`;

    const artwork = await Artwork.create({
      title,
      description,
      price,
      category,
      image: imageUrl,
      artist: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: artwork,
    });
  })
);

/*
==================================================
UPDATE ARTWORK (Artist Owner Only)
==================================================
*/

router.put(
  "/:id",
  protect,
  authorize("artist"),
  upload.single("image"),
  [
    param("id").isMongoId().withMessage("Invalid artwork ID"),
    body("price").optional().isNumeric().withMessage("Price must be numeric"),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      res.status(404);
      throw new Error("Artwork not found");
    }

    if (artwork.artist.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("You can only update your own artwork");
    }

    artwork.title = req.body.title || artwork.title;
    artwork.description = req.body.description || artwork.description;
    artwork.price = req.body.price || artwork.price;
    artwork.category = req.body.category || artwork.category;

    if (req.file) {
      artwork.image = `/uploads/${req.file.filename}`;
    }

    const updatedArtwork = await artwork.save();

    res.json({
      success: true,
      data: updatedArtwork,
    });
  })
);

/*
==================================================
DELETE ARTWORK (Artist Owner Only)
==================================================
*/

router.delete(
  "/:id",
  protect,
  authorize("artist"),
  [param("id").isMongoId().withMessage("Invalid artwork ID")],
  validate,
  asyncHandler(async (req, res) => {
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      res.status(404);
      throw new Error("Artwork not found");
    }

    if (artwork.artist.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("You can only delete your own artwork");
    }

    await artwork.deleteOne();

    res.json({
      success: true,
      message: "Artwork deleted successfully",
    });
  })
);

module.exports = router;
