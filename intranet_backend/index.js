const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

module.exports = app;

app.use(cors());
app.use(bodyParser.json());

//Routes
const manualRoutes = require("./routes/manual_routes");
const productDataRoutes = require("./routes/product_data_routes");
const storefrontRoutes = require("./routes/storefront_routes");
const orderingRoutes = require("./routes/ordering_routes");
const vendorInfoRoutes = require("./routes/vendor_info_routes");
const receivingRoutes = require("./routes/receiving_routes");

app.use("/manual", manualRoutes);
app.use("/productdata", productDataRoutes);
app.use("/storefront", storefrontRoutes);
app.use("/ordering", orderingRoutes);
app.use("/vendorinfo", vendorInfoRoutes);
app.use("/receiving", receivingRoutes);

//Middleware
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.log("error");
  if (!err.status) {
    err.status = 500;
  }
  res.status(err.status);
  res.send("error");
});

app.listen(4000, () => {
  console.log("The server is running on localhost:4000!");
});
