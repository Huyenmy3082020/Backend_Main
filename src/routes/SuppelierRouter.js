const express = require("express");
const router = express.Router();
const supplierController = require("../controller/SupperlierController");
const {
    authenticateToken ,
} = require("../middleware/authmiddleware"); 

router.get("/", authenticateToken,  supplierController.getAllSuppliers);

module.exports = router;
