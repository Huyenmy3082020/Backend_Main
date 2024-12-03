const mongoose = require("mongoose");

const ShippingSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  ward: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String },
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Shipping", ShippingSchema);
