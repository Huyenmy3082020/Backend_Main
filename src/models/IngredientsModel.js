const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: {
      type: String,
      required: true,
      enum: ["ml", "l", "g", "kg", "cái", "hộp", "gói", "chai", "ly"],
    },
    description: { type: String, required: true },
    updatedAt: { type: Date },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ingredient", ingredientSchema);
