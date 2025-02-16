const mongoose = require("mongoose");

const goodsDeliverySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        ingredientsId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
        },
        quantity: {
          type: Number,
          min: 1,
          required: true,
        },
        priceAtPurchase: {
          type: Number, // Lưu giá nguyên liệu tại thời điểm mua
          required: true,
        },
        ingredientNameAtPurchase: {
          type: String,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      min: 0,
      required: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    deliveryAddress: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoodsDelivery", goodsDeliverySchema);
