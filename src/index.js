require("dotenv").config(); // Thêm dotenv
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 2000;

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
const errorHandler = require("./middleware/errorHandler");

app.use(cors());

app.use(errorHandler);
routes(app);

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

const MONGO_DB = process.env.MONGO_DB; // Sử dụng biến môi trường
mongoose
  .connect(
    `mongodb+srv://Hahuyenmy:${MONGO_DB}@cluster0.lcgny.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    console.log("Success !!");
  })
  .catch((err) => {
    console.log(err);
  });

// Bắt đầu server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
