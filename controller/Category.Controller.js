const Category = require("../models/Category");
const { sign } = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uploadCloud = require("../config/cloudnary");

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

exports.createCategory = async (req, res, next) => {
  try {
    const categoryData = req.body;
    console.log(categoryData)
    const image = req.file;
    // console.log(image);
    const uploadCheck = await uploadCloud(image.filename);
    //  ProductData.image = uploadCheck.url;
    categoryData.image = uploadCheck.url;
    const newCategory = await Category.create(categoryData);
    // console.log(categoryData)
    newCategory.org = req.org;
    res
      .status(201)
      .send({ newCategory, message: "Category Created Saved Succesfully !" });

    await newCategory.save();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const id = req.params.id
    const category = await Category.find({ _id: id, org: req.org });
    // console.log(email);
    if (!category || category.length == 0) {
      res.status(404).json({ message: "Category Doestn't Exist!" });
      return;
    }
    return res.status(200).json({ category, message: "Success" });    
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.getAllCategory = async (req, res) => {
  try {
    const category = await Category.find({org:req.org});
    return res.status(200).json({ "Total Category ": category.length, category });    
  } catch (error) {
    return res.status(404).send({ message: error });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const newUpdates = req.body;

    if (req.file) {
      const image = req.file; 
      const uploadCheck = await uploadCloud(image.filename);
      //  ProductData.image = uploadCheck.url;
      newUpdates.image = uploadCheck.url;
      // newUpdates.image = req.file.filename;
    }
    console.log(newUpdates)
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: categoryId, org: req.org },
      newUpdates,
      {
        new: true,
      }
    );

    return res.status(200).send({ message: "Category Updated Succesfully !", updatedCategory });
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.deleteOne({ _id: req.params.id,org:req.org });
    return res
      .status(200)
      .send({ message: "Category has been Deleted Succesfully !" });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};


