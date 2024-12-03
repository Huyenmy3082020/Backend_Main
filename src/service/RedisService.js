const redisClient = require("../connect/redis");

const setValue = async (key, value) => {
  try {
    await redisClient.set(key, value);
    console.log(`Set key: ${key} with value: ${value}`);
  } catch (error) {
    console.error(`Error setting value in Redis: ${error}`);
  }
};

const getValue = async (key) => {
  try {
    const value = await redisClient.get(key);
    if (value) {
      console.log(`Get key: ${key} with value: ${value}`);
      return value;
    } else {
      console.log(`Key: ${key} not found in Redis`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting value from Redis: ${error}`);
    return null;
  }
};

module.exports = {
  setValue,
  getValue,
};
