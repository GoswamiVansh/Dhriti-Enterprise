import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";

import api from "@/lib/axios";
import { setCredentials } from "@/store/slices/authSlice";
import type { RootState } from "@/store/store";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo } = useSelector((state: RootState) => state.auth);
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/auth/register", { 
        name, 
        email, 
        phone, 
        password 
      });
      
      dispatch(setCredentials(res.data.data));
      
      // Guest cart merge logic
      const guestCartStr = localStorage.getItem("de_cart_guest");
      if (guestCartStr) {
        try {
          const guestCartItems = JSON.parse(guestCartStr);
          if (Array.isArray(guestCartItems) && guestCartItems.length > 0) {
            await api.post("/cart/merge", { 
              items: guestCartItems.map(item => ({ 
                productId: item.productId, 
                quantity: item.quantity 
              })) 
            });
            localStorage.removeItem("de_cart_guest");
          }
        } catch {}
      }

      toast.success("Account created successfully!");
      navigate(redirect);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account | Dhriti Enterprise</title>
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-dark">
        <div className="max-w-md w-full bg-brand-dark-lighter p-8 rounded-2xl shadow-sm border border-brand-dark-border">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Create an Account</h2>
            <p className="text-sm text-gray-400 mt-2">
              Join us to enjoy a seamless shopping experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border text-white rounded-lg focus:outline-none focus:border-brand-gold text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border text-white rounded-lg focus:outline-none focus:border-brand-gold text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border text-white rounded-lg focus:outline-none focus:border-brand-gold text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border text-white rounded-lg focus:outline-none focus:border-brand-gold text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border text-white rounded-lg focus:outline-none focus:border-brand-gold text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 mt-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-brand-dark bg-brand-gold hover:bg-brand-gold-light focus:outline-none transition-colors disabled:opacity-70"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to={redirect !== "/" ? `/login?redirect=${redirect}` : "/login"}
                className="font-semibold text-brand-gold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
