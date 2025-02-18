const UserRouter = require("../routes/UserRouter");
const CategoryRouter = require("../routes/CategoryRouter");
const SuppelierRouter = require("../routes/SuppelierRouter");
const IngredientRouter = require("./IngredientRoutes");
const CartRouter = require("../routes/CartRouter");
const GoodDeliveriesRouter = require("../routes/GoodDeliveryRouter");
const ShipmentRouter = require("../routes/ShipmentRouter");
const InventoryRouter = require("../routes/InventoryRouter");
const SendMailRouter = require("../routes/SendMailRouter");

const routes = (app) => {
  app.use("/user", UserRouter);
  app.use("/category", CategoryRouter);
  app.use("/supplier", SuppelierRouter);
  app.use("/ingredient", IngredientRouter);
  app.use("/cart", CartRouter);
  app.use("/good", GoodDeliveriesRouter);
  app.use("/shipment", ShipmentRouter);
  app.use("/inventor", InventoryRouter);
  app.use("/sendMail", SendMailRouter);
};
module.exports = routes;
