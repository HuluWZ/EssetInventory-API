const express = require("express");
// import middlewares
const { validateToken } = require("../middlewares/AuthMiddleWare");
const { uploadProductImage ,cloudUploadTry,productImport } = require("../middlewares/FileUploadMiddleWare");

// import auth controllers
const {
  createProduct,
  getAllProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  stockAlert,
  importProduct,
  exportProduct
} = require("../controller/Product.Controller");

const router = express.Router();

// User Account Router
router.post("/create/", validateToken, uploadProductImage, createProduct);
router.put("/update/:id", validateToken, uploadProductImage, updateProduct);
router.get("/get/:id", validateToken, getProduct);
router.get("/get/", validateToken, getAllProduct);
router.delete("/delete/:id", validateToken, deleteProduct);
router.get("/stock", validateToken, stockAlert);
router.get("/import", validateToken, productImport, importProduct);
router.get("/export", validateToken, exportProduct);

module.exports = router;
