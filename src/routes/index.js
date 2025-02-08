const UserRouter = require("../routes/UserRouter");
const CategoryRouter = require("../routes/CategoryRouter");
const SuppelierRouter = require("../routes/SuppelierRouter");
const IngredientRouter = require("../routes/ingredientRoutes");

const routes = (app) => {
  app.use("/user", UserRouter);
  app.use("/category", CategoryRouter);
  app.use("/supplier", SuppelierRouter);
  app.use("/ingredient", IngredientRouter);
};
module.exports = routes;
