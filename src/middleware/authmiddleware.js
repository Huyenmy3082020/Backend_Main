const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      mess: "Token xác thực không được cung cấp",
      status: "ERROR",
    });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      mess: "Token xác thực không hợp lệ",
      status: "ERROR",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      return res.status(403).json({
        mess: "Token xác thực không hợp lệ",
        status: "ERROR",
      });
    }
    if (user?.role === "admin") {
      next();
    } else {
      return res.status(403).json({
        mess: "Quyền truy cập bị từ chối",
        status: "ERROR",
      });
    }
  });
};

const authUserMiddleware = (req, res, next) => {
  const userId = req.params.id;
  const authHeader = req.headers.authorization;

  console.log(userId);
  console.log(authHeader);
  if (!authHeader) {
    return res.status(401).json({
      mess: "Token xác thực không được cung cấp",
      status: "ERROR",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      mess: "Token xác thực không hợp lệ",
      status: "ERROR",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      return res.status(403).json({
        mess: "Token xác thực không hợp lệ ưdwewd",
        status: "ERROR",
      });
    }
    if (user?.id === userId) {
      next();
    } else {
      return res.status(403).json({
        mess: "Quyền truy cập bị từ chối",
        status: "ERROR",
      });
    }
  });
};

module.exports = { authMiddleware, authUserMiddleware };
