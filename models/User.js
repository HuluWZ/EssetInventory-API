const mongoose = require("mongoose");
const { USER_TYPES,PAYMENT_METHODS } = require("../config/utils");

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, "First Name is required"],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "Last Name is required"],
    },
    phoneNumber: {
      type: String,
      trim: true,
      unique: [true, "Phone Number is Unique"],
      required: [true, "Phone Number is required"],
    },
    email: {
      type: String,
      unique: [true, "Email is Unique"],
      required: [true, "Email is Required"],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required"],
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    org: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Org",
      required:[true,"Org is required"]
    },
    role: {
      type: String,
      enum: USER_TYPES,
      default: "USER",
    },
    token: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);
const CustomerSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: [true, "Full Name is required"],
    },
    phoneNumber: {
      type: String,
      trim: true,
      unique: [true, "Phone Number is Unique"],
      required: [true, "Phone Number is required"],
    },
    email: {
      type: String,
      unique: [true, "Email is Unique"],
      required: [true, "Email is Required"],
    },
    address: {
      type: String,
      trim: true,
      required: [true, "Address is required"],
    },
    city: {
      type: String,
      trim: true,
      required: [true, "City is required"],
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "Cash",
    },
    org: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Org"
    }
  },
  { timestamps: true }
);
const User =  mongoose.model("User", UserSchema, "User");
const Customer = mongoose.model("Customer", CustomerSchema, "Customer");
module.exports = {User,Customer}
