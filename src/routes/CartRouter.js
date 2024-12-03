const express = require("express");
const router = express.Router();
const CartController = require("../controller/CartController");
const {
  authUserMiddleware1,
  authUserMiddleware,
} = require("../middleware/authmiddleware");
router.post("/createCart/:id", authUserMiddleware, CartController.createCart);
router.get("/getCartByUser/:id", CartController.getCartByUser);
router.get("/getAllCart", CartController.getAllCart);
router.get("/getAllProductByCart/:id", CartController.getAllProductByCart);
router.get("/getCartById/:userId/:cartId", CartController.getCartById);
router.put("/alterAmount", CartController.alterAmount);
router.delete("/delete", CartController.deleteAllCard);
router.delete("/deleteSoft", CartController.deleteSoft);
router.put("/updateShipCart", CartController.updateShipCart);

module.exports = router;
