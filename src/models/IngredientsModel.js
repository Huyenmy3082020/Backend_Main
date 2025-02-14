const mongoose = require("mongoose");

const ingredientSchemae = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    unit: { type: String, require: true },
    description: { type: String, required: true },
    updatedAt: { type: Date },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ingredient", ingredientSchemae);
