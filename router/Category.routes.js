const express = require("express");
// import middlewares
const { validateToken } = require("../middlewares/AuthMiddleWare");
const { uploadProductImage } = require("../middlewares/FileUploadMiddleWare");

// import auth controllers
const {
  createCategory,
  getAllCategory,
  getCategory,
  updateCategory,
  deleteCategory
} = require("../controller/Category.Controller");

const router = express.Router();

// User Account Router
router.post("/create/", validateToken,uploadProductImage,createCategory);
router.put("/update/:id",validateToken,uploadProductImage,updateCategory);
router.get("/get/:id", validateToken, getCategory);
router.get("/get/", validateToken, getAllCategory);
router.delete("/delete/:id", validateToken, deleteCategory);

module.exports = router;
