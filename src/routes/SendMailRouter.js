const express = require("express");
const router = express.Router();
const SendMailController = require("../controller/SendMailController");

router.post("/", SendMailController.sendEmailController);

module.exports = router;
