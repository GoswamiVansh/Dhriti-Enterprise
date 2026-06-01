import mongoose, { type Document, Schema } from "mongoose";
import Product from "./Product.model.js";

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  images: string[];
  isApproved: boolean;
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
    images: [{ type: String }],
    isApproved: { type: Boolean, default: true },
    helpfulVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to recalculate product rating
reviewSchema.statics.calcAverageRating = async function (
  productId: mongoose.Types.ObjectId
) {
  const result = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0 && result[0]) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(result[0].avgRating * 10) / 10,
      numReviews: result[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      numReviews: 0,
    });
  }
};

// Recalculate after save
reviewSchema.post("save", async function () {
  const ReviewModel = this.constructor as typeof Review;
  await (ReviewModel as unknown as { calcAverageRating: (id: mongoose.Types.ObjectId) => Promise<void> }).calcAverageRating(this.product);
});

// Recalculate after delete
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const ReviewModel = mongoose.model("Review");
    await (ReviewModel as unknown as { calcAverageRating: (id: mongoose.Types.ObjectId) => Promise<void> }).calcAverageRating(doc.product);
  }
});

const Review = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
