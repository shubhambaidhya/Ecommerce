import mongoose from "mongoose";
import Yup from "yup";
import { productCategories } from "../constant/general.constant.js";

//set schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 55,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
    maxlength: 55,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: productCategories,
  },
  freeShipping: {
    type: Boolean,
    required: false,
    default: false,
  },
  sellerId: {
    type: mongoose.ObjectId,
    required: true,
    ref: "User",
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000,
  },
  image: {
    type: String,
    required: false,
    default: null,
  },
});
// to hide password
productSchema.methods.toJSON = function () {
  let obj = this.toObject(); //or var obj = this;
  delete obj.sellerId;
  return obj;
};

//create model
const Product = mongoose.model("Product", productSchema);

export default Product;
