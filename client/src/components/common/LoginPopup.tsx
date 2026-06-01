import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { RootState } from "@/store/store";

const LoginPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in, don't show the popup
    if (userInfo) return;

    // Check if the user has already dismissed the popup
    const hasDismissed = localStorage.getItem("loginPopupDismissed");
    if (hasDismissed) return;

    // Show popup after 3 seconds of page load
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [userInfo]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("loginPopupDismissed", "true");
  };

  const handleLoginClick = () => {
    handleClose();
    navigate("/login");
  };

  const handleRegisterClick = () => {
    handleClose();
    navigate("/register");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-brand-dark-lighter border border-brand-dark-border rounded-2xl shadow-2xl p-8 text-center"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-brand-gold rounded-2xl mx-auto flex items-center justify-center mb-6">
              <span className="text-brand-dark font-extrabold text-2xl">DE</span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Welcome to Dhriti Enterprise</h3>
            <p className="text-gray-400 text-sm mb-8">
              Log in to access exclusive wholesale pricing, track your orders, and enjoy a seamless shopping experience.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleLoginClick}
                className="w-full py-3 bg-brand-gold hover:bg-yellow-500 text-brand-dark font-bold rounded-xl transition-colors shadow-lg"
              >
                Log In
              </button>
              <button
                onClick={handleRegisterClick}
                className="w-full py-3 bg-brand-dark hover:bg-black border border-brand-dark-border text-white font-bold rounded-xl transition-colors"
              >
                Create an Account
              </button>
            </div>
            
            <button 
              onClick={handleClose}
              className="mt-6 text-xs text-gray-500 hover:text-white transition-colors underline"
            >
              Continue as guest
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginPopup;
