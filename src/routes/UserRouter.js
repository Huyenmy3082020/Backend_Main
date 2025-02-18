const express = require("express");
const router = express.Router();
const UserController = require("../controller/UserController");

const { authenticateToken } = require("../middleware/authmiddleware");

router.post("/sign-up", UserController.createUser);
router.post("/sign-in", UserController.loginUserController);
router.post("/logout", UserController.logoutUser);
router.put("/update-user", authenticateToken, UserController.updateUser);
router.delete("/delete-user", authenticateToken, UserController.deleteUser);
router.get("/getALl", UserController.getAll);
router.get("/getUser", authenticateToken, UserController.getAllUserbyId);
router.post("/refreshtoken", UserController.refreshTokenController);
router.post("/logout", UserController.logoutUser);

module.exports = router;
