const express = require("express");
const router = express.Router();
const redisController = require("../controller/RedisController");

router.post("/redis", redisController.setRedisData);

router.get("/redis/:key", redisController.getRedisData);

module.exports = router;
