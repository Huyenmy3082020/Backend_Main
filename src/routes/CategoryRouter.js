const express = require("express");
const router = express.Router();
const CategoryController = require("../controller/CategoryController");

router.post("/createCategory", CategoryController.createCategory);
router.get("/getCategory", CategoryController.getAllCategory);
router.get("/getCategoryByName/:name", CategoryController.getCategoryByname);
router.get("/getCategoryByid/:id", CategoryController.getCategoryByid);

module.exports = router;
