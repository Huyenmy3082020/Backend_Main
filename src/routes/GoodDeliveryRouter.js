const express = require("express");
const GoodsDeliveryController = require("../controller/GoodDeliveriesController");
const {
  authMiddleware,
  authUserMiddleware,
} = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/", authMiddleware, GoodsDeliveryController.createGoodsDelivery);
router.get(
  "/getAll",
  authMiddleware,
  GoodsDeliveryController.getAllGoodsDeliveries
);

router.put(
  "/:id",
  authUserMiddleware,
  GoodsDeliveryController.updateGoodsDelivery
);

router.delete(
  "/:id",
  authUserMiddleware,
  GoodsDeliveryController.deleteGoodsDelivery
);

module.exports = router;
