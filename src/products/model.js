import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ReviewSchema = new Schema(
  {
    comment: { type: String, required: true },
    rate: { type: Number, max: 5, default: 1, required: true },
  },
  { timestamps: true }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true }, //REQUIRED
    description: { type: String, required: true }, //REQUIRED
    brand: { type: String, required: true }, //REQUIRED
    imageUrl: { type: String, required: true }, //REQUIRED
    price: { type: Number, required: true }, //REQUIRED
    category: { type: String, required: true },
    reviews: [ReviewSchema],
  },
  { timestamps: true }
);

ProductSchema.static("findProductsWithReviews", async function (query) {
  const total = await this.countDocuments(query.criteria);

  const products = await this.find(query.criteria, query.options.fields)
    .skip(query.options.skip)
    .limit(query.options.limit)
    .sort(query.options.sort)
    .populate("reviews");

  return { total, products };
});

export default model("Product", ProductSchema);
