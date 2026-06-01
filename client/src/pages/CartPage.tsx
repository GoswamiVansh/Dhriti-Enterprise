import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Trash2, Plus, Minus, ArrowRight, Ticket } from "lucide-react";
import toast from "react-hot-toast";

import type { RootState } from "@/store/store";
import { 
  removeFromCart, 
  updateQuantity, 
  applyCoupon, 
  removeCoupon 
} from "@/store/slices/cartSlice";
import { formatPrice, getImageUrl } from "@/lib/utils";
import api from "@/lib/axios";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, coupon } = useSelector((state: RootState) => state.cart);
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Calculations
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  let discountAmount = 0;
  if (coupon) {
    if (coupon.discountType === "percentage") {
      discountAmount = (itemsPrice * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }
  }
  
  const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST example
  const shippingPrice = itemsPrice >= 4999 ? 0 : 99; // Free shipping over 4999
  const subtotalAfterDiscount = Math.max(0, itemsPrice - discountAmount);
  const totalPrice = subtotalAfterDiscount + taxPrice + shippingPrice;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (!userInfo) {
      toast.error("Please login to apply coupons");
      navigate("/login?redirect=/cart");
      return;
    }

    setCouponLoading(true);
    try {
      const res = await api.post("/cart/apply-coupon", {
        code: couponCode,
        orderAmount: itemsPrice,
      });
      
      const appliedCoupon = res.data.data;
      dispatch(applyCoupon({
        code: appliedCoupon.code,
        discount: appliedCoupon.discount,
        discountType: appliedCoupon.discountType,
        discountValue: appliedCoupon.discountValue,
        maxDiscount: appliedCoupon.maxDiscount
      } as any));
      
      toast.success("Coupon applied successfully!");
      setCouponCode("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.success("Coupon removed");
  };

  const handleCheckout = () => {
    if (!userInfo) {
      navigate("/login?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Helmet><title>Shopping Cart | Dhriti Enterprise</title></Helmet>
        <div className="w-24 h-24 bg-brand-dark-lighter rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-dark-border">
          <ShoppingCart className="w-10 h-10 text-brand-gold/50" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Your Cart is Empty</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Browse our products and find something you love.
        </p>
        <Link 
          to="/products"
          className="inline-block px-8 py-3 bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-bold rounded-lg transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shopping Cart | Dhriti Enterprise</title>
      </Helmet>

      <div className="bg-brand-dark-lighter border-b border-brand-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Shopping Cart</h1>
          <p className="text-sm text-gray-400 mt-2">{cartItems.length} items in your cart</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-brand-dark rounded-xl shadow-sm border border-brand-dark-border overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-brand-dark-border text-xs font-semibold text-gray-400 uppercase tracking-wider bg-brand-dark-lighter/50">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>
              
              <ul className="divide-y divide-brand-dark-border">
                {cartItems.map((item) => (
                  <li key={item.productId} className="p-4 sm:p-6">
                    <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                      
                      {/* Product Info */}
                      <div className="col-span-6 flex items-center gap-4 w-full">
                        <Link to={`/product/${item.productId}`} className="w-20 h-20 shrink-0 bg-brand-dark-lighter rounded-lg border border-brand-dark-border overflow-hidden">
                          <img 
                            src={getImageUrl(item.image)} 
                            alt={item.name} 
                            className="w-full h-full object-cover mix-blend-lighten" 
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.productId}`} className="font-medium text-white hover:text-brand-gold line-clamp-2 mb-1">
                            {item.name}
                          </Link>
                          <p className="text-xs text-gray-400">Unit: {item.unit}</p>
                          
                          {/* Mobile Price & Controls */}
                          <div className="md:hidden flex items-center justify-between mt-3">
                            <span className="font-bold text-white">{formatPrice(item.price)}</span>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-brand-dark-border rounded-md bg-brand-dark-lighter text-white">
                                <button 
                                  onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) }))}
                                  className="p-1 text-gray-400 hover:text-brand-gold"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <button 
                                  onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: Math.min(item.stock, item.quantity + 1) }))}
                                  className="p-1 text-gray-400 hover:text-brand-gold"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button 
                                onClick={() => dispatch(removeFromCart(item.productId))}
                                className="text-red-500 hover:text-red-400 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Price */}
                      <div className="col-span-2 text-center hidden md:block">
                        <span className="font-medium text-white">{formatPrice(item.price)}</span>
                      </div>

                      {/* Desktop Quantity */}
                      <div className="col-span-2 flex justify-center hidden md:flex">
                        <div className="flex items-center border border-brand-dark-border rounded-md bg-brand-dark-lighter text-white">
                          <button 
                            onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) }))}
                            className="p-1.5 text-gray-400 hover:text-brand-gold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: Math.min(item.stock, item.quantity + 1) }))}
                            className="p-1.5 text-gray-400 hover:text-brand-gold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Desktop Subtotal & Remove */}
                      <div className="col-span-2 flex items-center justify-end gap-4 hidden md:flex">
                        <span className="font-bold text-white">{formatPrice(item.price * item.quantity)}</span>
                        <button 
                          onClick={() => dispatch(removeFromCart(item.productId))}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-between items-center px-2">
              <Link to="/products" className="text-sm font-medium text-brand-gold hover:underline flex items-center gap-1.5">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-brand-dark rounded-xl shadow-sm border border-brand-dark-border p-6 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-brand-dark-border pb-4">Order Summary</h3>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Items Total ({cartItems.reduce((a, c) => a + c.quantity, 0)})</span>
                  <span>{formatPrice(itemsPrice)}</span>
                </div>
                
                {/* Coupon Form */}
                <div className="py-2">
                  {coupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 text-green-400 font-medium">
                        <Ticket className="w-4 h-4" />
                        {coupon.code} Applied
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-green-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Coupon Code" 
                        className="flex-1 px-3 py-2 bg-brand-dark-lighter border border-brand-dark-border text-white rounded-lg text-sm focus:outline-none focus:border-brand-gold uppercase placeholder-gray-500"
                      />
                      <button 
                        type="submit" 
                        disabled={couponLoading || !couponCode}
                        className="px-4 py-2 bg-brand-gold text-brand-dark font-bold rounded-lg disabled:opacity-50 text-sm"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                </div>

                {coupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({coupon.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-400">
                  <span>Estimated GST (18%)</span>
                  <span>{formatPrice(taxPrice)}</span>
                </div>
                
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  {shippingPrice === 0 ? (
                    <span className="text-green-500 font-medium">Free</span>
                  ) : (
                    <span>{formatPrice(shippingPrice)}</span>
                  )}
                </div>
                
                {shippingPrice > 0 && (
                  <div className="text-[10px] text-brand-gold text-right">
                    Add {formatPrice(4999 - subtotalAfterDiscount)} more for free shipping
                  </div>
                )}
              </div>
              
              <div className="border-t border-brand-dark-border pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-white">Total Amount</span>
                  <span className="text-2xl font-bold text-brand-gold">{formatPrice(totalPrice)}</span>
                </div>
                <p className="text-[10px] text-gray-500 text-right mt-1">Inclusive of all taxes</p>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full py-4 bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                PROCEED TO CHECKOUT
                <ArrowRight className="w-5 h-5" />
              </button>
              
              {!userInfo && (
                <p className="text-xs text-center text-gray-500 mt-4">
                  <Link to="/login?redirect=/cart" className="text-brand-gold hover:underline font-medium">Login</Link> for faster checkout
                </p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default CartPage;
