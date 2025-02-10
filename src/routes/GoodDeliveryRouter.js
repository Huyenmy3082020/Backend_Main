const express = require("express");
const GoodsDeliveryController = require("../controller/GoodDeliveriesController");

const router = express.Router();

// Thêm phiếu nhập hàng
router.post("/", GoodsDeliveryController.createGoodsDelivery);

// Sửa phiếu nhập hàng
router.put("/:id", GoodsDeliveryController.updateGoodsDelivery);

// Xóa phiếu nhập hàng
router.delete("/:id", GoodsDeliveryController.deleteGoodsDelivery);

module.exports = router;
