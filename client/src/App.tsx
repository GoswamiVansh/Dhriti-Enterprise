import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Components
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import TopBar from "@/components/common/TopBar";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import AdminRoute from "@/components/common/AdminRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import LoginPopup from "@/components/common/LoginPopup";

// Pages
import HomePage from "@/pages/HomePage";
import ProductListingPage from "@/pages/ProductListingPage";
import ProductDetailsPage from "@/pages/ProductDetailsPage";
import CartPage from "@/pages/CartPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderHistoryPage from "@/pages/OrderHistoryPage";

import ProfilePage from "@/pages/ProfilePage";
import AdminOrdersPage from "@/pages/AdminOrdersPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AboutPage from "@/pages/AboutPage";

// Admin Pages (Placeholders for now, will implement if requested)
const AdminDashboard = () => <div className="p-8 text-center"><h1 className="text-2xl font-bold text-white">Admin Dashboard</h1></div>;

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'text-sm font-medium',
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10A37F',
              secondary: '#fff',
            },
          },
        }} 
      />
      
      <div className="flex flex-col min-h-screen">
        <LoginPopup />
        <TopBar />
        <Header />
        
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/products" element={<ProductListingPage />} />
            <Route path="/product/:slug" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProductsPage />} />
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={
              <div className="p-20 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-500 mb-6">Page not found</p>
                <a href="/" className="text-brand-teal hover:underline font-medium">Return Home</a>
              </div>
            } />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
