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
      enum: ["in-stock", "out-of-stock", "không có dữ liệu"],
      default: "in-stock",
    },
  },
  { timestamps: true }
);

// ✅ Hàm cập nhật trạng thái dựa vào `stock`
function updateStatus(next) {
  if (this.stock !== undefined) {
    this.status = this.stock > 0 ? "in-stock" : "out-of-stock";
  }
  next();
}

// 🔥 Middleware trước khi lưu (create/update trực tiếp trên instance)
inventorySchema.pre("save", updateStatus);

// 🔥 Middleware trước khi cập nhật bằng `findOneAndUpdate`
inventorySchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.stock !== undefined) {
    update.status = update.stock > 0 ? "in-stock" : "out-of-stock";
  }
  next();
});

// 🔥 Middleware sau khi cập nhật để đảm bảo status được cập nhật đúng
inventorySchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    const updatedDoc = await this.model.findOne({ _id: doc._id });
    if (updatedDoc.stock === 0 && updatedDoc.status !== "out-of-stock") {
      updatedDoc.status = "out-of-stock";
      await updatedDoc.save();
    } else if (updatedDoc.stock > 0 && updatedDoc.status !== "in-stock") {
      updatedDoc.status = "in-stock";
      await updatedDoc.save();
    }
  }
});

module.exports = mongoose.model("Inventory", inventorySchema);
