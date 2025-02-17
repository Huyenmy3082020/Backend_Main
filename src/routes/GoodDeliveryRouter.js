const express = require("express");
const GoodsDeliveryController = require("../controller/GoodDeliveriesController");

const {
  authMiddleware,
  authUserMiddleware,
  authenticateToken,
} = require("../middleware/authmiddleware");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  GoodsDeliveryController.createGoodsDelivery
); // Cần admin

// Route lấy tất cả đơn giao hàng - không cần xác thực
router.get("/getAll", GoodsDeliveryController.getAllGoodsDeliveries); // Không cần middleware

// Route cần xác thực token cho phép người dùng chỉnh sửa và xóa dữ liệu
router.put(
  "/:id",
  authenticateToken,
  authMiddleware,
  GoodsDeliveryController.updateGoodsDelivery
); // Cần authenticateToken
router.delete(
  "/:id",
  authenticateToken,
  authMiddleware,
  GoodsDeliveryController.deleteGoodsDelivery
); // Cần authenticateToken

module.exports = router;
