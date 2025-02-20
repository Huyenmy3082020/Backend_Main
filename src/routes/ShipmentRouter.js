const express = require("express");
const GoodShipmentController = require("../controller/GoodShipmentController");
const { authenticateToken } = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/", GoodShipmentController.createGoodsShipment);

module.exports = router;
