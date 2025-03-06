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

    const inventories = await Inventory.find();

    if (!inventories.length) {
      console.log("⚠️ Không có dữ liệu tồn kho trong MongoDB.");
      return;
    }

    // Loop through each inventory item and set the Redis key-value directly
    for (const item of inventories) {
      const key = `stock:product_${item.ingredientsId}`;
      await redisClient.set(key, item.stock); // Directly setting each key-value
    }

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

    // Loop through each key, get the stock data and update MongoDB
    for (const key of keys) {
      const stockData = await redisClient.get(key);
      if (!stockData) continue;

      const ingredientsId = key.replace("stock:product_", "");
      const stock = parseInt(stockData, 10);

      // Update or insert the stock into MongoDB
      await Inventory.updateOne({ ingredientsId }, { stock }, { upsert: true });
    }

    console.log("✅ Hoàn thành đồng bộ Redis -> MongoDB!");
  } catch (error) {
    console.error("❌ Lỗi khi đồng bộ Redis -> MongoDB:", error);
  }
}

async function startSync() {
  await connectDB();

  // Sync every 2 minutes (120000 ms)
  setInterval(syncMongoToRedis, 120000);
  setInterval(syncRedisToMongo, 120000);

  console.log("🔁 Hệ thống đồng bộ MongoDB ↔ Redis đã bắt đầu!");
}

module.exports = { syncMongoToRedis, syncRedisToMongo, startSync };