const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    subject: {
      type: String,
      trim: true,
      default: "Customization discussion",
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

chatSchema.index({ customer: 1, artist: 1, order: 1 }, { unique: true });

module.exports = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
