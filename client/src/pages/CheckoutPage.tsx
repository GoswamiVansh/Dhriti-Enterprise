import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, ChevronRight, Lock } from "lucide-react";

import api from "@/lib/axios";
import type { RootState } from "@/store/store";
import { saveShippingAddress, savePaymentMethod, clearCartItems } from "@/store/slices/cartSlice";
import { formatPrice, getImageUrl } from "@/lib/utils";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { cartItems, shippingAddress: savedAddress, paymentMethod: savedPaymentMethod, coupon } = useSelector((state: RootState) => state.cart);
  
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Address, 2: Review, 3: Success
  const [address, setAddress] = useState({
    fullName: savedAddress.fullName || "",
    phone: savedAddress.phone || "",
    street: savedAddress.street || "",
    city: savedAddress.city || "",
    state: savedAddress.state || "",
    zipCode: savedAddress.zipCode || "",
    country: "India"
  });
  const [paymentMethod, setPaymentMethod] = useState(savedPaymentMethod || "Cash on Delivery");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Redirect if cart empty (and not on success step)
  useEffect(() => {
    if (cartItems.length === 0 && step !== 3) {
      navigate("/cart");
    }
  }, [cartItems, navigate, step]);

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
  
  const taxPrice = Math.round(itemsPrice * 0.18);
  const shippingPrice = itemsPrice >= 4999 ? 0 : 99;
  const subtotalAfterDiscount = Math.max(0, itemsPrice - discountAmount);
  const totalPrice = subtotalAfterDiscount + taxPrice + shippingPrice;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(saveShippingAddress(address));
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          image: item.image
        })),
        shippingAddress: address,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
      };

      const res = await api.post("/orders", orderData);
      
      dispatch(clearCartItems());
      setOrderId(res.data.data._id);
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Step 3: Success View
  if (step === 3) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Helmet><title>Order Confirmed | Dhriti Enterprise</title></Helmet>
        <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 border border-green-800">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
        <p className="text-gray-400 mb-8">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        <div className="bg-brand-dark-lighter p-6 rounded-xl border border-brand-dark-border max-w-md mx-auto mb-8 text-left">
          <p className="text-sm text-gray-400 mb-1">Order ID</p>
          <p className="font-bold text-white mb-4">{orderId}</p>
          <p className="text-sm text-gray-400 mb-1">Payment Method</p>
          <p className="font-bold text-white">{paymentMethod}</p>
        </div>
        <button
          onClick={() => navigate("/products")}
          className="inline-flex px-8 py-3 bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-bold rounded-lg transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout | Dhriti Enterprise</title>
      </Helmet>

      <div className="bg-brand-dark-lighter border-b border-brand-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Checkout</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4 text-sm font-medium">
            <span className={step >= 1 ? "text-brand-gold" : "text-gray-500"}>1. Shipping</span>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <span className={step >= 2 ? "text-brand-gold" : "text-gray-500"}>2. Review & Payment</span>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <span className="text-gray-500">3. Confirmation</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            
            {step === 1 && (
              <form onSubmit={handleAddressSubmit} className="bg-brand-dark p-6 rounded-xl border border-brand-dark-border shadow-sm">
                <h2 className="text-xl font-bold text-white mb-6">Shipping Address</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <input type="text" required value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="w-full px-4 py-2 border border-brand-dark-border bg-brand-dark-lighter text-white rounded-lg focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Street Address</label>
                    <input type="text" required value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full px-4 py-2 border border-brand-dark-border bg-brand-dark-lighter text-white rounded-lg focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                    <input type="text" required value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full px-4 py-2 border border-brand-dark-border bg-brand-dark-lighter text-white rounded-lg focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                    <input type="text" required value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full px-4 py-2 border border-brand-dark-border bg-brand-dark-lighter text-white rounded-lg focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">PIN / ZIP Code</label>
                    <input type="text" required value={address.zipCode} onChange={e => setAddress({...address, zipCode: e.target.value})} className="w-full px-4 py-2 border border-brand-dark-border bg-brand-dark-lighter text-white rounded-lg focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                    <input type="tel" required value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full px-4 py-2 border border-brand-dark-border bg-brand-dark-lighter text-white rounded-lg focus:outline-none focus:border-brand-gold" />
                  </div>
                </div>
                
                <div className="mt-8 flex gap-4">
                  <button type="button" onClick={() => navigate("/cart")} className="px-6 py-3 border border-brand-dark-border text-gray-300 font-medium rounded-lg hover:bg-brand-dark-lighter flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Cart
                  </button>
                  <button type="submit" className="flex-1 px-6 py-3 bg-brand-gold text-brand-dark font-bold rounded-lg hover:bg-brand-gold-light">
                    Continue to Review
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-brand-dark p-6 rounded-xl border border-brand-dark-border shadow-sm">
                  <div className="flex justify-between items-start border-b border-brand-dark-border pb-4 mb-4">
                    <h2 className="text-xl font-bold text-white">Shipping Details</h2>
                    <button onClick={() => setStep(1)} className="text-sm font-medium text-brand-gold hover:underline">Edit</button>
                  </div>
                  <p className="font-medium text-white">{address.fullName}</p>
                  <p className="text-sm text-gray-400 mt-1">{address.street}</p>
                  <p className="text-sm text-gray-400">{address.city}, {address.state} {address.zipCode}</p>
                  <p className="text-sm text-gray-400">Phone: {address.phone}</p>
                </div>

                <div className="bg-brand-dark p-6 rounded-xl border border-brand-dark-border shadow-sm">
                  <h2 className="text-xl font-bold text-white mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'Cash on Delivery' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-dark-border hover:border-gray-600'}`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value="Cash on Delivery" 
                        checked={paymentMethod === 'Cash on Delivery'} 
                        onChange={() => setPaymentMethod('Cash on Delivery')}
                        className="text-brand-gold focus:ring-brand-gold"
                      />
                      <span className="font-medium text-white">Cash on Delivery (COD)</span>
                    </label>
                  </div>
                </div>

                <div className="bg-brand-dark p-6 rounded-xl border border-brand-dark-border shadow-sm">
                  <h2 className="text-xl font-bold text-white mb-4 border-b border-brand-dark-border pb-4">Order Items</h2>
                  <ul className="space-y-4">
                    {cartItems.map((item) => (
                      <li key={item.productId} className="flex gap-4">
                        <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 rounded border border-brand-dark-border object-cover" />
                        <div className="flex-1">
                          <p className="font-medium text-white text-sm line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-white text-sm">{formatPrice(item.price * item.quantity)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
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
                
                {coupon && (
                  <div className="flex justify-between text-green-500 font-medium">
                    <span>Discount ({coupon.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-400">
                  <span>GST (18%)</span>
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
              </div>
              
              <div className="border-t border-brand-dark-border pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-white">Total Amount</span>
                  <span className="text-2xl font-bold text-brand-gold">{formatPrice(totalPrice)}</span>
                </div>
              </div>
              
              {step === 2 && (
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full py-4 bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-70"
                >
                  <Lock className="w-5 h-5" />
                  {isPlacingOrder ? "PROCESSING..." : "PLACE ORDER"}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
