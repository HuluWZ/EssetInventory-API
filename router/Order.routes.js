const express = require("express");
// import middlewares
const { validateToken } = require("../middlewares/AuthMiddleWare");

// import auth controllers
const {
  createOrder,
  getAllOrder,
  getOrder,
  updateOrder,
  deleteOrder,
  orderReport,
  approveOrder,
  weeklyReport
} = require("../controller/Order.Controller");

const router = express.Router();

// User Account Router
router.post("/create/", validateToken, createOrder);
router.put("/update/:id", validateToken, updateOrder);
router.get("/get/:id", validateToken, getOrder);
router.get("/get/", validateToken, getAllOrder);
router.delete("/delete/:id", validateToken, deleteOrder);
router.get("/report", validateToken, orderReport);
router.get("/approve/:id", validateToken, approveOrder);
router.get("/week", validateToken, weeklyReport);


module.exports = router;
