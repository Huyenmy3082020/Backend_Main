const express = require("express");
const router = express.Router();
const supplierController = require("../controller/SupperlierController");

router.get("/", supplierController.getAllSuppliers);

module.exports = router;
