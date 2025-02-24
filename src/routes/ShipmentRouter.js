const express = require("express");
const GoodShipmentController = require("../controller/GoodShipmentController");
const { authenticateToken } = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/", GoodShipmentController.createGoodsShipment);
router.post("/redis", GoodShipmentController.createGoodsShipmentRedis);

module.exports = router;
