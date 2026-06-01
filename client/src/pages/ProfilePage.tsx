import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { User, Mail, Phone, MapPin, Package, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "@/lib/axios";
import { logout } from "@/store/slices/authSlice";
import { resetCart } from "@/store/slices/cartSlice";
import type { RootState } from "@/store/store";
import { PageSkeleton } from "@/components/common/Loader";
import type { IUser } from "@/types";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  
  const [profile, setProfile] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setProfile(res.data.data);
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
    dispatch(logout());
    dispatch(resetCart());
    navigate("/");
    toast.success("Logged out successfully");
  };

  if (loading) return <PageSkeleton />;

  return (
    <>
      <Helmet>
        <title>My Profile | Dhriti Enterprise</title>
      </Helmet>

      <div className="bg-brand-dark-lighter border-b border-brand-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">My Profile</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-brand-dark rounded-xl border border-brand-dark-border shadow-sm p-6 text-center">
              <div className="w-24 h-24 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-gold">
                <User className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
              <p className="text-sm text-gray-400 capitalize">{profile?.role}</p>
            </div>

            <div className="bg-brand-dark rounded-xl border border-brand-dark-border shadow-sm overflow-hidden">
              <nav className="flex flex-col">
                <Link to="/orders" className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-gray-300 hover:bg-brand-dark-lighter border-b border-brand-dark-border">
                  <Package className="w-5 h-5 text-gray-400" />
                  My Orders
                </Link>
                {profile?.role === "admin" && (
                  <Link to="/admin/products" className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-gray-300 hover:bg-brand-dark-lighter border-b border-brand-dark-border">
                    <User className="w-5 h-5 text-gray-400" />
                    Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-500 hover:bg-red-900/20 text-left">
                  <LogOut className="w-5 h-5 text-red-400" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-brand-dark rounded-xl border border-brand-dark-border shadow-sm p-6">
              <h3 className="text-lg font-bold text-white mb-6 pb-4 border-b border-brand-dark-border">Personal Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-400">Email Address</p>
                    <p className="text-white">{profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-400">Phone Number</p>
                    <p className="text-white">{profile?.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-dark rounded-xl border border-brand-dark-border shadow-sm p-6">
              <h3 className="text-lg font-bold text-white mb-6 pb-4 border-b border-brand-dark-border">Saved Addresses</h3>
              {profile?.addresses && profile.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.addresses.map((address, idx) => (
                    <div key={idx} className="border border-brand-dark-border rounded-lg p-4">
                      {address.isDefault && (
                        <span className="inline-block px-2 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-bold rounded mb-2">DEFAULT</span>
                      )}
                      <p className="text-sm text-white mb-1">{address.street}</p>
                      <p className="text-sm text-gray-400">{address.city}, {address.state} {address.zipCode}</p>
                      <p className="text-sm text-gray-400">{address.country}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-brand-dark-lighter rounded-lg border border-brand-dark-border">
                  <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No saved addresses found.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProfilePage;
