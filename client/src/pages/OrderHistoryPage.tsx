import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Package, ExternalLink } from "lucide-react";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import type { IOrder } from "@/types";
import { PageSkeleton } from "@/components/common/Loader";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/my-orders");
        setOrders(res.data.data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-900/20 text-amber-500 border-amber-800";
      case "processing": return "bg-blue-900/20 text-blue-400 border-blue-800";
      case "shipped": return "bg-purple-900/20 text-purple-400 border-purple-800";
      case "delivered": return "bg-green-900/20 text-green-400 border-green-800";
      case "cancelled": return "bg-red-900/20 text-red-400 border-red-800";
      default: return "bg-brand-dark-lighter text-gray-400 border-brand-dark-border";
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <>
      <Helmet>
        <title>My Orders | Dhriti Enterprise</title>
      </Helmet>

      <div className="bg-brand-dark-lighter border-b border-brand-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">My Orders</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-brand-dark-lighter rounded-2xl border border-brand-dark-border">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Orders Yet</h2>
            <p className="text-gray-400 mb-6">Looks like you haven't placed any orders with us.</p>
            <Link to="/products" className="inline-flex px-6 py-3 bg-brand-gold text-brand-dark font-bold rounded-lg">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-brand-dark rounded-xl border border-brand-dark-border overflow-hidden shadow-sm">
                
                {/* Order Header */}
                <div className="bg-brand-dark-lighter p-4 md:p-6 border-b border-brand-dark-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Order Placed</p>
                      <p className="text-sm font-semibold text-white">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric", month: "long", day: "numeric"
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Total</p>
                      <p className="text-sm font-semibold text-brand-gold">{formatPrice(order.totalPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Order ID</p>
                      <p className="text-sm font-semibold text-white">{order.orderNumber}</p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 md:p-6">
                  <div className="divide-y divide-brand-dark-border">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                        <div className="w-16 h-16 rounded border border-brand-dark-border bg-brand-dark-lighter flex items-center justify-center overflow-hidden shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-lighten" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrderHistoryPage;
