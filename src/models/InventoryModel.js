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
    status: {
      type: String,
      enum: ["in-stock", "out-of-stock"],
      default: "in-stock",
    },
  },
  { timestamps: true }
);

// ✅ Middleware tự động cập nhật status trước khi lưu
inventorySchema.pre("save", function (next) {
  this.status = this.stock > 0 ? "in-stock" : "out-of-stock";
  next();
});

module.exports = mongoose.model("Inventory", inventorySchema);
