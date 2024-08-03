const express = require("express");
// import middlewares
const { validateToken } = require("../middlewares/AuthMiddleWare");

// import auth controllers
const {
  createDiscount,
  getAllDiscount,
  getDiscount,
  updateDiscount,
  deleteDiscount,
} = require("../controller/Discount.Controller");

const router = express.Router();

// User Account Router
router.post("/create/", validateToken, createDiscount);
router.put("/update/:id", validateToken, updateDiscount);
router.get("/get/:id", validateToken, getDiscount);
router.get("/get/", validateToken, getAllDiscount);
router.delete("/delete/:id", validateToken, deleteDiscount);

module.exports = router;
