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
const connectDB = require("../config/mongodb");
const startRedisSync = require("./sync/syncdb");
startRedisSync();
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:7000",
    credentials: true,
  })
);
app.use(
  cors({
    origin:
      "https://front-end-nmcnpm-final-e59xaqj11-huyenmy3082020s-projects.vercel.app",
    credentials: true,
  })
);

app.use(errorHandler);
routes(app);

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});
connectDB();
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
