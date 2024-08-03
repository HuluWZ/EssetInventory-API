const express = require("express");
// import middlewares
const { validateToken } = require("../middlewares/AuthMiddleWare");
// import auth controllers
const {
  createOrg,updateOrg,getOrg,getAllOrg,deleteOrg
  
} = require("../controller/Org.Controller");

const router = express.Router();

// User Account Router
router.post("/create/", createOrg);
router.put("/update/:id", validateToken,updateOrg);
router.get("/get/:id",validateToken ,getOrg);
router.get("/get/", validateToken,getAllOrg);
router.delete("/delete/:id",validateToken,deleteOrg);

module.exports = router;
