import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import api from "@/lib/axios";
import type { IProduct, ICategory } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { PageSkeleton } from "@/components/common/Loader";

const categoryUIConfig: Record<string, { title: string; image: string }> = {
  "door-handle": { title: "Mortise Handles", image: "/images/category_handles.png" },
  "door-aldrop": { title: "Aldrops", image: "/images/category_aldrops.png" },
  "door-stopper": { title: "Door Accessories", image: "/images/category_pull_handles.png" },
  "curtain-bracket": { title: "Curtain Brackets", image: "/images/category_brackets.png" },
  "soap-dish": { title: "Bath Accessories", image: "/images/category_soap_dish.png" },
};

const getCategoryUI = (slug: string, name: string) => {
  if (categoryUIConfig[slug]) {
    return categoryUIConfig[slug];
  }
  if (slug.includes("handle")) return categoryUIConfig["door-handle"];
  if (slug.includes("aldrop")) return categoryUIConfig["door-aldrop"];
  if (slug.includes("curtain")) return categoryUIConfig["curtain-bracket"];
  if (slug.includes("stopper") || slug.includes("support")) return categoryUIConfig["door-stopper"];
  if (slug.includes("dish") || slug.includes("holder") || slug.includes("shelf")) return categoryUIConfig["soap-dish"];
  
  return {
    title: name,
    image: "/images/category_handles.png",
  };
};

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
      <section 
        className="relative text-white py-20 md:py-32 lg:py-40 bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: "url('/ChatGPT%20Image%20Jun%202,%202026,%2012_27_07%20AM.png')" }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35 z-0" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block px-3 py-1 bg-brand-gold/20 text-brand-gold border border-brand-gold/30 rounded-full text-xs font-semibold tracking-wider mb-6">
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
        </div>
      </section>


      {/* Shop by Category */}
      <section className="py-20 bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-xl md:text-2xl font-bold text-brand-dark uppercase tracking-[0.2em] mb-2">
              Browse by Category
            </h2>
            <div className="w-12 h-[2px] bg-brand-gold mx-auto" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.slice(0, 5).map((category) => {
              const ui = getCategoryUI(category.slug, category.name);
              return (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="relative aspect-[4/5] rounded-lg overflow-hidden group shadow-md hover:shadow-2xl transition-all duration-500 bg-[#164332]"
                >
                  {/* Background Product Image */}
                  <img 
                    src={ui.image} 
                    alt={ui.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90"
                  />
                  
                  {/* Lighter green-tinted overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e2c20]/90 via-[#164332]/30 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-95" />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-5 md:p-6">
                    <h3 className="text-white font-bold text-sm md:text-base uppercase tracking-wider mb-2 leading-tight max-w-[90%]">
                      {ui.title}
                    </h3>
                    <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest flex items-center gap-1 group-hover:text-white transition-colors duration-300">
                      EXPLORE
                      <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-3">
                Featured Products
              </h2>
              <p className="text-gray-500">Handpicked premium selections for you.</p>
            </div>
            <Link
              to="/products"
              className="hidden md:inline-flex items-center text-sm font-semibold text-brand-gold hover:text-brand-dark transition-colors"
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
