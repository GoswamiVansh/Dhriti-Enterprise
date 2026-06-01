import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";

import api from "@/lib/axios";
import { setCredentials } from "@/store/slices/authSlice";
import type { RootState } from "@/store/store";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo } = useSelector((state: RootState) => state.auth);

  // Get redirect url from query params
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";

  useEffect(() => {
    // If already logged in, redirect
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      
      // Store user info and token
      dispatch(setCredentials(res.data.data));
      
      // Attempt to merge guest cart with user cart
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
            // Clear guest cart
            localStorage.removeItem("de_cart_guest");
          }
        } catch {
          // ignore parsing error
        }
      }

      toast.success(`Welcome back, ${res.data.data.name}!`);
      navigate(redirect);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Dhriti Enterprise</title>
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-dark">
        <div className="max-w-md w-full bg-brand-dark-lighter p-8 rounded-2xl shadow-sm border border-brand-dark-border">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-brand-gold rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-brand-dark font-bold text-xl">DE</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-sm text-gray-400 mt-2">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-brand-dark border border-brand-dark-border rounded-lg text-white focus:outline-none focus:border-brand-gold text-sm placeholder-gray-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-gold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-brand-dark border border-brand-dark-border rounded-lg text-white focus:outline-none focus:border-brand-gold text-sm placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-brand-dark bg-brand-gold hover:bg-brand-gold-light focus:outline-none transition-colors disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                to={redirect !== "/" ? `/register?redirect=${redirect}` : "/register"}
                className="font-semibold text-brand-gold hover:underline"
              >
                Create one now
              </Link>
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-brand-dark-border text-center">
             <p className="text-xs text-gray-400 mb-2">Admin Demo Credentials:</p>
             <div className="bg-brand-dark p-2 rounded text-xs text-gray-400 inline-block text-left border border-brand-dark-border">
                <p>Email: admin@dhriti.com</p>
                <p>Pass: admin123</p>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
