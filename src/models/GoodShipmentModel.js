const mongoose = require("mongoose");

const goodsShipmentSchema = new mongoose.Schema(
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
          type: Number,
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
    shipmentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Shipped",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", goodsShipmentSchema);
