const express = require("express");
// import middlewares
const { validateToken } = require("../middlewares/AuthMiddleWare");

// import auth controllers
const {
  createSales,
  getAllSales,
  getSales,
  updateSales,
  deleteSales,
  salesReport,
  weeklyReport
} = require("../controller/Sales.Controller");

const router = express.Router();

// User Account Router
router.post("/create/", validateToken, createSales);
router.put("/update/:id", validateToken, updateSales);
router.get("/get/:id", validateToken, getSales);
router.get("/get/", validateToken, getAllSales);
router.delete("/delete/:id", validateToken, deleteSales);
router.get("/report", validateToken, salesReport);
router.get("/week",validateToken,weeklyReport)

module.exports = router;
