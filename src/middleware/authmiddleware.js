const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authenticateIsAdmin = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    console.log("🔑 Token:", token);

    if (!token) {
      return res.status(401).json({ status: "err", mess: "Unauthorized" });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

      if (decoded.role !== "admin") {
        return res.status(403).json({
          status: "err",
          mess: "Bạn không có quyền truy cập! Hãy đăng nhập bằng tài khoản admin.",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Lỗi xác thực token",
        error: error.message,
      });
    }
  } catch (error) {
    return res.status(403).json({
      status: "err",
      mess: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(401).json({ status: "err", mess: "Unauthorized" });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
      req.user = decoded;
      next();
    } catch (error) {
      console.error("❌ Lỗi xác thực token:", error.message);
      return res
        .status(403)
        .json({ status: "err", mess: "Forbidden: " + error.message });
    }
  } catch (error) {
    return res.status(403).json({
      status: "err",
      mess: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

module.exports = {
  authenticateToken,
  authenticateIsAdmin,
};
