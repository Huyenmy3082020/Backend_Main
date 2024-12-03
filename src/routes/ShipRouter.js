const express = require("express");
const router = express.Router();
const ShipController = require("../../src/controller/ShippingController");

router.post("/ship", ShipController.createShip);
router.get("/getAllShipByUser/:id", ShipController.getAllShipByUser);
router.get("/getAllShip", ShipController.getAllShip);
router.get("/getShipByCart", ShipController.getShipByCart);

module.exports = router;
