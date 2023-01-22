import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ReviewSchema = new Schema({
  comment: { type: TimeRanges, required: true },
  rate: { type: Number, max: 5, default: 1, required: true },
});

const ProductModel = new Schema({
  name: { type: String, required: true }, //REQUIRED
  description: { type: String, required: true }, //REQUIRED
  brand: { type: String, required: true }, //REQUIRED
  imageUrl: { type: String, required: true }, //REQUIRED
  price: { type: Number, required: true }, //REQUIRED
  category: { type: String, required: true },
  reviews: [ReviewSchema],
});

export default model("Product", ProductModel);