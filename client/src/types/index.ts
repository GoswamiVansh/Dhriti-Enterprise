export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  avatar?: string;
  addresses: IAddress[];
  wishlist: string[];
  token?: string;
  createdAt: string;
}

export interface IAddress {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  parentCategory?: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  material: string;
  price: number;
  originalPrice?: number;
  unit: string;
  category: ICategory | string;
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
  createdAt: string;
}

export interface IReview {
  _id: string;
  product: string;
  user: { _id: string; name: string; avatar?: string };
  rating: number;
  comment: string;
  images: string[];
  isApproved: boolean;
  helpfulVotes: number;
  createdAt: string;
}

export interface ICartItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit: string;
  material: string;
  stock: number;
  productId: string;
}

export interface IOrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  user?: { _id: string; name: string; email: string };
  items: IOrderItem[];
  shippingAddress: IAddress & { fullName: string; phone: string };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  createdAt: string;
}

export interface ICoupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: IPagination;
}
