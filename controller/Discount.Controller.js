const Discount = require("../models/Discount");
const { sign } = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

exports.createDiscount = async (req, res, next) => {
  try {
    const DiscountData = req.body;
     const newDiscount = await Discount.create(DiscountData);
    // console.log(DiscountData)
    newDiscount.org = req.org;
    res
      .status(201)
      .send({ newDiscount, message: "Discount Created Saved Succesfully !" });

    await newDiscount.save();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getDiscount = async (req, res) => {
  try {
    const id = req.params.id;
    const discount = await Discount.find({ _id: id, org: req.org }).populate(
      "product"
    );
    console.log(discount);
    if (!discount || discount.length == 0) {
      res.status(404).json({ message: "Discount Doestn't Exist!" });
      return;
    }
    return res.status(200).json(discount);
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.getAllDiscount = async (req, res) => {
  try {
    console.log(req.user);
    const discount = await Discount.find({
      org: req.org,
    }).populate("product");
    return res.status(200).json({ "Total Discounts ": discount.length, discount });
  } catch (error) {
    return res.status(404).send({ message: error });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    const DiscountId = req.params.id;
    const newUpdates = req.body;
    console.log(newUpdates);
    const updatedDiscount = await Discount.findOneAndUpdate(
      { _id: DiscountId, org: req.org },
      newUpdates,
      {
        new: true,
      }
    );

    return res
      .status(200)
      .send({ message: "Discount Updated Succesfully !", updatedDiscount });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.deleteDiscount = async (req, res) => {
  try {
    await Discount.deleteOne({ _id: req.params.id ,org:req.org});
    return res
      .status(200)
      .send({ message: "Discount has been Deleted Succesfully !" });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};
