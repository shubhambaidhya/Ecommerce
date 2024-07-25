import express from "express";
import Product from "./product.model.js";
import {
  isUser,
  isSeller,
  isBuyer,
} from "../middleware/authentication.middleware.js";
import validateReqBody from "../middleware/validate.req.body.js";
import {
  addProductValidationSchema,
  paginationDataValidationSchema,
} from "./product.validation.js";
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

//* get product details

router.get(
  "/product/detail/:id",
  isUser,
  validateMongoIdFromParams,
  async (req, res) => {
    //extract product id from req.params
    const productId = req.params.id;

    //find product using product id
    const product = await Product.findById(productId);

    //if not product, throw error
    if (!product) {
      return res.status(400).send({ message: "Product does not exist" });
    }
    //send res
    return res
      .status(200)
      .send({ message: "success", productDetails: product });
  }
);

//*list product by seller

router.post(
  "/product/seller/list",

  isSeller,
  validateReqBody(paginationDataValidationSchema),
  async (req, res) => {
    //extract pagination data from req.body
    const { page, limit, searchText } = req.body;
    //calculate skip
    const skip = (page - 1) * limit;

    //condition
    let match = { sellerId: req.loggedInUserId };

    if (searchText) {
      match.name = { $regex: searchText, $options: "i" };
    }

    const products = await Product.aggregate([
      {
        $match: match,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          name: 1,
          price: 1,
          brand: 1,
          image: 1,
          description: { $substr: ["$description", 0, 150] },
        },
      },
    ]);

    return res
      .status(200)
      .send({ message: "Seller List...", productList: products });
  }
);

//* list product by buyer
router.post(
  "/product/buyer/list",
  isBuyer,
  validateReqBody(paginationDataValidationSchema),
  async (req, res) => {
    //extract pagination data from req.boy
    const { page, limit, searchText } = req.body;

    //calculate skip
    const skip = (page - 1) * limit;

    //condition
    let match = {};

    if (searchText) {
      match.name = { $regex: searchText, $options: "i" };
    }

    //find products
    const products = await Product.aggregate([
      {
        $match: match,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          name: 1,
          price: 1,
          brand: 1,
          image: 1,
          description: { $substr: ["$description", 0, 150] },
        },
      },
    ]);

    //send res
    return res.status(200).send({ message: "success", productList: products });
  }
);
export default router;
