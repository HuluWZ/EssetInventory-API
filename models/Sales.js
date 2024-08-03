const mongoose = require("mongoose");
const { USER_TYPES } = require("../config/utils");

const SalesSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, "Discount Name is Unique"],
      required: [true, "Discount Name is required"],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Sales Product  is required"],
      },
      quantity: {
        type: Number,
        min: 1,
        required: [true, "Sales Quantity  is required"],
      }
    }],
    salesDate: {
      type: Date,
      required: [true, "Sales Date is required"],
    },
    org: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Org",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sales", SalesSchema, "Sales");
