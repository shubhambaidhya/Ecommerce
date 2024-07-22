import express from "express";
import Product from "./product.model.js";
import { isSeller, isUser } from "../middleware/authentication.middleware.js";
import validateReqBody from "../middleware/validate.req.body.js";
import { addProductValidationSchema } from "./product.validation.js";
const router = express.Router();

//*list products
router.post("/product/list", isUser, async (req, res) => {
  //find all products
  const products = await Product.find();

  //send res
  return res.status(200).send({ message: "success", productDetails: products });
});

//* add products

router.post(
  "/product/add",
  isSeller,
  validateReqBody(addProductValidationSchema),
  async (req, res) => {
    //extract new product from req.body
    const newProduct = req.body;
    newProduct.sellerId = req.loggedInUserId;
    console.log(newProduct);
    //save product
    await Product.create(newProduct);

    return res.status(200).send({ message: "Product is added successfully" });
  }
);

export default router;
