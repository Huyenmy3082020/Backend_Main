const mongoose = require("mongoose");
const redisClient = require("../../config/redis");
const Inventory = require("../models/InventoryModel");
const connectDB = require("../../config/mongodb");

async function syncMongoToRedis() {
  try {
    console.log("🔄 Bắt đầu đồng bộ từ MongoDB vào Redis...");

    if (mongoose.connection.readyState !== 1) {
      console.error("❌ MongoDB chưa kết nối! Hủy đồng bộ.");
      return;
    }

    if (!redisClient) {
      console.error("❌ Redis chưa kết nối! Hủy đồng bộ.");
      return;
    }

    const inventories = await Inventory.find({ isDeleted: false });

    if (!inventories.length) {
      console.log("⚠️ Không có dữ liệu tồn kho trong MongoDB.");
      return;
    }

    const pipeline = redisClient.pipeline();
    for (const item of inventories) {
      const key = `stock:product_${item.ingredientsId}`;
      pipeline.set(key, item.stock);
    }
    await pipeline.exec();

    console.log("✅ Hoàn thành đồng bộ MongoDB -> Redis!");
  } catch (error) {
    console.error("❌ Lỗi khi đồng bộ MongoDB -> Redis:", error);
  }
}

async function syncRedisToMongo() {
  try {
    console.log("🔄 Bắt đầu đồng bộ từ Redis vào MongoDB...");

    if (mongoose.connection.readyState !== 1) {
      console.error("❌ MongoDB chưa kết nối! Hủy đồng bộ.");
      return;
    }

    if (!redisClient) {
      console.error("❌ Redis chưa kết nối! Hủy đồng bộ.");
      return;
    }

    const keys = await redisClient.keys("stock:product_*");

    if (!keys.length) {
      console.log("⚠️ Không có dữ liệu tồn kho trong Redis.");
      return;
    }

    const bulkOps = [];
    for (const key of keys) {
      const stockData = await redisClient.get(key);
      if (!stockData) continue;

      const ingredientsId = key.replace("stock:product_", "");
      const stock = parseInt(stockData, 10);

      bulkOps.push({
        updateOne: {
          filter: { ingredientsId },
          update: { stock },
          upsert: true,
        },
      });
    }

    if (bulkOps.length > 0) {
      await Inventory.bulkWrite(bulkOps);
      console.log(
        `✅ Cập nhật ${bulkOps.length} sản phẩm từ Redis vào MongoDB`
      );
    } else {
      console.log("⚠️ Không có dữ liệu cần cập nhật vào MongoDB.");
    }

    console.log("✅ Hoàn thành đồng bộ Redis -> MongoDB!");
  } catch (error) {
    console.error("❌ Lỗi khi đồng bộ Redis -> MongoDB:", error);
  }
}

// 🔁 Hàm chạy đồng bộ mỗi 2 phút
async function startSync() {
  await connectDB();

  setInterval(syncMongoToRedis, 120000); // 2 phút
  setInterval(syncRedisToMongo, 120000); // 2 phút

  console.log("🔁 Hệ thống đồng bộ MongoDB ↔ Redis đã bắt đầu!");
}

module.exports = { syncMongoToRedis, syncRedisToMongo, startSync };
