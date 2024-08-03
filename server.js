require("./config/db");
require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// const usersApi = require("./router/User.routes");
const authApi = require("./router/Auth.routes");
const categoryApi = require("./router/Category.routes");
const productApi = require("./router/Product.routes");
const discountApi = require("./router/Discount.routes");
const customerApi = require("./router/Customer.routes");
const salesApi = require("./router/Sales.router");
const ordersApi = require("./router/Order.routes");
const orgsApi = require("./router/Org.router");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth/", authApi);
app.use("/api/category/", categoryApi);
app.use("/api/product/", productApi);
app.use("/api/discount/", discountApi);
app.use("/api/customer/", customerApi);
app.use("/api/sales/", salesApi);
app.use("/api/orders/", ordersApi);
app.use("/api/orgs/", orgsApi);

// app.use("/api/users/", usersApi);
app.get("/", function (req, res) {
  res.send("Esset Inventory App API Gateway.");
});

app.use((err, req, res) => {
  if (err.name === "ValidationError") {
    var valErrors = [];
    Object.keys(err.errors[2]).forEach((key) =>
      valErrors.push(err.errors.message[1])
    );
    res.status(422).send(valErrors);
  }
});

const server = app.listen(process.env.PORT || 80, () =>
  console.log(`Server started at port ${process.env.PORT}`)
);
