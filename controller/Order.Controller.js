const Order = require("../models/Order");
const Category = require("../models/Category");
const Discount = require("../models/Discount")
const Product = require("../models/Product");
const { sign } = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const mongoose = require("mongoose")
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
const { query } = require("express");

exports.createOrder = async (req, res, next) => {
  try {
    const OrderData = req.body;
    const newOrder = await Order.create(OrderData);
    // console.log(OrderData)
    newOrder.org = req.org;
    res
      .status(201)
      .send({ newOrder, message: "Order Created Saved Succesfully !" });

    await newOrder.save();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const id = req.params.id;
    // console.log(req.org)
    const order = await Order.find({ _id: id,org:req.org }).populate("items.product");
    console.log(order);
    if (!order || order.length == 0) {
      res.status(404).json({ message: "Order Doestn't Exist!" });
      return;
    }
    return res.status(200).json({order,message:"Success"});
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.getAllOrder = async (req, res) => {
  try {
    console.log(req.user);
    const order = await Order.find({
      org: req.org,
    }).populate("items.product");
    return res
      .status(200)
      .json({ "Total Orders ": order.length, "Orders":order });
  } catch (error) {
    return res.status(404).send({ message: error });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const OrderId = req.params.id;
    const newUpdates = req.body;
    console.log(newUpdates);
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: OrderId, org: req.org },
      newUpdates,
      {
        new: true,
      }
    );

    return res
      .status(200)
      .send({ message: "Order Updated Succesfully !", updatedOrder });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.deleteOne({ _id: req.params.id,org:req.org });
    return res
      .status(200)
      .send({ message: "Order has been Deleted Succesfully !" });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};


exports.approveOrder = async (req, res) => {
  try {
    const OrderId = req.params.id;
    const newUpdates = req.body;
    console.log(newUpdates);
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: OrderId, org: req.org },
      { status: "Approved" },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .send({ message: "Order Approved Succesfully !", "ApprovedOrder":updatedOrder });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.orderReport = async (req, res) => {
  try {
    const orders = await Order.find({
      org: req.org,
    }).populate("items.product");

    console.log(orders[0]._id);
    var allReport = [];

    await Promise.all(
      orders.map(
        async ({ _id, fullName,email,phoneNumber,address,city,orderDate,paymentMethod,description, items }) => {
          var productItem = [];
          var price = 0;
          for (let item of items) {
            const productId = item.product;
            const productInfo = await Product.findOne({
              _id: productId,
            }).populate("category");
            const productName = productInfo.name;
            // console.log(productInfo.name);

            // TODO Check for Discount
            // console.log(orderDate, productId);
            const discount = await Discount.findOne
              ({ product: productId, startDate: { $lte: orderDate },endDate:{$gte:orderDate}});
            const rate = discount ? discount.rate : 0
            // console.log({ product: productId, startDate: { $lte: orderDate }});
            const categoryName = productInfo.category.name
            // console.log(productInfo.category)
            const sellingPrice = productInfo.sellingPrice;
            const initialQuantity = productInfo.initialQuantity;
            const quantity = item.quantity;
            const discountValue = (sellingPrice * rate)/100;
            price += quantity * (sellingPrice - discountValue);
            // console.log(price, discountValue, sellingPrice);
            productItem.push({
              productName,
              categoryName:categoryName,
              isDiscount: rate > 0 ? true : false,
              discountValue: discountValue,
              quantity,
              unitPrice: sellingPrice,
            });
            // console.log(productItem);
          }
          
          
          allReport.push({
            _id,
            orderOwnerInfo: { fullName, phoneNumber,email,address,city,orderDate },
            description,
            orderDate,
            paymentMethod,
            items: productItem,
            itemOrders: price,
          });
          // console.log(allReport,productItem);
        }

      )
    );
     const AllSales = allReport.reduce((accumulator, object) => {
       return accumulator + object.itemOrders;
     }, 0);


    return res
      .status(200)
      .send({ message: "Orders Report Generated Succesfully !","Total Orders":AllSales.toFixed(2), allReport });
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
    var thisWeekReport = []
    const namesOfWeek  = ["Sunday", "Monday","Tuesday", "Wednesday","Thursday","Friday","Saturday"]
    let currentWeek = thisWeek.map((week) => week.toISOString().split("T")[0]);
     console.log(currentWeek)
     var weeklyReports = {}
   const result = await Promise.all(currentWeek.map(async (today) => {
     const dayName = namesOfWeek[new Date(today).getDay()]
      const todaymax = `${today}T23:59:59`;
     const todaymin = `${today}T00:01:10`;
       const quary = { $lte: todaymax, $gte: todaymin };


      let items = await Order.find({ org: req.org, createdAt: quary }).select({ items: 1, _id: 0 });
      // console.log(dayName, today, items);
      weeklyReports[dayName] =
        !items || items.length == 0
          ? 0
          : items
              .map((item) => {
                console.log(item);
                // console.log("Hi");
                let vals = item.items.reduce((acc, a) => {
                  // console.log(a)
                  return acc + a.quantity;
                }, 0);
                // console.log("Sum", vals);
                return vals;
              })
              .reduce((partialSum, a) => partialSum + a, 0);
      
      thisWeekReport.push(weeklyReports);
      // console.log(weeklyReports);
    //  return weeklyReports;
      }));
    
    // console.log(result)
    // console.log(thisWeekReport)

    return res.status(200).send({
      message: `This Week Orders Report ${currentWeek[0]} -> ${currentWeek[6]}`,
      weeklyOrdersReport:thisWeekReport[thisWeekReport.length-1],
    });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};