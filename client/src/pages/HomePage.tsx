import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";
import api from "@/lib/axios";
import type { IProduct, ICategory } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { PageSkeleton } from "@/components/common/Loader";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products?featured=true&limit=8"),
          api.get("/categories"),
        ]);
        setFeaturedProducts(productsRes.data.data);
        setCategories(categoriesRes.data.data);
      } catch (error) {
        console.error("Failed to fetch home data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <>
      <Helmet>
        <title>Dhriti Enterprise | Premium Sanitary & Hardware Store</title>
        <meta
          name="description"
          content="Your one-stop destination for premium sanitary hardwares, plumbing supplies, and building materials."
        />
      </Helmet>

      {/* Hero Banner */}
      <section className="bg-hero-gradient text-white py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div className="animate-fade-in-up">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wider mb-6">
              NEW ARRIVALS 2026
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Premium Sanitary <br />
              <span className="text-brand-gold">Hardware Solutions</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg">
              Transform your spaces with our exquisite collection of sanitary ware,
              faucets, and building materials. Quality you can trust.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="px-8 py-3.5 bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                SHOP NOW
              </Link>
              <Link
                to="/categories/plumbing-supplies"
                className="px-8 py-3.5 bg-brand-dark-lighter hover:bg-brand-dark border border-brand-dark-border text-white font-semibold rounded-lg transition-colors"
              >
                EXPLORE PLUMBING
              </Link>
            </div>
          </div>
          <div className="hidden md:block relative animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
             {/* Using a placeholder since we don't have a real image asset yet */}
             <div className="aspect-[4/3] bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
               <div className="w-full h-full bg-brand-navy/50 rounded-xl flex items-center justify-center">
                  <p className="text-white/50 font-medium">Elegant Bathroom Setting</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-brand-dark-lighter border-b border-brand-dark-border py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Truck, title: "Free Delivery", desc: "On orders above ₹4999" },
            { icon: ShieldCheck, title: "Premium Quality", desc: "100% Genuine Brands" },
            { icon: RefreshCw, title: "Easy Returns", desc: "7 Days return policy" },
            { icon: Headphones, title: "Customer Support", desc: "Call us anytime" },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center mb-3">
                <feature.icon className="w-6 h-6 text-brand-gold" />
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">{feature.title}</h4>
              <p className="text-xs text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Shop by Category
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Browse our extensive collection organized by category to find exactly what you need for your next project.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="group bg-brand-dark-lighter rounded-xl p-6 text-center border border-brand-dark-border shadow-sm hover:shadow-md hover:border-brand-gold/50 transition-all"
              >
                <div className="w-16 h-16 mx-auto bg-brand-dark rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-gold/10 transition-colors border border-brand-dark-border group-hover:border-brand-gold/30">
                  <span className="text-xl font-bold text-brand-gold/50 group-hover:text-brand-gold">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-medium text-white text-sm mb-2">
                  {category.name}
                </h3>
                <span className="text-xs text-brand-gold font-medium group-hover:underline">
                  Explore Now →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-brand-dark-lighter">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Featured Products
              </h2>
              <p className="text-gray-400">Handpicked premium selections for you.</p>
            </div>
            <Link
              to="/products"
              className="hidden md:inline-flex items-center text-sm font-semibold text-brand-gold hover:text-white transition-colors"
            >
              View All Products →
            </Link>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">No featured products found.</p>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-brand-gold text-brand-dark text-sm font-bold rounded-lg"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Partners Marquee */}
      {/* <section className="py-12 border-t border-b border-brand-dark-border bg-brand-dark overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
            Trusted by Top Brands
          </p>
        </div>
        <div className="flex w-full">
           <div className="flex animate-shimmer whitespace-nowrap min-w-full justify-around items-center gap-12 px-8">
              {["Jaquar", "Hindware", "Cera", "Kohler", "Grohe", "Parryware", "Kajaria"].map((brand) => (
                <span key={brand} className="text-2xl font-bold text-gray-300 mx-8">
                  {brand}
                </span>
              ))}
           </div>
           {/* Duplicate for seamless infinite scroll effect */}
           {/* <div className="flex animate-shimmer whitespace-nowrap min-w-full justify-around items-center gap-12 px-8">
              {["Jaquar", "Hindware", "Cera", "Kohler", "Grohe", "Parryware", "Kajaria"].map((brand) => (
                <span key={`${brand}-dup`} className="text-2xl font-bold text-gray-300 mx-8">
                  {brand}
                </span>
              ))}
           </div>
        </div>
      // </section> */} 
    </>
  );
};

export default HomePage;
