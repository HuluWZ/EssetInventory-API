const Org  = require("../models/Org");
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

exports.createOrg = async (req, res, next) => {
  try {
    const userData = req.body;
    const phoneNumber = userData.phoneNumber;
    const email = userData.email;

    const phoneORemailExist = await Org.findOne({
      $or: [{ phoneNumber }, { email }],
    });
    // userData.userId = await getLastUserId();
    // console.log("Welcome")
    if (phoneORemailExist) {
      res.status(400).send({ message: "Phone Number or Email already exist!" });
      return;
    }
    const newUser = await Org.create(userData);

  
    res
      .status(201)
      .send({org: newUser, message: "Organization Created Saved Succesfully !" });

    await newUser.save();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.updateOrg = async (req, res, next) => {
  try {
    const newUserInfo = req.body;
    const userID = req.params.id;
    const user = await Org.findById(userID);

    if (!user) {
      return res.status(404).send({ message: "Organization is not found!." });
    }
    const updatedUser = await Org.findOneAndUpdate(
      { _id: userID },
      newUserInfo,
      { new: true }
    );
    return res
      .status(202)
      .send({ updatedUser, message: "Organization Profile Updated Succesfully !" });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};

exports.deleteOrg = async (req, res) => {
  try {
    await Org.deleteOne({ _id: req.params.id });
    return res
      .status(200)
      .send({ message: "Organization has been Deleted Succesfully !" });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};

exports.getOrg = async (req, res) => {
  try {
    const deactivatedUser = await Org.findOne({ _id: req.params.id });
    return res.status(202).send({
      "Org ":!deactivatedUser || deactivatedUser.length == 0 ? "No Org Found" :deactivatedUser
    });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};
exports.getAllOrg = async (req, res) => {
  try {
    const getAll = await Org.find({});
    return res.status(202).send({
      Orgs: getAll,
    });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};
