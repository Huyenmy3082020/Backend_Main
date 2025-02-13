const GoodsDelivery = require("../models/DeliveriesModel");
const Inventory = require("../models/InventoryModel");
const mongoose = require("mongoose");

// 🔹 Thêm phiếu nhập hàng
async function createGoodsDelivery(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const goodsDelivery = new GoodsDelivery(data);
    console.log("goodsDelivery", goodsDelivery);
    await goodsDelivery.save({ session });

    // Cập nhật tồn kho cho từng sản phẩm
    for (const item of goodsDelivery.items) {
      await Inventory.findOneAndUpdate(
        { ingredientsId: item.ingredientsId },
        { $inc: { stock: item.quantity } },
        { upsert: true, new: true, session }
      );
    }
    ingredientsId;
    await session.commitTransaction();
    session.endSession();
    return goodsDelivery;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

// 🔹 Sửa phiếu nhập hàng
async function updateGoodsDelivery(id, data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingGoodsDelivery = await GoodsDelivery.findById(id).session(
      session
    );
    if (!existingGoodsDelivery) {
      throw new Error("GoodsDelivery not found");
    }

    // Khôi phục tồn kho từ phiếu nhập cũ
    for (const item of existingGoodsDelivery.items) {
      await Inventory.findOneAndUpdate(
        { productId: item.productId },
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // Cập nhật phiếu nhập
    existingGoodsDelivery.set(data);
    await existingGoodsDelivery.save({ session });

    // Cập nhật tồn kho từ phiếu nhập mới
    for (const item of existingGoodsDelivery.items) {
      await Inventory.findOneAndUpdate(
        { productId: item.productId },
        { $inc: { stock: item.quantity } },
        { upsert: true, new: true, session }
      );
    }

    await session.commitTransaction();
    session.endSession();
    return existingGoodsDelivery;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

// 🔹 Xóa phiếu nhập hàng
async function deleteGoodsDelivery(id) {
  console.log(id)
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const goodsDelivery = await GoodsDelivery.findByIdAndDelete(id).session(
      session
    );
    if (!goodsDelivery) {
      throw new Error("GoodsDelivery not found");
    }

    // Giảm tồn kho cho từng sản phẩm
    for (const item of goodsDelivery.items) {
      await Inventory.findOneAndUpdate(
        { productId: item.productId },
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();
    return goodsDelivery;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

module.exports = {
  createGoodsDelivery,
  updateGoodsDelivery,
  deleteGoodsDelivery,
};
