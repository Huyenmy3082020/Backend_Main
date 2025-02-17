const express = require("express");
const GoodShipmentController = require("../controller/GoodShipmentController");

const router = express.Router();

router.post("/", GoodShipmentController.createGoodsShipment);

module.exports = router;
