const express = require("express");
const GoodsDeliveryController = require("../controller/GoodDeliveriesController");

const router = express.Router();

router.post("/", GoodsDeliveryController.createGoodsDelivery);
router.get("/getAll", GoodsDeliveryController.getAllGoodsDeliveries);

router.put("/:id", GoodsDeliveryController.updateGoodsDelivery);

router.delete("/:id", GoodsDeliveryController.deleteGoodsDelivery);

module.exports = router;
