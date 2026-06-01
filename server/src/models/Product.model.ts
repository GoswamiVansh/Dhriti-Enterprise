import mongoose, { type Document, Schema } from "mongoose";
import slugify from "slugify";

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  material: string;
  price: number;
  originalPrice?: number;
  unit: string;
  category: mongoose.Types.ObjectId;
  description: string;
  inStock: boolean;
  stockQuantity: number;
  images: string[];
  mainImage?: string;
  averageRating: number;
  numReviews: number;
  isFeatured: boolean;
  tags: string[];
  productUrl?: string;
  videoUrl?: string;
  minOrderQuantity?: string;
  specifications?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    material: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    unit: { type: String, required: true, trim: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0, min: 0 },
    images: [{ type: String }],
    mainImage: { type: String },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    productUrl: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
    minOrderQuantity: { type: String, trim: true },
    specifications: { type: Map, of: String },
  },
  { timestamps: true }
);

// Auto-generate slug
productSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  // Set mainImage from first image if not set
  if (!this.mainImage && this.images.length > 0) {
    this.mainImage = this.images[0];
  }
  next();
});

// Text index for search
productSchema.index({ name: "text", description: "text", material: "text" });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
