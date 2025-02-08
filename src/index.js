const express = require("express");
const mongoose = require("mongoose"); // Khai báo mongoose không cần destructuring

const routes = require("./routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const port = 2000;

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
const errorHandler = require("./middleware/errorHandler");

app.use(
  cors({
    origin: "http://localhost:7000",
    credentials: true,
  })
);
app.use(errorHandler);
routes(app);

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});
mongoose
  .connect(
    `mongodb+srv://hatuan:Hatuan12345%40@cluster0.eocii.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    console.log("✅ Kết nối MongoDB thành công!");
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối MongoDB:", err);
  });

// Bắt đầu server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
