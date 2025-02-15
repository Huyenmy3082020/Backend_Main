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

async function updateGoodsDelivery(id, data) {
  console.log("id", id);
  console.log("data", data);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingGoodsDelivery = await GoodsDelivery.findById(id).session(
      session
    );
    if (!existingGoodsDelivery) {
      throw new Error("GoodsDelivery not found");
    }

    // 🔹 1. Chuyển đổi _id thành ingredientsId trước khi cập nhật
    const updatedItems = existingGoodsDelivery.items.map((oldItem) => {
      const newItem = data.find((item) => item._id === oldItem.ingredientsId);
      return {
        ingredientsId: oldItem.ingredientsId, // Giữ nguyên ID
        name: oldItem.name, // Giữ nguyên tên cũ
        price: oldItem.price, // Giữ nguyên giá cũ
        quantity: newItem ? newItem.quantity : oldItem.quantity, // Chỉ cập nhật số lượng nếu có
      };
    });

    // 🔹 2. Cập nhật tồn kho theo sự chênh lệch số lượng
    for (const oldItem of existingGoodsDelivery.items) {
      const newItem = updatedItems.find(
        (item) => item.ingredientsId === oldItem.ingredientsId
      );

      if (newItem) {
        const delta = newItem.quantity - oldItem.quantity; // ✅ Chênh lệch số lượng
        await Inventory.findOneAndUpdate(
          { ingredientsId: oldItem.ingredientsId },
          { $inc: { stock: -delta } }, // ✅ Chỉ cập nhật đúng chênh lệch
          { upsert: true, new: true, session }
        );
      }
    }

    // 🔹 3. Tính tổng tiền (`totalPrice`)
    const totalPrice = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 🔹 4. Định dạng tiền thành VND
    const formattedTotalPrice = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(totalPrice);

    // 🔹 5. Cập nhật lại items và tổng tiền của phiếu nhập
    existingGoodsDelivery.items = updatedItems;
    existingGoodsDelivery.totalPrice = formattedTotalPrice;
    await existingGoodsDelivery.save({ session });

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
