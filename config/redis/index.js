const redis = require("redis");

const redisClient = redis.createClient({
  url: "redis://72.31.94.59:6379", // Đổi thành IP thật của Redis server
});

redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

redisClient.connect(); // Kết nối Redis (Redis v4 trở lên)

module.exports = redisClient;
