const Product = require("../models/Product");
const { sign } = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uploadCloud = require("../config/cloudnary");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const ObjectsToCsv = require("objects-to-csv");
const FileSaver =  require("file-saver");
const XLSX = require("xlsx");
require("dotenv").config();

const {
  PHONE_NOT_FOUND_ERR,
  PHONE_ALREADY_EXISTS_ERR,
  USER_NOT_FOUND_ERR,
  INCORRECT_OTP_ERR,
  EMAIL_ALREADY_EXISTS_ERR,
} = require("../config/errors");
const { compareSync } = require("bcrypt");
const { count } = require("../models/User");

exports.createProduct = async (req, res, next) => {
  try {
    const ProductData = req.body;
    // console.log(ProductData);
    const image = req.file;
    // console.log(image);
    const uploadCheck = await uploadCloud(image.filename)
    ProductData.image = uploadCheck.url;
    // ProductData.image = image.path;
    const newProduct = await Product.create(ProductData);

    // console.log(ProductData)
    newProduct.org = req.org;
    res
      .status(201)
      .send({ newProduct, message: "Product Created Saved Succesfully !" });

    await newProduct.save();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.find({ _id: id, org: req.org }).populate(
      "category"
    );
    console.log(product);
    if (!product || product.length == 0 ) {
      res.status(404).json({ message: "Product Doestn't Exist!" });
      return;
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.getAllProduct = async (req, res) => {
  try {
    console.log(req.user)
    const product = await Product.find({ org: req.org }).populate("category");
    return res
      .status(200)
      .json({ "Total Products ": product.length, product });
  } catch (error) {
    return res.status(404).send({ message: error });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const ProductId = req.params.id;
    const newUpdates = req.body;
    // const existingURL = await Product.findById(ProductId).select({ image: 1, _id: 0 });
    // const img = existingURL.image
    // const getPublicId = img.split("/").pop().split(".")[0];
       if (req.file) {
         const image = req.file; 
        //  console.log(image)
         const uploadCheck = await uploadCloud(image.filename);
        //  console.log(uploadCheck)
         newUpdates.image = uploadCheck.url;
    }
    // console.log(newUpdates);
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: ProductId, org: req.org },
      newUpdates,
      {
        new: true,
      }
    );

    return res
      .status(200)
      .send({ message: "Product Updated Succesfully !", updatedProduct });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.deleteOne({ _id: req.params.id ,org:req.org});
    return res
      .status(200)
      .send({ message: "Product has been Deleted Succesfully !" });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};

exports.stockAlert = async (req, res) => {
  try {
    const stockAlerts = await Product.find({
      $expr: { $lte: ["$initialQuantity", "$stockAlert"] },
    }).select({
      name: 1,
      category: 1,
      initialQuantity: 1,
      stockAlert: 1,
      buyingPrice: 1,
      image: 1,
      models:1
    });
    // return stockAlerts;
    // console.log(stockAlerts);
    // return stockAlerts;
     return res
       .status(200)
       .send({IsStockAlert:stockAlerts && stockAlerts.length !=0?stockAlerts:"NO Product " ,message: "Product Status report !" });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.ProductStockAlert = async (req, res) => {
  try {
    const stockAlerts = await Product.find({
      $expr: { $lte: ["$initialQuantity", "$stockAlert"] },
    }).select({
      name: 1,
      category: 1,
      initialQuantity: 1,
      stockAlert: 1,
      buyingPrice: 1,
    });
    // return stockAlerts;
    // console.log(stockAlerts);
    return stockAlerts;
   
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.importProduct = async (req, res) => {
  try {
    
    const results = [];
    var Alldata = [];
    const filename = req.file;
    console.log(req.file)
var workbook = XLSX.readFile(filename.originalname);
var sheet_name_list = workbook.SheetNames;
var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
// console.log(filename);t,
console.log(xlData);
const data = xlData.map(({__EMPTY,...rest})=>rest)
    var finalData=data.map((x) => ({
      ...x,
      category: Math.random() > 0.5
        ? "63e0ff22b2cd13f939d86a41"
        : "63de20cd3d51df595bfcc3bb",
      org:req.org
    }));
    // return
    const result = await Product.insertMany(finalData);
        return res
          .status(200)
          .json({Products:result, message: "Product Imported succesfully!" });

    // });

  } catch (error) {
    return res.status(404).send({ message: error });
  }
};

exports.exportProduct = async (req, res) => {
  try {
    console.log("Export", req.org)
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    // Desired file extesion
    const fileExtension = ".xlsx";
    // const data = await Product.find({ org: req.org });
    // var dts = []
    const data = await Product.find({ org: req.org }).select({ _id: 0, org: 0, createdAt: 0, updatedAt: 0 });
    var dts = [];
    dts[0] = [
      "name",
      "category",
      "description",
      "image",
      "model",
      "colors",
      "sizes",
      "initialQuantity",
      "stockAlert",
      "storeLocation",
      "buyingPrice",
      "sellingPrice",
    ];
    var output = data.map(obj => {
      const keys = Object.values(obj)[2]
      dts.push(Object.values(keys));
    });
    
    console.log(dts[1])
    const workSheet = XLSX.utils.aoa_to_sheet(dts);
        // console.log("a",workSheet);
  // Generate a Work Book containing the above sheet.
  const workBook = {
    Sheets: {
      data: workSheet,
      cols:[]
    },
    SheetNames: ["data"],
  };
    const excelBuffer = XLSX.writeFile(workBook,'product-repor1t.xlsx' ,{ bookType: "xlsx", type: "array" });
    return res.status(200).json({ message: "Product exported succesfully!" });
    // }
  } catch (error) {
    return res.status(404).send({ message: error });
  }
};
