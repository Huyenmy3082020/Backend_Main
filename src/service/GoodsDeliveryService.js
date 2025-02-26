const GoodsDelivery = require("../models/DeliveriesModel");
const Inventory = require("../models/InventoryModel");
const mongoose = require("mongoose");

const Ingredient = require("../models/IngredientsModel");
const { createClient } = require("redis");

const redisClient = createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379,
  },
});

redisClient.connect().then(() => console.log("✅ Redis connected!"));

async function updateInventoryInRedis(ingredientsId, stock) {
  const key = `stock:product_${ingredientsId}`;
  if (!isNaN(stock)) {
    await redisClient.set(key, stock);
    console.log(`🔄 Cập nhật Redis: ${key} ->`, stock);
  } else {
    console.log(`⚠️ Dữ liệu không hợp lệ cho sản phẩm ${ingredientsId}`);
  }
}

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
          ingredientNameAtPurchase: ingredient.name,
          quantity: item.quantity,
          priceAtPurchase: ingredient.price,
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
      status: "Pending",
    });

    await goodsDelivery.save({ session });

    for (const item of updatedItems) {
      let updatedInventory = await Inventory.findOne({
        ingredientsId: item.ingredientsId,
      }).session(session);

      if (!updatedInventory) {
        updatedInventory = new Inventory({
          ingredientsId: item.ingredientsId,
          stock: 0,
          status: "không có dữ liệu",
        });

        await updatedInventory.save({ session });

        console.log(
          `🆕 Thêm mới Inventory cho sản phẩm ${item.ingredientsId} với stock = 0`
        );
      }

      updatedInventory.stock += item.quantity;
      await updatedInventory.save({ session });

      await updateInventoryInRedis(item.ingredientsId, updatedInventory.stock);
    }

    await session.commitTransaction();
    session.endSession();

    // ✅ Đặt setTimeout sau 3 phút để cập nhật trạng thái thành "Delivered"
    setTimeout(async () => {
      try {
        await GoodsDelivery.findByIdAndUpdate(goodsDelivery._id, {
          status: "CREATED",
        });
      } catch (error) {
        console.error(
          `❌ Lỗi cập nhật trạng thái phiếu nhập ${goodsDelivery._id}:`,
          error
        );
      }
    }, 180000);

    return goodsDelivery;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Lỗi khi nhập hàng:", error);
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
      select: "name price _id",
    })
    .populate("userId")
    .select("items quantity totalPrice deliveryDate deliveryAddress status");
}
async function createGoodsShipment(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let { userId, items, deliveryAddress } = data;

    const updatedItems = await Promise.all(
      items.map(async (item) => {
        if (!item.ingredientsId) {
          throw new Error("ingredientsId is missing in one of the items");
        }

        const inventoryItem = await Inventory.findOne({
          ingredientsId: item.ingredientsId,
        }).session(session);
        if (!inventoryItem || inventoryItem.stock < item.quantity) {
          throw new Error(
            `Not enough stock for ingredient ID ${item.ingredientsId}`
          );
        }

        return {
          ingredientsId: item.ingredientsId,
          quantity: item.quantity,
          priceAtShipment: inventoryItem.price, // Lưu giá tại thời điểm xuất kho
        };
      })
    );

    const totalPrice = updatedItems.reduce(
      (sum, item) => sum + item.quantity * item.priceAtShipment,
      0
    );

    const goodsShipment = new GoodsShipment({
      userId,
      items: updatedItems,
      totalPrice,
      deliveryAddress,
    });

    await goodsShipment.save({ session });

    for (const item of updatedItems) {
      await Inventory.findOneAndUpdate(
        { ingredientsId: item.ingredientsId },
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return goodsShipment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in createGoodsShipment:", error);
    throw error;
  }
}

module.exports = {
  createGoodsDelivery,
  updateGoodsDelivery,
  deleteGoodsDelivery,
  getAllGoodsDeliveries,
  createGoodsShipment,
};
