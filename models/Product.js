const mongoose = require("mongoose");
const { USER_TYPES } = require("../config/utils");

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, "Product Name is Unique"],
      required: [true, "Product Name is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      trim: true,
      required: [true, "Product Category is required"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Description is required"],
    },
    image: {
      type: String,
      required: [true, "Product Image is required"],
    },
    model: {
      type: String,
      unique: [true, "Product Model is unique"],
    },
    colors: [
      {
        type: String,
      },
    ],
    sizes: [
      {
        type: String,
      },
    ],
    initialQuantity: {
      type: Number,
      trim: true,
    },
    stockAlert: {
      type: Number,
      trim: true,
      default: 5,
    },
    storeLocation: {
      type: String,
      trim: true,
    },
    buyingPrice: {
      type: Number,
      trim: true,
    },
    sellingPrice: {
      type: Number,
      trim: true,
    },
    org: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Org",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema, "Product");
