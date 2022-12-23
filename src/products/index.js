import express from "express";
import { getProducts, writeProducts } from "../lib/fs-tools.js";
import { checksProductSchema, triggerBadRequest } from "./validators.js";
import uniqid from "uniqid";
import httpErrors from "http-errors";

const productsRouter = express.Router();

const { NotFound } = httpErrors;

//..................................CRUD OPERATIONS..................................

// 1. CREATE a new product
productsRouter.post(
  "/",
  checksProductSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const productsArray = await getProducts();
      const newProduct = {
        ...req.body,
        id: uniqid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      productsArray.push(newProduct);
      await writeProducts(productsArray);
      res.status(201).send(`Product with id ${newProduct.id} was created`);
    } catch (error) {
      console.log(error);
    }
  }
);

// 2. GET all products
productsRouter.get("/", async (req, res, next) => {
  try {
    const productsArray = await getProducts();
    res.send(productsArray);
  } catch (error) {
    console.log(error);
  }
});

// 3. GET product by ID
productsRouter.get("/:id", async (req, res, next) => {
  try {
    const productID = req.params.id;
    const productsArray = await getProducts();
    const searchedProduct = productsArray.find(
      (product) => product.id === productID
    );
    if (searchedProduct) {
      res.send(searchedProduct);
    } else {
      next(NotFound(`Product with ID ${productID} was not found`));
    }
  } catch (error) {
    console.log(error);
  }
});

// 4. EDIT a product based on the id
productsRouter.put(
  "/:id",
  checksProductSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const productID = req.params.id;
      const productsArray = await getProducts();
      const oldProductIndex = productsArray.findIndex(
        (product) => product.id === productID
      );
      if (oldProductIndex !== -1) {
        const oldProduct = productsArray[oldProductIndex];
        const updatedProduct = {
          ...oldProduct,
          ...req.body,
          updatedAt: new Date(),
        };
        productsArray[oldProductIndex] = updatedProduct;
        await writeProducts(productsArray);
        res.send(updatedProduct);
      } else {
        next(NotFound(`Product with id ${productID} could not be found`));
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// 5.DELETE a product based on the id
productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const productID = req.params.id;
    const productsArray = await getProducts();
    const filteredArray = productsArray.filter(
      (product) => product.id !== productID
    );
    if (filteredArray.length !== productsArray.length) {
      await writeProducts(filteredArray);
      res.status(204).send();
    } else {
      next(NotFound(`Product with id ${productID} could not be found`));
    }
  } catch (error) {
    console.log(error);
  }
});
export default productsRouter;
