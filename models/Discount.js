const mongoose = require("mongoose");
const { USER_TYPES } = require("../config/utils");

const DiscountSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, "Discount Name is Unique"],
      required: [true, "Discount Name is required"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    rate: {
      type: Number,
      min: 1,
      max:100,
      required: [true, "Discount rate is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Discount Start Date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Discount End Date is required"],
    },
    org: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Org",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discount", DiscountSchema, "Discount");
