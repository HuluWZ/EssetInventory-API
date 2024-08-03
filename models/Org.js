const mongoose = require("mongoose");
const { USER_TYPES, PAYMENT_METHODS } = require("../config/utils");

const OrgSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique:[true,"Org Name is unique"],
      required: [true, "Org Name is required"],
    },
    phoneNumber: {
      type: String,
      trim: true,
      unique: [true, "Org Phone Number is Unique"],
      required: [true, "Org Phone Number is required"],
    },
    email: {
      type: String,
      unique: [true, "Org Email is Unique"],
      required: [true, "Org Email is Required"],
    },
    tinNumber:{
      type: String,
      required: [true, "Tin Number is required"],
      unique:[true,"Tin Number is unique"]
    },
    address: {
      type: String,
      trim: true,
      required: [true, "Organization Address is Required"],
    },
    createdBy: {
      type: String,
      required: [true,"Org Created By is Required"],
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Org", OrgSchema, "Org");