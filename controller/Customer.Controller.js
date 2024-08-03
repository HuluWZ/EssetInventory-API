const { Customer } = require("../models/User");
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

exports.createCustomer = async (req, res, next) => {
  try {
    const CustomerData = req.body;
    const newCustomer = await Customer.create(CustomerData);
    // console.log(CustomerData)
    newCustomer.org = req.org;
    res
      .status(201)
      .send({ newCustomer, message: "Customer Created Saved Succesfully !" });

    await newCustomer.save();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    const customer = await Customer.find({ _id: id, org: req.org });
    console.log(customer);
    if (!customer || customer.length ==0) {
      res.status(404).json({ message: "Customer Doestn't Exist!" });
      return;
    }
    return res.status(200).json(customer);
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.getAllCustomer = async (req, res) => {
  try {
    const customer = await Customer.find({
      org: req.org,
    });
    return res
      .status(200)
      .json({ "Total Customers ": customer.length, customer });
  } catch (error) {
    return res.status(404).send({ message: error });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const CustomerId = req.params.id;
    const newUpdates = req.body;
    // console.log(newUpdates);
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: CustomerId, org: req.org },
      newUpdates,
      {
        new: true,
      }
    );
    console.log(updatedCustomer);
    return res
      .status(200)
      .send({ message: "Customer Updated Succesfully !", updatedCustomer });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.deleteOne({ _id: req.params.id,org:req.org });
    return res
      .status(200)
      .send({ message: "Customer has been Deleted Succesfully !" });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};
