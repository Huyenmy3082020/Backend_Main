const redis = require("redis");

const redisClient = redis.createClient({
  url: "redis://18.212.168.133:6379", // Thay bằng IP public của EC2
});
redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

redisClient.connect(); // Kết nối Redis (Redis v4 trở lên)

module.exports = redisClient;
