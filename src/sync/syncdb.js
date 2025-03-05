const mongoose = require("mongoose");
const { createClient } = require("redis");
const Inventory = require("../models/InventoryModel"); // Import model Inventory
const redisClient = require("../../config/redis");

async function syncRedisToMongo() {
  try {
    console.log("🔄 Đang đồng bộ dữ liệu từ Redis vào MongoDB...");

    const keys = await redisClient.keys("stock:product_*");

    for (const key of keys) {
      const stockData = await redisClient.get(key);
      if (!stockData) continue;

      const ingredientsId = key.replace("stock:product_", "");
      const stock = parseInt(stockData, 10);

      await Inventory.findOneAndUpdate(
        { ingredientsId },
        { stock },
        { upsert: true }
      );

      console.log(`✅ Cập nhật ${ingredientsId}: ${stock} vào MongoDB`);
    }

    console.log("✅ Hoàn thành đồng bộ từ Redis vào MongoDB!");
  } catch (error) {
    console.error("❌ Lỗi đồng bộ Redis -> MongoDB:", error);
  }
}

async function syncMongoToRedis() {
  try {
    console.log("🔄 Đang đồng bộ dữ liệu từ MongoDB vào Redis...");

    const inventories = await Inventory.find({ isDeleted: false });

    for (const item of inventories) {
      const key = `stock:product_${item.ingredientsId}`;
      let existingStock = await redisClient.get(key);

      if (existingStock === null) {
        await redisClient.set(key, 0);
        console.log(
          `⚠️ Sản phẩm mới ${item.ingredientsId} chưa nhập hàng, đặt tồn kho = 0`
        );
      } else {
        await redisClient.set(key, item.stock);
        console.log(
          `✅ Cập nhật ${item.ingredientsId}: ${item.stock} vào Redis`
        );
      }
    }

    console.log("✅ Hoàn thành đồng bộ từ MongoDB vào Redis!");
  } catch (error) {
    console.error("❌ Lỗi đồng bộ MongoDB -> Redis:", error);
  }
}

async function startRedisSync() {
  console.log("✅ Redis connected!");

  setInterval(syncRedisToMongo, 1500000);
  setInterval(syncMongoToRedis, 150000);
}

module.exports = startRedisSync;
