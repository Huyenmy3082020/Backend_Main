const express = require("express");
const GoodsDeliveryController = require("../controller/GoodDeliveriesController");

const {
  authMiddleware,
  authenticateToken,
  authenticateIsAdmin,
} = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/", GoodsDeliveryController.createGoodsDelivery); // Cần admin

router.get("/getAll", GoodsDeliveryController.getAllGoodsDeliveries); // Không cần middleware

router.put(
  "/:id",
  authenticateIsAdmin,
  GoodsDeliveryController.updateGoodsDelivery
); // Cần authenticateToken
router.delete(
  "/:id",
  authenticateToken,
  GoodsDeliveryController.deleteGoodsDelivery
); // Cần authenticateToken

module.exports = router;
