const mongoose = require("mongoose");
const { USER_TYPES } = require("../config/utils");

const CategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, "Category Name is Unique"],
      required: [true, "Category Name is required"],
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Category Description is required"],
    },
    image: {
      type: String,
      required: [true, "Category Image is required"],
    },
    org: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Org"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema, "Category");
