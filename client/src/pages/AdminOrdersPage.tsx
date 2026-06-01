import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { Package, Search, ChevronDown, CheckCircle } from "lucide-react";

import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import type { IOrder, IPagination } from "@/types";
import { PageSkeleton } from "@/components/common/Loader";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/orders?page=${page}&limit=10${statusFilter ? `&status=${statusFilter}` : ""}`);
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated");
      // Update local state to reflect change without full refetch
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus as any } : order
      ));
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && orders.length === 0) return <PageSkeleton />;

  return (
    <div className="bg-brand-dark min-h-screen pb-12">
      <Helmet>
        <title>Admin: Manage Orders | Dhriti Enterprise</title>
      </Helmet>

      <div className="bg-brand-dark-lighter border-b border-brand-dark-border sticky top-16 md:top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-brand-gold" />
              Manage Orders
            </h1>
            <p className="text-sm text-gray-400 mt-1">View and update customer orders</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-brand-dark-border rounded-lg text-sm focus:outline-none focus:border-brand-gold bg-brand-dark text-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-brand-dark-lighter rounded-xl shadow-sm border border-brand-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-dark border-b border-brand-dark-border text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="p-4">Order ID / Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items / Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark-border text-sm">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-brand-dark transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white mb-1">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric", month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-white mb-1">{order.user?.name || "Guest User"}</p>
                      <p className="text-xs text-gray-400">{order.user?.email || order.shippingAddress.fullName}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white mb-1">{order.items.length} items</p>
                      <p className="font-bold text-brand-gold">{formatPrice(order.totalPrice)}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-1 bg-brand-dark border border-brand-dark-border text-gray-300 text-[10px] font-bold rounded uppercase">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        disabled={updatingId === order._id || order.status === "cancelled"}
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="px-3 py-1.5 border border-brand-dark-border rounded text-sm bg-brand-dark text-white focus:outline-none focus:border-brand-gold disabled:opacity-50 font-medium"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              No orders found matching your criteria.
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="p-4 border-t border-brand-dark-border flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Showing page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border border-brand-dark-border text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-brand-dark"
                >
                  Previous
                </button>
                <button
                  disabled={page === pagination.pages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border border-brand-dark-border text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-brand-dark"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
