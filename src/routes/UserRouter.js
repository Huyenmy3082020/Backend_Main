const express = require("express");
const router = express.Router();
const UserController = require("../controller/UserController");

const {
  authMiddleware,
  authUserMiddleware,
} = require("../middleware/authmiddleware");

router.post("/sign-up", UserController.createUser);
router.post("/sign-in", UserController.loginUserController);
router.put("/update-user/:id", authUserMiddleware, UserController.updateUser);
router.delete("/delete-user/:id", authMiddleware, UserController.deleteUser);
router.get("/getALl", authMiddleware, UserController.getAll);
router.get("/getUser/:id", authUserMiddleware, UserController.getAllUserbyId);
router.post("/refreshtoken", UserController.refreshTokenController);
router.post("/logout", UserController.logoutUser);

module.exports = router;
