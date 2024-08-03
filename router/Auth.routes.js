const express = require("express");
// import middlewares
const { validateToken } = require("../middlewares/AuthMiddleWare");
// import auth controllers
const {
  createAccount,
  login,
  verifyAccount,
  updateAccount,
  deleteAccount,
  getUser,
  getCurrentUser,
  getAll,
  logOut,
} = require("../controller/Auth.Controller");

const router = express.Router();

// User Account Router
router.post("/create/", createAccount);
router.post("/verify/", validateToken, verifyAccount);
router.post("/login/", login);
router.put("/update/:id", validateToken, updateAccount);
router.get("/currentuser/", validateToken, getCurrentUser);
router.get("/get/:id", validateToken, getUser);
router.get("/get/", validateToken, getAll);
router.delete("/delete/:id", validateToken, deleteAccount);
router.get("/logout", validateToken, logOut);

module.exports = router;
