const GoodsDelivery = require("../models/DeliveriesModel");
const Inventory = require("../models/InventoryModel");
const mongoose = require("mongoose");

const Ingredient = require("../models/IngredientsModel");

async function createGoodsDelivery(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let { userId, items, deliveryAddress } = data;

    const updatedItems = await Promise.all(
      items.map(async (item) => {
        if (!item.ingredientsId) {
          throw new Error("ingredientsId is missing in one of the items");
        }

        const ingredient = await Ingredient.findById(
          item.ingredientsId
        ).session(session);
        if (!ingredient) {
          throw new Error(`Ingredient with ID ${item.ingredientsId} not found`);
        }

        return {
          ingredientsId: ingredient._id,
          ingredientNameAtPurchase: ingredient.name, // Lưu tên nguyên liệu
          quantity: item.quantity,
          priceAtPurchase: ingredient.price, // Lưu giá tại thời điểm nhập
        };
      })
    );

    const totalPrice = updatedItems.reduce(
      (sum, item) => sum + item.quantity * item.priceAtPurchase,
      0
    );

    const goodsDelivery = new GoodsDelivery({
      userId,
      items: updatedItems,
      totalPrice,
      deliveryAddress,
    });

    await goodsDelivery.save({ session });

    for (const item of updatedItems) {
      await Inventory.findOneAndUpdate(
        { ingredientsId: item.ingredientsId },
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingGoodsDelivery = await GoodsDelivery.findById(id).session(
      session
    );
    if (!existingGoodsDelivery) {
      throw new Error("GoodsDelivery not found");
    }

    for (const item of existingGoodsDelivery.items) {
      await Inventory.findOneAndUpdate(
        { ingredientsId: item.ingredientsId },
        { $inc: { stock: -item.quantity } },
        { upsert: true, new: true, session }
      );
    }

    const updatedItems = await Promise.all(
      data.items.map(async (item) => {
        if (!item.ingredientsId) {
          throw new Error("ingredientsId is missing in one of the items");
        }

        let ingredient = await Ingredient.findById(item.ingredientsId).session(
          session
        );
        if (!ingredient) {
          throw new Error(`Ingredient with ID ${item.ingredientsId} not found`);
        }

        return {
          ingredientsId: item.ingredientsId,
          ingredientNameAtPurchase: ingredient.name, // Lưu tên nguyên liệu cập nhật
          quantity: item.quantity,
          priceAtPurchase: ingredient.price,
        };
      })
    );

    const totalPrice = updatedItems.reduce(
      (sum, item) => sum + item.quantity * item.priceAtPurchase,
      0
    );

    existingGoodsDelivery.items = updatedItems;
    existingGoodsDelivery.totalPrice = totalPrice;
    await existingGoodsDelivery.save({ session });

    for (const item of updatedItems) {
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
