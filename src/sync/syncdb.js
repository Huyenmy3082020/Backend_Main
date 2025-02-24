const mongoose = require("mongoose");
const { createClient } = require("redis");
const Inventory = require("../models/InventoryModel"); // Import model Inventory

// Kết nối Redis
const redisClient = createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379,
  },
});

redisClient.on("error", (err) => console.error("❌ Redis error:", err));

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

// ✅ Hàm đồng bộ từ MongoDB vào Redis (kể cả sản phẩm chưa nhập hàng)
async function syncMongoToRedis() {
  try {
    console.log("🔄 Đang đồng bộ dữ liệu từ MongoDB vào Redis...");

    const inventories = await Inventory.find({});

    for (const item of inventories) {
      const key = `stock:product_${item.ingredientsId}`;
      let existingStock = await redisClient.get(key);

      // Nếu sản phẩm chưa có trong Redis, gán tồn kho = 0
      if (existingStock === null) {
        await redisClient.set(key, 0);
        console.log(
          `⚠️ Sản phẩm mới ${item.ingredientsId} chưa nhập hàng, đặt tồn kho = 0`
        );
      } else {
        // Nếu có rồi, cập nhật tồn kho theo MongoDB
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
  await redisClient.connect();
  console.log("✅ Redis connected!");

  // Đồng bộ hai chiều định kỳ
  setInterval(syncRedisToMongo, 600000); // Mỗi 60 giây đồng bộ từ Redis -> MongoDB
  setInterval(syncMongoToRedis, 600000); // Mỗi 60 giây đồng bộ từ MongoDB -> Redis
}

module.exports = startRedisSync;
