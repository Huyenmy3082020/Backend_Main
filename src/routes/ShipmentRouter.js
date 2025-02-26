const express = require("express");
const GoodShipmentController = require("../controller/GoodShipmentController");
const { authenticateToken } = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/", GoodShipmentController.createGoodsShipment);
router.post(
  "/redis",
  authenticateToken,
  GoodShipmentController.createGoodsShipmentRedis
);
router.get("/getAll", GoodShipmentController.getAllShipment);

module.exports = router;
