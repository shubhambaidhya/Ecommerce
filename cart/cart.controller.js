import express from "express";
import { isBuyer } from "../middleware/authentication.middleware.js";
import validateReqBody from "../middleware/validate.req.body.js";
import { addCartItemValidationSchema } from "./cart.validation.js";
import Product from "../product/product.model.js";
import Cart from "./cart.model.js";
import checkMongoIdValidity from "../utils/mongo.id.validity.js";
import validateMongoIdFromParams from "../middleware/validate.mongo.id.js";

const router = express.Router();
//*add item to cart
router.post(
  "/cart/add/item",
  isBuyer,
  validateReqBody(addCartItemValidationSchema),
  (req, res, next) => {
    // validate product id from req.body
    //? const {productId} = req.body; yo bhaneko tala 15 ko code ho
    const productId = req.body.productId;

    // check mongo id validity
    const isValidMongoId = checkMongoIdValidity(productId);

    //if not a valid mongoId, throw error
    if (!isValidMongoId) {
      return res.status(404).send({ message: "Invalid Mongo Id" });
    }

    // call next function
    next();
  },
  async (req, res) => {
    // extract cart item data from req.body
    const { productId, orderedQuantity } = req.body;

    // find product using productId
    const product = await Product.findOne({ _id: productId });
    console.log(product);

    //if not product, throw error
    if (!product) {
      return res.status({ message: "Product does not exist" });
    }

    // check if ordered quantity exceeds product quantity
    if (orderedQuantity > product.quantity) {
      return res.status(403).send({ message: "Product is outnumbered" });
    }

    // add item to cart
    await Cart.create({
      buyerId: req.loggedInUserId,
      productId,
      orderedQuantity,
    });

    // send res
    return res.status(200).send({ message: "item added successfully" });
  }
);

//* flush cart / remove all items from cart
router.delete("/cart/flush", isBuyer, async (req, res) => {
  //extract buyerId from req.loggedUserId
  const buyerId = req.loggedInUserId;

  //remove all items from cart
  await Cart.deleteMany({ buyerId });

  //send res
  return res.status(200).send({ message: "Cart is cleared successfully" });
});

//* remove single item from cart
// id here is cartId
router.delete(
  "/cart/item/delete/:id",
  isBuyer,
  validateMongoIdFromParams,
  async (req, res) => {
    // extract cartId from req.params
    const cartId = req.params.id;

    //check cart ownership
    const cart = await Cart.findOne({
      _id: cartId,
      buyerId: req.loggedInUserId,
    });

    // if not cart owner, throw error
    if (!cart) {
      return res
        .status(403)
        .send({ message: "You are not owner of this cart" });
    }

    // delete cart
    await Cart.deleteOne({ _id: cartId, buyerId: req.loggedInUserId });
    // return res
    return res
      .status(200)
      .send({ message: "Cart item is removed successfully" });
  }
);
export default router;
