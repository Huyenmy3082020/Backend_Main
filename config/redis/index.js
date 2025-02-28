const redis = require("redis");

const redisClient = redis.createClient({
  host: "localhost", // Đổi thành localhost
  port: 6379, // Cổng mặc định của Redis
});

redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

redisClient.connect(); // Kết nối Redis (Redis v4 trở lên)

module.exports = redisClient;
