import jwt from "jsonwebtoken";
import User from "../user/user.model.js";

export const isUser = async (req, res, next) => {
  //extract token from req.headers
  const { authorization } = req.headers;
  const splittedArray = authorization?.split(" ");
  const token = splittedArray?.length === 2 ? splittedArray[1] : null;
  //if not token, throw error
  if (!token) {
    return res.status(401).send({ message: "Unauthorized..." });
  }

  let payload;
  //decrypt token
  try {
    const secretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    payload = jwt.verify(token, secretKey);
  } catch (error) {
    //if decryption fails, throw error
    return res.status(401).send({ message: "Unauthorized..." });
  }

  //find user using email from payload
  const user = await User.findOne({ email: payload.email });
  //if not user throw error
  if (!user) {
    return res.status(401).send({ message: "Unauthorized..." });
  }

  next();
};

export const isSeller = async (req, res, next) => {
  //extract token from req.headers
  const { authorization } = req.headers;

  const splittedArray = authorization?.split(" ");

  const token = splittedArray.length === 2 ? splittedArray[1] : null;
  //if not token, throw error
  if (!token) {
    return res.status(401).send({ message: "Unauthorized..." });
  }

  let payload;
  //decrypt token
  try {
    const secretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    payload = jwt.verify(token, secretKey);
  } catch (error) {
    //if decryption fails, throw error
    return res.status(401).send({ message: "Unauthorized..." });
  }

  //find user using email from payload
  const user = await User.findOne({ email: payload.email });
  //if not user throw error
  if (!user) {
    return res.status(401).send({ message: "Unauthorized..." });
  }

  //if user's role is not seller, throw error
  if (user.role !== "seller") {
    return res.status(401).send({ message: "Unauthorized" });
  }

  req.loggedInUserId = user._id;

  next();
};

export const isBuyer = async (req, res, next) => {
  //extract token from req.headers
  const { authorization } = req.headers;

  const splittedArray = authorization?.split(" ");

  const token = splittedArray.length === 2 ? splittedArray[1] : null;
  //if not token, throw error
  if (!token) {
    return res.status(401).send({ message: "Unauthorized..." });
  }

  let payload;
  //decrypt token
  try {
    const secretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    payload = jwt.verify(token, secretKey);
  } catch (error) {
    //if decryption fails, throw error
    return res.status(401).send({ message: "Unauthorized..." });
  }

  //find user using email from payload
  const user = await User.findOne({ email: payload.email });
  //if not user throw error
  if (!user) {
    return res.status(401).send({ message: "Unauthorized..." });
  }

  //if user's role is not buyer, throw error
  if (user.role !== "buyer") {
    return res.status(401).send({ message: "Unauthorized" });
  }

  req.loggedInUserId = user._id;

  next();
};
