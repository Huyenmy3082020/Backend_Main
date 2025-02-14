const GoodsDelivery = require("../models/DeliveriesModel");
const Inventory = require("../models/InventoryModel");
const mongoose = require("mongoose");

async function createGoodsDelivery(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const goodsDelivery = new GoodsDelivery(data);
    console.log("goodsDelivery", goodsDelivery);
    await goodsDelivery.save({ session });

    // Cập nhật tồn kho cho từng sản phẩm
    for (const item of goodsDelivery.items) {
      if (!item.ingredientsId) {
        throw new Error("ingredientsId is missing in one of the items");
      }

      // Chuyển đổi ingredientsId sang ObjectId nếu cần
      const ingredientObjectId = new mongoose.Types.ObjectId(
        item.ingredientsId
      );

      await Inventory.findOneAndUpdate(
        { ingredientsId: ingredientObjectId }, // Đảm bảo ID đúng kiểu
        { $inc: { stock: item.quantity } },
        { upsert: true, new: true, session }
      );
    }

    await session.commitTransaction();
    session.endSession();
    return goodsDelivery;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in createGoodsDelivery:", error);
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
        { ingredientsId: item.ingredientsId },
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
        { ingredientsId: item.ingredientsId },
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
  console.log(id);
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
async function getAllGoodsDeliveries() {
  return await GoodsDelivery.find()
    .populate({
      path: "items.ingredientsId",
      select: "name price _id", // Lấy các thông tin cần thiết từ Ingredient
    })
    .populate("userId") // Populate thông tin user nếu cần
    .select("items quantity totalPrice deliveryDate deliveryAddress");
}

module.exports = {
  createGoodsDelivery,
  updateGoodsDelivery,
  deleteGoodsDelivery,
  getAllGoodsDeliveries,
};
