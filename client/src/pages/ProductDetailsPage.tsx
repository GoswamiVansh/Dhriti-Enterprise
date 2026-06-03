import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { 
  ChevronRight, 
  Minus, 
  Plus, 
  ShoppingCart, 
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Film
} from "lucide-react";
import toast from "react-hot-toast";

import api from "@/lib/axios";
import type { IProduct, IReview, ICategory } from "@/types";
import { addToCart } from "@/store/slices/cartSlice";
import { formatPrice, getDiscountPercent, getImageUrl } from "@/lib/utils";
import StarRating from "@/components/common/StarRating";
import { PageSkeleton } from "@/components/common/Loader";
import ProductCard from "@/components/products/ProductCard";

const ProductDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        // Fetch product by slug
        const res = await api.get(`/products/slug/${slug}`);
        const productData = res.data.data;
        setProduct(productData);
        
        // Set initial active image
        setActiveImage(productData.mainImage || productData.images[0] || "");

        // Fetch related products & reviews in parallel
        const [relatedRes, reviewsRes] = await Promise.all([
          api.get(`/products/${productData._id}/related`),
          api.get(`/reviews/product/${productData._id}`),
        ]);
        
        setRelatedProducts(relatedRes.data.data);
        setReviews(reviewsRes.data.data);
      } catch (error) {
        console.error("Failed to fetch product details", error);
        toast.error("Product not found");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProductDetails();
      // Scroll to top when slug changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [slug, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!product.inStock) {
      toast.error("Product is out of stock");
      return;
    }

    if (quantity > product.stockQuantity) {
      toast.error(`Only ${product.stockQuantity} items available in stock`);
      return;
    }

    dispatch(
      addToCart({
        _id: product._id,
        productId: product._id,
        name: product.name,
        image: product.mainImage || product.images[0] || "",
        price: product.price,
        quantity,
        unit: product.unit,
        material: product.material,
        stock: product.stockQuantity,
      })
    );
    toast.success(`${quantity} ${product.name} added to cart`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (loading || !product) return <PageSkeleton />;

  const categoryName = typeof product.category === 'object' ? (product.category as ICategory).name : 'Product';
  const discount = getDiscountPercent(product.originalPrice || 0, product.price);

  return (
    <>
      <Helmet>
        <title>{product.name} | Dhriti Enterprise</title>
        <meta name="description" content={product.description} />
      </Helmet>

      {/* Breadcrumb */}
      <div className="bg-brand-dark-lighter border-b border-brand-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-brand-gold">Home</Link>
            <ChevronRight className="w-3 h-3 text-brand-gold/50" />
            <Link to="/products" className="hover:text-brand-gold">Products</Link>
            <ChevronRight className="w-3 h-3 text-brand-gold/50" />
            <Link 
              to={`/products?category=${typeof product.category === 'object' ? product.category._id : product.category}`} 
              className="hover:text-brand-gold"
            >
              {categoryName}
            </Link>
            <ChevronRight className="w-3 h-3 text-brand-gold/50" />
            <span className="text-white truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-brand-dark rounded-2xl overflow-hidden border border-brand-dark-border relative group">
              <img
                src={getImageUrl(activeImage)}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-lighten"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/800x800/18181b/E0B370?text=${encodeURIComponent(product.name.substring(0, 15))}`;
                }}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {!product.inStock && (
                  <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg shadow-sm">
                    OUT OF STOCK
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg shadow-sm">
                    {discount}% OFF
                  </span>
                )}
              </div>
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square rounded-lg border-2 overflow-hidden ${
                      activeImage === img ? 'border-brand-gold' : 'border-transparent hover:border-brand-gold/50'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-brand-gold uppercase tracking-wider mb-2">
                {categoryName}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <StarRating rating={product.averageRating} size="md" />
                <span className="text-sm text-gray-400 underline cursor-pointer hover:text-white" onClick={() => setActiveTab("reviews")}>
                  {product.numReviews} Reviews
                </span>
                <span className="text-brand-dark-border">|</span>
                <span className={`text-sm font-medium flex items-center gap-1.5 ${product.inStock ? 'text-green-500' : 'text-red-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              
              <div className="flex items-end gap-3 mb-6">
                <span className="text-3xl font-bold text-white">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg text-gray-500 line-through mb-1">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-sm text-gray-400 mb-1 ml-1">{product.unit}</span>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="bg-brand-dark-lighter border border-brand-dark-border rounded-xl p-4 mb-8 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Material</p>
                <p className="font-medium text-white">{product.material}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">SKU</p>
                <p className="font-medium text-white">{product._id.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>

            {/* Add to Cart Actions */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Quantity */}
                <div className="flex items-center border border-brand-dark-border rounded-lg bg-brand-dark shrink-0">
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-3 text-gray-400 hover:text-brand-gold disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-white">{quantity}</span>
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stockQuantity || 1, quantity + 1))}
                    disabled={quantity >= (product.stockQuantity || 1)}
                    className="p-3 text-gray-400 hover:text-brand-gold disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Btn */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
                </button>
                
                {/* Action Btns */}
                <button 
                  onClick={() => toast("Added to wishlist!", { icon: "❤️" })}
                  className="p-3 border border-brand-dark-border rounded-lg text-gray-400 hover:text-brand-gold hover:border-brand-gold/50 bg-brand-dark transition-colors"
                  title="Add to Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-3 border border-brand-dark-border rounded-lg text-gray-400 hover:text-brand-gold hover:border-brand-gold/50 bg-brand-dark transition-colors"
                  title="Share Product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              {product.stockQuantity > 0 && product.stockQuantity <= 10 && (
                <p className="text-sm text-amber-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Hurry! Only {product.stockQuantity} left in stock.
                </p>
              )}
            </div>

            {/* Features List */}
            <div className="border-t border-brand-dark-border pt-6 space-y-4">
              {[
                { icon: ShieldCheck, text: "1 Year Brand Warranty" },
                { icon: RotateCcw, text: "7 Days Replacement Policy" },
                { icon: Truck, text: "Free Delivery on orders over ₹4999" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                  <item.icon className="w-5 h-5 text-brand-gold" />
                  {item.text}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Video Showcase Section */}
        {product.videoUrl && (
          <div className="mb-16 border-t border-brand-dark-border pt-10">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-2 justify-center lg:justify-start">
              <Film className="w-6 h-6 text-brand-gold" /> 
              Product Video Showcase
            </h2>
            <div className="max-w-5xl mx-auto bg-black/40 rounded-2xl overflow-hidden border border-brand-dark-border/80 shadow-2xl hover:border-brand-gold/45 transition-colors duration-300">
              <video 
                src={product.videoUrl} 
                controls 
                className="w-full h-auto max-h-[70vh] block mx-auto"
              />
            </div>
          </div>
        )}

        {/* Tabs: Description & Reviews */}
        <div className="mb-16">
          <div className="flex border-b border-brand-dark-border gap-8 mb-8">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-4 text-base font-semibold transition-colors relative ${
                activeTab === "description" ? "text-brand-gold" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Description
              {activeTab === "description" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 text-base font-semibold transition-colors relative ${
                activeTab === "reviews" ? "text-brand-gold" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Reviews ({product.numReviews})
              {activeTab === "reviews" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold" />
              )}
            </button>
          </div>

          <div>
            {activeTab === "description" ? (
              <div className="prose prose-invert max-w-none text-gray-400">
                <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                <div className="mt-8 grid sm:grid-cols-2 gap-4">
                  <div className="bg-brand-dark-lighter border border-brand-dark-border p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Specifications</h4>
                    <ul className="space-y-2 text-sm">
                      {product.minOrderQuantity && (
                        <li className="flex justify-between border-b border-brand-dark-border pb-2">
                          <span className="text-gray-500">Minimum Order Qty</span>
                          <span className="font-medium text-white">{product.minOrderQuantity}</span>
                        </li>
                      )}
                      
                      {product.specifications && Object.keys(product.specifications).length > 0 ? (
                        Object.entries(product.specifications).map(([key, value]) => (
                          <li key={key} className="flex justify-between border-b border-brand-dark-border pb-2 last:border-0 last:pb-0">
                            <span className="text-gray-500">{key}</span>
                            <span className="font-medium text-white text-right max-w-[60%]">{value}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex justify-between border-b border-brand-dark-border pb-2">
                            <span className="text-gray-500">Material</span>
                            <span className="font-medium text-white">{product.material}</span>
                          </li>
                          <li className="flex justify-between border-b border-brand-dark-border pb-2">
                            <span className="text-gray-500">Unit Type</span>
                            <span className="font-medium text-white">{product.unit}</span>
                          </li>
                          <li className="flex justify-between pb-2">
                            <span className="text-gray-500">Brand</span>
                            <span className="font-medium text-white">Dhriti Enterprise</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {/* Reviews summary & form area */}
                <div className="md:col-span-1">
                  <div className="bg-brand-dark-lighter border border-brand-dark-border p-6 rounded-xl text-center mb-6">
                    <h3 className="text-4xl font-bold text-white mb-2">{product.averageRating.toFixed(1)}</h3>
                    <div className="flex justify-center mb-2">
                      <StarRating rating={product.averageRating} size="lg" />
                    </div>
                    <p className="text-sm text-gray-400">Based on {product.numReviews} reviews</p>
                  </div>
                  <button className="w-full py-3 border border-brand-gold text-brand-gold font-semibold rounded-lg hover:bg-brand-gold hover:text-brand-dark transition-colors">
                    Write a Review
                  </button>
                  <p className="text-xs text-gray-500 mt-3 text-center">You must have purchased this product to review.</p>
                </div>
                
                {/* Reviews list */}
                <div className="md:col-span-2 space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review._id} className="border-b border-brand-dark-border pb-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold font-bold">
                              {review.user?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-white text-sm">{review.user?.name || "Anonymous User"}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                  year: "numeric", month: "long", day: "numeric"
                                })}
                              </p>
                            </div>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2">
                            {review.images.map((img, idx) => (
                              <img key={idx} src={getImageUrl(img)} alt="Review attachment" className="w-16 h-16 rounded object-cover border border-brand-dark-border" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-brand-dark-lighter border border-brand-dark-border rounded-xl">
                      <p className="text-gray-400">No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-brand-dark-border pb-4">
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default ProductDetailsPage;
