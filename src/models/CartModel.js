const mongoose = require("mongoose");

const mongooseDelete = require("mongoose-delete");
const cartSchema = new mongoose.Schema(
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
        quantity: { type: Number, required: true },
        status: { type: String, default: "pending" },
      },
    ],
  },

  { timestamps: true }
);

cartSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" });

module.exports = mongoose.model("Cart", cartSchema);
