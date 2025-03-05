const UserRouter = require("../routes/UserRouter");
const CategoryRouter = require("../routes/CategoryRouter");
const SuppelierRouter = require("../routes/SuppelierRouter");
const ingredientRoutes = require("../routes/ingredientRoutes");
const GoodDeliveriesRouter = require("../routes/GoodDeliveryRouter");
const ShipmentRouter = require("../routes/ShipmentRouter");
const InventoryRouter = require("../routes/InventoryRouter");
const {
  authenticateToken,
  authenticateIsAdmin,
} = require("../middleware/authmiddleware");

const routes = (app) => {
  app.use("/user", UserRouter);
  app.use("/category", CategoryRouter);
  app.use("/supplier", SuppelierRouter);
  app.use("/ingredient", ingredientRoutes);
  app.use("/good", GoodDeliveriesRouter);
  app.use("/shipment", ShipmentRouter);
  app.use("/inventor", InventoryRouter);
};
module.exports = routes;
