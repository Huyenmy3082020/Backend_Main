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
          required: true,
        },
        quantity: {
          type: Number,
          min: 1,
        },
        price: { type: Number, required: true },
      },
    ],

    totalPrice: {
      type: String,
      min: 0,
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
