const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    phone: { type: Number, minLength: 8 },
    role: { type: String, default: "staff" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
