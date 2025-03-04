const User = require("../models/UserModel");
const UserService = require("../service/UserService");

require("dotenv").config();
const Jwtservice = require("../service/JwtService");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  try {
    const { email, password, avatar, phone, name } = req.body;
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
      phone,
      name
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

    if (!email || !password) {
      return res.status(400).json({
        status: "ERR",
        message: "Thiếu email hoặc mật khẩu",
      });
    }

    // Gọi service để xử lý đăng nhập
    const response = await UserService.loginUser({ email, password });

    if (response.status === "ERR") {
      return res.status(400).json(response);
    }

    // ✅ Lưu accessToken vào cookie
    res.cookie("access_token", response.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    // ✅ Lưu refreshToken vào cookie
    res.cookie("refresh_token", response.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    return res.json({
      status: "OK",
      message: "Đăng nhập thành công",
      access_token: response.accessToken,
    });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Lỗi server",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    // Lấy userId từ req.user (đã được gán trong middleware authenticateToken)
    const userId = req.user.id; // Chắc chắn rằng middleware authenticateToken gán id vào req.user
    const data = req.body;

    // Nếu không có userId thì trả về lỗi
    if (!userId) {
      return res.status(400).json({
        status: "err",
        err: "User not found in token",
      });
    }

    const response = await UserService.updateUser(userId, data);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message || error,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    // Lấy userId từ req.user (đã được gán trong middleware authenticateToken)
    const userId = req.user.id; // Chắc chắn rằng middleware authenticateToken gán id vào req.user

    // Nếu không có userId thì trả về lỗi
    if (!userId) {
      return res.status(400).json({
        status: "err",
        err: "User not found in token",
      });
    }

    const response = await UserService.deleteUser(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message || error,
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
    // ✅ Kiểm tra req.user có tồn tại không
    if (!req.user || !req.user.id) {
      return res.status(401).json({ status: "err", mess: "Unauthorized" });
    }

    const userId = req.user.id;

    // ✅ Gọi service lấy dữ liệu người dùng
    const response = await UserService.getAllUserById(userId);

    if (response.status === "ok") {
      return res.status(200).json(response);
    } else {
      return res.status(404).json(response);
    }
  } catch (error) {
    console.error("❌ Lỗi trong getAllUserbyId:", error);
    return res.status(400).json({
      status: "err",
      mess: error.message || "An error occurred",
    });
  }
};

const refreshTokenController = async (req, res) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    if (!refresh_token) {
      return res.status(400).json({
        status: "error",
        message: "Refresh token is required",
      });
    }

    const result = await Jwtservice.refreshToken(refresh_token);

    if (result.status !== "success") {
      return res.status(401).json(result);
    }

    // 🔥 Set access_token vào HttpOnly cookie
    res.cookie("access_token", result.data.access_token, {
      httpOnly: true, // Không cho JS truy cập
      secure: false, // Chỉ gửi qua HTTPS
      sameSite: "Strict", // Ngăn chặn CSRF
    });

    return res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
    });
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
