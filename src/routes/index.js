const UserRouter = require("../routes/UserRouter");
const ProductRouter = require("../routes/ProductRouter");
const OrderRouter = require("../routes/OrderRouter");
const CategoryRouter = require("../routes/CategoryRouter");
const CartRouter = require("../routes/CartRouter");
const RedisRouter = require("../routes/RedisRouter");
const ShipRouter = require("../routes/ShipRouter");
const routes = (app) => {
  app.use("/user", UserRouter);
  app.use("/product", ProductRouter);
  app.use("/order", OrderRouter);
  app.use("/category", CategoryRouter);
  app.use("/cart", CartRouter);
  app.use("/redis", RedisRouter);
  app.use("/ship", ShipRouter);
};

module.exports = routes;
