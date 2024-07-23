import express from "express";
import Product from "./product.model.js";
import { isUser, isSeller } from "../middleware/authentication.middleware.js";
import validateReqBody from "../middleware/validate.req.body.js";
import { addProductValidationSchema } from "./product.validation.js";
import validateMongoIdFromParams from "../middleware/validate.mongo.id.js";
import checkMongoIdsEquality from "../utils/mongo.id.equality.js";
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

//* delete product
router.delete(
  "/product/delete/:id",
  isSeller,
  validateMongoIdFromParams,
  async (req, res) => {
    //extract product id from req.params
    const productId = req.params.id;

    //find product using product id
    const product = await Product.findById(productId);

    //if not product, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist" });
    }

    //check if loggedInUserId is owner of the product
    //? const isProductOwner = product.sellerId.equals(req.loggedInUserId);
    // alternative,
    const isProductOwner = checkMongoIdsEquality(
      product.sellerId,
      req.loggedInUserId
    );
    //if not owner, throw error
    if (!isProductOwner) {
      return res
        .status(403)
        .status({ message: "You are not the Owner of this product" });
    }
    //delete product

    await Product.findByIdAndDelete(productId);

    //send res
    return res.status(200).send({ message: "Successfully deleted" });
  }
);

//* edit product
router.put(
  "/product/edit/:id",
  isSeller,
  validateMongoIdFromParams,
  validateReqBody(addProductValidationSchema),
  async (req, res) => {
    //extract product id from req.params
    const productId = req.params.id;

    //find product using product id
    const product = await Product.findById(productId);

    //if not product, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist" });
    }

    //check if loggedInUserId is owner of the product
    //? const isProductOwner = product.sellerId.equals(req.loggedInUserId);
    // alternative,
    const isProductOwner = checkMongoIdsEquality(
      product.sellerId,
      req.loggedInUserId
    );
    //if not owner, throw error
    if (!isProductOwner) {
      return res
        .status(403)
        .status({ message: "You are not the Owner of this product" });
    }
    //edit product
    const newValues = req.body;
    await Product.updateOne({ _id: productId }, { $set: { ...newValues } });
    //send res
    return res.status(200).send({ message: "Successfully edited" });
  }
);

export default router;
