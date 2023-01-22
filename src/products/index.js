import express, { request } from "express";
import {
  getProducts,
  getReviews,
  writeProducts,
  writeReviews,
} from "../lib/fs-tools.js";
import {
  checksProductSchema,
  checksReviewSchema,
  triggerBadRequest,
  triggerReviewBadRequest,
} from "./validators.js";
import uniqid from "uniqid";
import httpErrors from "http-errors";
import ProductModel from "./model.js";

const productsRouter = express.Router();

const { NotFound } = httpErrors;

const getProductsWithReviews = async () => {
  const productsArray = await getProducts();
  const reviews = await getReviews();
  const productsWithReviews = productsArray.map((product) => {
    const targetReview = reviews.filter(
      (review) => review.productId === product.id
    );
    if (targetReview) {
      product.reviews = targetReview;
    }
    return product;
  });
  return productsWithReviews;
};

const getProductWithReviews = async (id) => {
  const productsArray = await getProducts();
  const searchedProduct = productsArray.find((product) => product.id === id);
  const reviews = await getReviews();
  const targetReview = reviews.filter((review) => review.productId === id);
  if (targetReview) {
    searchedProduct.reviews = targetReview;
  }
  return searchedProduct;
};

//..................................CRUD OPERATIONS..................................

// 1. CREATE a new product
productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductModel(req.body);
    const { _id } = await newProduct.save();
    res.status(201).send(`Product with id ${_id} was created`);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 2. GET all products
productsRouter.get("/", async (req, res, next) => {
  try {
    const query = req.query.category;
    console.log(query);
    const productsArray = await ProductModel.find().populate("reviews");
    if (!query) {
      res.send(productsArray);
    } else {
      const searchedProducts = productsArray.filter(
        (product) => product.category === query
      );
      res.send(searchedProducts);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 3. GET product by ID
productsRouter.get("/:id", async (req, res, next) => {
  try {
    const productID = req.params.id;
    const searchedProduct = await ProductModel.findById(productID);

    if (searchedProduct) {
      res.send(searchedProduct);
    } else {
      next(NotFound(`Product with ID ${productID} was not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
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
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        productID,
        req.body,
        { new: true, runValidators: true }
      );
      if (updatedProduct) {
        res.send(updatedProduct);
      } else {
        next(NotFound(`Product with id ${productID} could not be found`));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// 5.DELETE a product based on the id
productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const productID = req.params.id;
    const deletedProduct = await ProductModel.findByIdAndDelete(productID);
    if (productID) {
      res.status(204).send();
    } else {
      next(NotFound(`Product with id ${productID} could not be found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 6. ADD product REVIEWS
productsRouter.post("/:id/reviews", async (req, res, next) => {
  try {
    const productId = req.params.id;
    const newReview = req.body;
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { $push: { reviews: newReview } },
      { new: true, runValidators: true }
    );
    if (updatedProduct) {
      res.status(201).send(updatedProduct);
    } else {
      next(NotFound(`Product with id ${productId} was not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 7. GET all reviews of a product
productsRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const productId = req.params.id;
    const targetProduct = await ProductModel.findById(productId);
    if (targetProduct) {
      res.send(targetProduct.reviews);
    } else {
      next(NotFound(`Product with id ${productId} was not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 8. GET a specific review for a product
productsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const productID = req.params.productId;
    const reviewID = req.params.reviewId;
    const targetProduct = await ProductModel.findById(productID);

    if (targetProduct) {
      const targetReview = targetProduct.reviews.find(
        (comment) => comment._id.toString() === reviewID
      );
      if (targetReview) {
        res.send(targetReview);
      } else {
        next(NotFound(`Review with id ${reviewID} not found`));
      }
    } else {
      next(NotFound(`Product with id ${productID} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 9. UPDATE a specific review for a product
productsRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const productID = req.params.productId;
    const reviewID = req.params.reviewId;
    const targetProduct = await ProductModel.findById(productID);
    if (targetProduct) {
      const index = targetProduct.reviews.findIndex(
        (review) => review._id.toString() === reviewID
      );
      if (index !== -1) {
        targetProduct.reviews[index] = {
          ...targetProduct.reviews[index].toObject(),
          ...req.body,
        };
        await targetProduct.save();
        res.send(targetProduct);
      } else {
        next(NotFound(`Review with id ${reviewID} was not found`));
      }
    } else {
      next(NotFound(`Product with id ${productID} was not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 10. DELETE a specific review for a product
productsRouter.delete(
  "/:productId/reviews/:reviewId",
  async function (req, res, next) {
    try {
      const productID = req.params.productId;
      const reviewID = req.params.reviewId;
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        productID,
        { $pull: { reviews: { _id: reviewID } } },
        { new: true }
      );
      if (updatedProduct) {
        res.status(204).send(updatedProduct);
      } else {
        next(NotFound(`Product with id ${productID} was not found`));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default productsRouter;
