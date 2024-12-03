const redisService = require("../service/RedisService");

const setRedisData = async (req, res) => {
  const { key, value } = req.body;
  try {
    await redisService.setValue(key, value);
    res.status(200).send({ message: "Data saved to Redis" });
  } catch (error) {
    res.status(500).send({ error: "Failed to save data to Redis" });
  }
};

const getRedisData = async (req, res) => {
  const { key } = req.params;
  try {
    const value = await redisService.getValue(key);
    if (value) {
      res.status(200).send({ key, value });
    } else {
      res.status(404).send({ message: `Key ${key} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve data from Redis" });
  }
};

module.exports = {
  setRedisData,
  getRedisData,
};
