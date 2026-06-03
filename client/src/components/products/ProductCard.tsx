import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, ShoppingCart, Minus, Plus } from "lucide-react";
import { addToCart, removeFromCart, updateQuantity } from "@/store/slices/cartSlice";
import StarRating from "@/components/common/StarRating";
import { formatPrice, getDiscountPercent, getImageUrl } from "@/lib/utils";
import type { IProduct, ICategory } from "@/types";
import type { RootState } from "@/store/store";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: IProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useDispatch();
  
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const cartItem = cartItems.find((x) => x.productId === product._id);

  const categoryName =
    typeof product.category === "object"
      ? (product.category as ICategory).name
      : "";
  const discount = getDiscountPercent(
    product.originalPrice || 0,
    product.price
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.inStock) {
      toast.error("Product is out of stock");
      return;
    }

    dispatch(
      addToCart({
        _id: product._id,
        productId: product._id,
        name: product.name,
        image: product.mainImage || product.images[0] || "",
        price: product.price,
        quantity: 1,
        unit: product.unit,
        material: product.material,
        stock: product.stockQuantity,
      })
    );
    toast.success(`${product.name} added to cart`);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem && cartItem.quantity < (product.stockQuantity || 1)) {
      dispatch(updateQuantity({ productId: product._id, quantity: cartItem.quantity + 1 }));
    } else {
      toast.error(`Only ${product.stockQuantity} items available in stock`);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem && cartItem.quantity > 1) {
      dispatch(updateQuantity({ productId: product._id, quantity: cartItem.quantity - 1 }));
    } else if (cartItem && cartItem.quantity === 1) {
      dispatch(removeFromCart(product._id));
      toast.success(`${product.name} removed from cart`);
    }
  };

  return (
    <Link
      to={`/product/${product.slug || product._id}`}
      className="product-card group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-brand-gold/50 block transition-all shadow-sm hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={getImageUrl(product.mainImage || product.images[0])}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/400x400/f3f4f6/C9954C?text=${encodeURIComponent(product.name.substring(0, 10))}`;
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {!product.inStock && (
            <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-semibold rounded">
              OUT OF STOCK
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-semibold rounded">
              {discount}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-1 bg-brand-gold text-white text-[10px] font-semibold rounded">
              FEATURED
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toast("Added to wishlist!", { icon: "❤️" });
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm border border-gray-200"
        >
          <Heart className="w-4 h-4 text-gray-600 hover:text-brand-gold" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col h-[180px]">
        <div>
          {categoryName && (
            <p className="text-[10px] uppercase tracking-wider text-brand-gold font-medium mb-1">
              {categoryName}
            </p>
          )}
          <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1 group-hover:text-brand-gold transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{product.material}</p>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="mb-2">
              <StarRating
                rating={product.averageRating}
                showCount
                count={product.numReviews}
              />
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-[10px] text-gray-500">{product.unit}</span>
          </div>
        </div>

        <div className="mt-auto">
          {/* Add to Cart or Adjust Quantity */}
          {cartItem ? (
            <div className="flex items-center justify-between bg-gray-50 border border-brand-gold/50 rounded-lg h-9 overflow-hidden">
              <button 
                onClick={handleDecrease}
                className="w-10 h-full flex items-center justify-center text-brand-gold hover:bg-brand-gold/10 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-gray-800 text-sm">{cartItem.quantity}</span>
              <button 
                onClick={handleIncrease}
                className="w-10 h-full flex items-center justify-center text-brand-gold hover:bg-brand-gold/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full h-9 border border-brand-gold text-brand-gold text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-brand-gold hover:text-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
