const Sales = require("../models/Sales");
const Category = require("../models/Category");
const Discount = require("../models/Discount");
const { sign } = require("jsonwebtoken");
const Product = require("../models/Product");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {ProductStockAlert} = require("../controller/Product.Controller")
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

exports.createSales = async (req, res, next) => {
  try {
    const SalesData = req.body;
    // console.log(SalesData)
    const newSales = await Sales.create(SalesData);
    console.log(SalesData)
    //TODO  UPDATE PRODUCT INITAIL QUANTIT
    const items = SalesData.items;
    for (const item of items) {
      const { product, quantity } = item;
       const produtUpdate = await Product.findByIdAndUpdate(product,{$inc:{initialQuantity:-quantity}})
     }
    // console.log(produtUpdate);
        // console.log("Mah1");

        newSales.org = req.org;
    const isStockAlert = await ProductStockAlert();
        // console.log("Mah2", isStockAlert);
    // console.log("Mah3")
    res
      .status(201)
      .send({
        newSales,
        isStockAlert: !isStockAlert || isStockAlert.length !=0 ? isStockAlert : "No Alert"
        , message: "Sales Created Saved Succesfully !"
      });

    await newSales.save();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const id = req.params.id;
    const sales = await Sales.find({ _id: id, org: req.org })
      .populate("customer")
      .populate("items.product");
    console.log(sales);
    if (!sales || sales.length == 0) {
      res.status(404).json({ message: "Sales Doestn't Exist!" });
      return;
    }
    return res.status(200).json(sales);
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    console.log(req.user);
    const sales = await Sales.find({
      org: req.org,
    })
      .populate("customer")
      .populate("items.product")
    return res
      .status(200)
      .json({ "Total Saless ": sales.length, sales });
  } catch (error) {
    return res.status(404).send({ message: error });
  }
};

exports.updateSales = async (req, res) => {
  try {
    const DiscountId = req.params.id;
    const newUpdates = req.body;
    console.log(newUpdates);
    const updatedDiscount = await Sales.findOneAndUpdate(
      { _id: DiscountId, org: req.org },
      newUpdates,
      {
        new: true,
      }
    );

    const isStockAlert = await ProductStockAlert();


    return res
      .status(200)
      .send({isStockAlert: isStockAlert ?isStockAlert:"No" ,message: "Sales Updated Succesfully !", updatedDiscount });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.deleteSales = async (req, res) => {
  try {
    await Sales.deleteOne({ _id: req.params.id,org:req.org });
    return res
      .status(200)
      .send({ message: "Sales has been Deleted Succesfully !" });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};

exports.salesReport = async (req, res) => {
  try {
     const sales = await Sales.find({
       org: req.org,
     })
       .populate("customer");
    // console.log("Welcome",req.org)
    console.log(sales);
    var allReport = []
    
   await Promise.all(sales.map(async({ _id, name, customer, description, salesDate, items }) => {
      var productItem = [];
      var price = 0;
     const { fullName, phoneNumber } = customer;
    //  console.log(customer,name)
    //  console.log(customer)
      for (let item of items) {
        const productId = item.product;
        console.log(item);
        const productInfo = await Product.findOne({_id: productId}).populate("category");
        const productName = productInfo.name;
        console.log(productInfo.category);
        // const categoryId = productInfo.category._id;
        //TODO Check for Discount
         const discount = await Discount.findOne({
           product: productId,
           startDate: { $lte: salesDate },
           endDate: { $gte: salesDate },
         });
        // console.log(discount)
         const rate = discount ? discount.rate : 0;
        // const categoryName = await Category.findOne({ _id: categoryId }).select({name:1,_id:0});
        const categoryName = productInfo.category.name
        const sellingPrice = productInfo.sellingPrice;
        const initialQuantity = productInfo.initialQuantity;
        const quantity = item.quantity;
        const discountValue = (sellingPrice * rate) / 100;
        price += quantity * (sellingPrice - discountValue);
        productItem.push({
          productName, categoryName: categoryName,
          isDiscount: rate > 0 ? true : false,
          discountValue: discountValue,
          quantity,
          unitPrice: sellingPrice
        });
        console.log(productItem)
      };
    
      allReport.push({ _id,name, customer: { fullName,phoneNumber },description,salesDate,items:productItem,itemSales:price });
    }));
    const AllSales = allReport.reduce((accumulator, object) => {
      return accumulator + object.itemSales;
    }, 0);
    return res
      .status(200)
      .send({ message: "Sales Report Generated Succesfully !",TotalSales:AllSales.toFixed(2), allReport });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.weeklyReport = async (req, res) => {
  try {
    let thisWeek = Array.from(Array(7).keys()).map((idx) => {
      const d = new Date();
      d.setDate(d.getDate() - d.getDay() + idx);
      return d;
    });
    var thisWeekReport = [];
    const namesOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let currentWeek = thisWeek.map((week) => week.toISOString().split("T")[0]);
    console.log(currentWeek);
    var weeklyReports = {};
    const result = await Promise.all(
      currentWeek.map(async (today) => {
        const dayName = namesOfWeek[new Date(today).getDay()];
        const todaymax = `${today}T23:59:59`
        const todaymin = `${today}T00:01:10`
        const quary = { $lte: todaymax, $gte: todaymin };
        let items = await Sales.find({ org: req.org, createdAt:quary }).select(
          { items: 1, _id: 0 }
        );
        console.log(dayName, items);
        weeklyReports[dayName] =
          !items || items.length == 0
            ? 0
          : items.map((item) => {
                // console.log(item);
                // console.log(item);
                let vals = item.items.reduce((acc, a) => {
                  // console.log(a)
                  return acc + a.quantity;
                }, 0);
                // console.log("Sum", vals);
                return vals;
            }).reduce((partialSum, a) => partialSum + a, 0);
        // console.log(weeklyReports)

        thisWeekReport.push(weeklyReports);
        // console.log(weeklyReports);
        //  return weeklyReports;
      })
    );

    // console.log(result)
    // console.log(thisWeekReport[thisWeekReport.length-1])

    return res.status(200).send({
      message: `This Week Sales Report ${currentWeek[0]} -> ${currentWeek[6]}`,
      weeklySalesReport: thisWeekReport[thisWeekReport.length - 1],
    });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};