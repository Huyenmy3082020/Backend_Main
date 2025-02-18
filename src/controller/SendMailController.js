const sendEmailService = require("../service/SendMailService");

exports.sendEmailController = async (req, res) => {
  try {
    const { email } = req.body;

    const emailResponse = await sendEmailService(email); // Đổi tên biến

    return res.status(200).json({
      // Sử dụng lại res của Express
      success: emailResponse.success,
      message: emailResponse.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi gửi email!",
      error: error.message,
    });
  }
};
