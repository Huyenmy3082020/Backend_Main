const User = require("../models/UserModel");
const UserService = require("../service/UserService");

require("dotenv").config();
const Jwtservice = require("../service/JwtService");

const createUser = async (req, res) => {
  try {
    const { email, password, avatar, phone } = req.body;
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.status(400).json({
        status: "err",
        message: "Email đã tồn tại ! Vui lòng thử lại",
      });
    }

    const response = await UserService.createUser(
      email,
      password,
      avatar,
      phone
    );

    return res.status(201).json(response); // Trả về thông tin người dùng sau khi tạo thành công
  } catch (error) {
    return res.status(500).json({
      status: "err",
      message: error.message,
    });
  }
};

const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = reg.test(email);

    if (!email || !password) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(400).json({
        status: "ERR",
        message: "Vui lòng nhập đúng email",
      });
    }

    const response = await UserService.loginUser({ email, password });

    // Kiểm tra nếu có lỗi trong response
    if (response.status === "ERR") {
      return res.status(400).json({
        status: "ERR",
        message: response.message,
      });
    }

    const { refreshToken, ...data } = response;

    // Gửi refresh token qua cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json({
      ...data,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "ERR",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;

    if (!userId) {
      return res.status(400).json({
        status: "err",
        err: "the user id is not defind",
      });
    }
    const response = await UserService.updateUser(userId, data);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        status: "err",
        err: "the user id is not defind",
      });
    }

    const response = await UserService.deleteUser(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const getAll = async (req, res) => {
  try {
    const response = await UserService.getAll();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const getAllUserbyId = async (req, res) => {
  try {
    const id = req.params.id;

    const response = await UserService.getAllUserbyId(id);
    if (response.data) {
      return res.status(200).json(response);
    } else {
      return res.status(404).json({
        status: "err",
        mess: "User not found",
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: "err",
      mess: error.message || "An error occurred",
    });
  }
};

const refreshTokenController = async (req, res) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    console.log(refresh_token);
    if (!refresh_token) {
      return res.status(400).json({
        status: "err",
        message: "Refresh token is required",
      });
    }

    const result = await Jwtservice.refreshToken(refresh_token);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json({
      status: "OK",
      message: "Logout successfully",
    });
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

module.exports = {
  createUser,
  loginUserController,
  updateUser,
  deleteUser,
  getAll,
  getAllUserbyId,
  logoutUser,
  refreshTokenController,
};
