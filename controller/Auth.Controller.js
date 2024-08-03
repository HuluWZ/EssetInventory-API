const { User } = require("../models/User");
const Org = require("../models/Org");
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

exports.createAccount = async (req, res, next) => {
  try {
    const { userData = {}, orgData = {} } = req.body;
    // const phoneNumber = userData.phoneNumber;
    const { email, password, ...other } = userData;
    const { orgEmail, name, phoneNumber, ...rest } = orgData;

    const orgInfoExist = await Org.findOne({
      $or: [{ phoneNumber }, { email: orgEmail }],
    });
    console.log(orgInfoExist);

    if (orgInfoExist) {
      return res
        .status(400)
        .send({
          message: "Phone Number or Email of Organization already exist!",
        });
    }
    const phoneORemailExist = await User.findOne({
      $or: [{ phoneNmber: userData.phoneNumber }, { email }],
    });
    console.log(phoneORemailExist);

    if (phoneORemailExist) {
      return res
        .status(400)
        .send({ message: "Phone Number or Email of User already exist!" });
    }

    const newOrg = await Org.create({
      ...rest,
      name,
      phoneNumber,
      email: orgEmail,
      createdBy: email,
    });
    const orgId = newOrg._id;
    console.log(newOrg, orgId);
    const encryptedPassword = await bcrypt.hash(password, 10);
    userData.password = encryptedPassword;
    userData.org = orgId;
    userData.role = userData.org ? "ADMIN" : userData.role;
    console.log(userData);
    const newUser = await User.create(userData);

    const token = jwt.sign(
      { user_id: newUser._id, email },
      process.env.JWT_TOKEN_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );
    // save user token
    const registeredUser = await User.findById(newUser._id).populate("org");
    newUser.token = token;

    res
      .status(201)
      .send({
        user: registeredUser,
        message: "Account Created Saved Succesfully !",
      });

    await newUser.save();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phoneNumber, email, password } = req.body;
    const query = [{ email: email }, { phoneNumber: phoneNumber }];
    const user = await User.findOne({ $or: query });
    // console.log(user,email,phoneNumber);
    if (!user) {
      res.status(404).json({ message: "User Doestn't Exist. Try Sign Up!" });
      return;
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.JWT_TOKEN_SECRET_KEY,
        {
          expiresIn: "7d",
        }
      );
      user.token = token;
      // verify User
      const updatedUser = await User.findOneAndUpdate(
        { $or: [{ email }, { phoneNumber }] },
        { is_verified: true, token: token },
        { new: true }
      );
      return res.status(200).json(updatedUser);
    }
    res.status(400).send("Invalid Credentials");
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.verifyAccount = async (req, res) => {
  try {
    const { otp, user_id } = req.body;
    const user = await User.findById(user_id);
    if (!user) {
      res.status(404).send({ message: USER_NOT_FOUND_ERR });
      return;
    }

    if (user.user_otp !== otp) {
      res.status(403).send({ message: INCORRECT_OTP_ERR });
      return;
    }

    const accessToken = sign(
      { code_name: user.code_name, id: user.id, user_type: user.user_type },
      process.env.JWT_TOKEN_SECRET_KEY
    );

    user.user_otp = "";
    user.is_verified = true;
    user.is_active = true;
    await user.save();
    res.status(200).json({
      message: "OTP verified successfully",
      data: {
        accessToken,
        user_id: user._id,
        basic_quize: user.basicQuize,
        advanced_quize: user.advancedQuize,
        special_quize: user.specialQuize,
      },
    });
  } catch (error) {
    return res.status(404).send({ message: error });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;
    // console.log(req.user)
    const user = await User.findOne({ _id: userId, org: req.org }).populate("org");

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    return res.status(200).send(user);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.updateAccount = async (req, res, next) => {
  try {
    const newUserInfo = req.body;
    const userID = req.params.id;
    const user = await User.findOne({ _id: userID, org: req.org }).populate("org");

    if (!user) {
      return res.status(404).send({ message: USER_NOT_FOUND_ERR });
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: userID },
      newUserInfo,
      { new: true }
    );
    return res
      .status(202)
      .send({ updatedUser, message: "Profile Updated Succesfully !" });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id, org: req.org });
    return res
      .status(200)
      .send({ message: "Your Account has been Deleted Succesfully !" });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};

exports.getUser = async (req, res) => {
  try {
    const deactivatedUser = await User.findOne({ _id: req.params.id }).populate(
      "org"
    );
    return res.status(202).send({
      User:deactivatedUser? deactivatedUser: "User Not Found",
      message: " Success !",
    });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};
exports.getAll = async (req, res) => {
  try {
    const getAll = await User.find({org:req.org}).populate("org");
    return res
      .status(202)
      .send({
        Users: getAll,
      });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};

exports.logOut = async (req, res) => {
  try {

    // const authHeader = req.headers["authorization"];
    // const accessToken = authHeader.split("Bearer ")[1];
    // const logout = jwt.sign(accessToken, "", { expiresIn: 1 });

    // if (logout) { res.send({ msg: 'You have been Logged Out' }); }
    // else { res.send({ msg: 'Error' }); }
    req.user = null;
    req.org = null;
    return res.status(202).send({ message: "Logged Out Successfully." });
  } catch (error) {
    if (error.message) return res.status(404).send({ message: error.message });
    return res.status(404).send({ message: error });
  }
};
