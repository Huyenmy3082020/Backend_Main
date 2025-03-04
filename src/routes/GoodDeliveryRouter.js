const express = require("express");
const GoodsDeliveryController = require("../controller/GoodDeliveriesController");

const {
  authMiddleware,
  authenticateToken,
  authenticateIsAdmin,
} = require("../middleware/authmiddleware");

const router = express.Router();

router.post(
  "/",
  authenticateIsAdmin,
  GoodsDeliveryController.createGoodsDelivery
);
// v1 la chi xac nhan don hang thoi
router.post(
  "/v1",
  authenticateToken,
  GoodsDeliveryController.createGoodsDeliveryV1
);
router.get(
  "/getAll",
  authenticateToken,
  GoodsDeliveryController.getAllGoodsDeliveries
);

router.put(
  "/:id",
  authenticateIsAdmin,
  GoodsDeliveryController.updateGoodsDelivery
);
router.delete(
  "/:id",
  authenticateToken,
  GoodsDeliveryController.deleteGoodsDelivery
);

module.exports = router;
