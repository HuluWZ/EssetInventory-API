const mongoose = require("mongoose");
const { USER_TYPES, PAYMENT_METHODS,ORDER_STATUS } = require("../config/utils");

const OrderSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: [true, " FullName is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address  is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Order Product  is required"],
        },
        quantity: {
          type: Number,
          min: 1,
          required: [true, "Order Quantity  is required"],
        },
      },
    ],
    paymentMethod: {
      type: String,
      enum:PAYMENT_METHODS,
      default:"Cash"
    },
    orderDate: {
      type: Date,
      required: [true, "Order Date is required"],
    },
    org: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Org",
    },
    status: {
      type: String,
      enum:ORDER_STATUS,
      default:"Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema, "Order");
