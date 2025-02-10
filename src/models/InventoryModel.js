const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    stock: {
      type: Number,
      required: true,
      min: 0, // Không cho phép số âm
    },
    ingredientsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["in-stock", "out-of-stock", "pending", "transferred"],
      default: "in-stock",
    },
    location: {
      type: String,
      default: "Warehouse A",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
