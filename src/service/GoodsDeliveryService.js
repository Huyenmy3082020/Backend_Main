const GoodsDelivery = require("../models/DeliveriesModel");
const Inventory = require("../models/InventoryModel");
const mongoose = require("mongoose");

const Ingredient = require("../models/IngredientsModel");
const { createClient } = require("redis");

const {
  findSupplierByName,
} = require("../controller/repository/supplierRepository");

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
async function withRetry(fn, retries = 3, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.codeName === "WriteConflict" && i < retries - 1) {
        console.warn(`⚠️ Gặp lỗi WriteConflict, thử lại lần ${i + 1}...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

async function createGoodsDelivery(data) {
  console.log(
    "🔄 Cập nhật/Tạo mới kho hàng cho đơn nhập:",
    JSON.stringify(data, null, 2)
  );

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Lấy thông tin đơn nhập hàng
    const goodsDelivery = await GoodsDelivery.findById(data._id).session(
      session
    );
    console.log(
      "📦 Dữ liệu đơn nhập hàng từ DB:",
      JSON.stringify(goodsDelivery, null, 2)
    );

    if (!goodsDelivery) {
      console.error(`❌ Không tìm thấy đơn nhập hàng với ID: ${data._id}`);
      throw new Error(`Không tìm thấy đơn nhập hàng với ID: ${data._id}`);
    }

    if (goodsDelivery.status !== "Pending") {
      console.error(`❌ Đơn nhập hàng ${data._id} đã được xử lý trước đó!`);
      throw new Error(`Đơn nhập hàng ${data._id} đã được xử lý trước đó!`);
    }

    // Danh sách sản phẩm cần cập nhật kho
    console.log(
      "📊 Danh sách sản phẩm cần cập nhật kho:",
      JSON.stringify(data.items, null, 2)
    );

    await Promise.all(
      data.items.map(async (item) => {
        if (!item.ingredientsId || item.quantity <= 0) {
          console.error(
            "❌ Lỗi: Dữ liệu sản phẩm không hợp lệ!",
            JSON.stringify(item, null, 2)
          );
          throw new Error(`Sản phẩm không hợp lệ: ${JSON.stringify(item)}`);
        }

        console.log(
          `📊 Trước khi cập nhật - Ingredients ID: ${item.ingredientsId}`
        );

        let inventory = await Inventory.findOne({
          ingredientsId: item.ingredientsId,
        }).session(session);

        console.log(
          "📊 Dữ liệu kho trước khi cập nhật:",
          JSON.stringify(inventory, null, 2)
        );

        if (!inventory) {
          console.warn(
            `⚠️ Không tìm thấy kho hàng cho Ingredients ID: ${item.ingredientsId}, tạo mới...`
          );

          inventory = new Inventory({
            ingredientsId: item.ingredientsId,
            stock: item.quantity,
            status: "in-stock",
          });

          await inventory.save({ session });
        } else {
          inventory.stock += item.quantity;
          await inventory.save({ session });
        }

        console.log(
          "✅ Dữ liệu kho sau khi cập nhật:",
          JSON.stringify(inventory, null, 2)
        );
      })
    );

    goodsDelivery.status = "Created";
    await goodsDelivery.save({ session });

    if (!session.inTransaction()) {
      console.error("❌ Lỗi: Giao dịch đã bị hủy trước khi commit!");
      throw new Error("Giao dịch bị hủy, không thể commit!");
    }

    await session.commitTransaction();
    session.endSession();

    console.log(
      `✅ Đơn nhập hàng ${data._id} đã cập nhật kho & chuyển trạng thái "Created"`
    );

    return goodsDelivery;
  } catch (error) {
    if (session.inTransaction()) {
      console.error("⚠ Hủy giao dịch do lỗi...");
      await session.abortTransaction();
    }
    session.endSession();
    console.error("❌ Lỗi khi cập nhật kho hàng:", error.message);
    throw error;
  }
}

async function createGoodsDeliveryV1(data) {
  const session = await mongoose.startSession();

  try {
    let { userId, items, supplierName, deliveryAddress, totalPrice } = data;

    const supplierId = await findSupplierByName(supplierName);
    if (!supplierId) {
      throw new Error(`Không tìm thấy nhà cung cấp với tên: ${supplierName}`);
    }
    session.startTransaction();

    const updatedItems = await Promise.all(
      items.map(async (item) => {
        if (!item.ingredientsId) {
          throw new Error(
            `Thiếu ingredientsId ở sản phẩm: ${JSON.stringify(item)}`
          );
        }

        const ingredient = await Ingredient.findById(item.ingredientsId);

        if (!ingredient) {
          throw new Error(
            `Không tìm thấy nguyên liệu có ID: ${item.ingredientsId}`
          );
        }

        return {
          ingredientsId: ingredient._id,
          ingredientNameAtPurchase: ingredient.name,
          quantity: item.quantity,
          priceAtPurchase: ingredient.price,
          supplierId,
        };
      })
    );

    const goodsDelivery = new GoodsDelivery({
      userId,
      items: updatedItems,
      totalPrice,
      supplierId,
      deliveryAddress,
      totalPrice: totalPrice,
    });

    await withRetry(async () => {
      await goodsDelivery.save({ session });
    });

    await session.commitTransaction();
    session.endSession();

    console.log("✅ Phiếu nhập hàng tạo thành công:", goodsDelivery._id);

    return goodsDelivery;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
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
    .populate({
      path: "supplierId",
      select: "name",
    })
    .select("items quantity totalPrice deliveryDate status");
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
  createGoodsDeliveryV1,
};
