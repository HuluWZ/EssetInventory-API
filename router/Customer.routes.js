const express = require("express");
// import middlewares
const { validateToken } = require("../middlewares/AuthMiddleWare");

// import auth controllers
const {
  createCustomer,
  getAllCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controller/Customer.Controller");

const router = express.Router();

// User Account Router
router.post("/create/", validateToken, createCustomer);
router.put("/update/:id", validateToken, updateCustomer);
router.get("/get/:id", validateToken, getCustomer);
router.get("/get/", validateToken, getAllCustomer);
router.delete("/delete/:id", validateToken, deleteCustomer);

module.exports = router;
