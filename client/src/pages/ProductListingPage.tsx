import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Filter, X, SlidersHorizontal, ChevronRight } from "lucide-react";
import api from "@/lib/axios";
import type { IProduct, ICategory, IPagination } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { PageSkeleton } from "@/components/common/Loader";

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter states derived from URL params
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const inStockOnly = searchParams.get("inStock") === "true";
  const currentSearch = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Construct query string
        const params = new URLSearchParams(searchParams);
        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Reset to page 1 on filter change
    if (!updates.page) {
      newParams.set("page", "1");
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-brand-dark flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-gold" /> Filters
        </h3>
        {(currentCategory || inStockOnly || currentSearch) && (
          <button
            onClick={clearFilters}
            className="text-xs text-brand-gold hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-sm font-medium text-brand-dark mb-3">Categories</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="category"
              checked={currentCategory === ""}
              onChange={() => updateFilters({ category: null })}
              className="text-brand-gold focus:ring-brand-gold bg-gray-50 border-gray-200"
            />
            <span className="text-sm text-gray-600 group-hover:text-brand-dark">All Categories</span>
          </label>
          {categories.map((category) => (
            <label key={category._id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={currentCategory === category._id}
                onChange={() => updateFilters({ category: category._id })}
                className="text-brand-gold focus:ring-brand-gold bg-gray-50 border-gray-200"
              />
              <span className="text-sm text-gray-600 group-hover:text-brand-dark">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-250" />

      {/* Availability */}
      <div>
        <h4 className="text-sm font-medium text-brand-dark mb-3">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateFilters({ inStock: e.target.checked ? "true" : null })}
            className="rounded text-brand-gold focus:ring-brand-gold bg-gray-50 border-gray-200"
          />
          <span className="text-sm text-gray-600 group-hover:text-brand-dark">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen text-gray-900">
      <Helmet>
        <title>Products | Dhriti Enterprise</title>
        <meta name="description" content="Browse our complete collection of products." />
      </Helmet>

      {/* Breadcrumb & Header Video Banner */}
      <div className="relative overflow-hidden py-20 md:py-32 lg:py-40 min-h-[280px] md:min-h-[380px] flex items-center bg-brand-dark">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/Create_a_premium_cinematic_lux.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35 z-10" />

        <div className="max-w-7xl mx-auto px-4 relative z-20 w-full">
          <div className="flex items-center gap-2 text-xs text-gray-300 mb-3">
            <Link to="/" className="hover:text-brand-gold transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-brand-gold" />
            <span className="text-white">Products</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-wide leading-tight">
            {currentSearch ? `Search Results for "${currentSearch}"` : "Our Premium Catalog"}
          </h1>
          <p className="text-sm text-gray-300 mt-2 max-w-xl leading-relaxed">
            Explore our curated selection of high-end sanitary ware, luxury fittings, and architectural hardware designed for modern spaces.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterSidebar />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Top Bar (Mobile Toggle & Sort) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
              <button
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:border-brand-gold/50"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal className="w-4 h-4 text-brand-gold" />
                Filters
              </button>

              <div className="text-sm text-gray-500">
                Showing {products.length} of {pagination?.total || 0} products
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm text-gray-500 shrink-0">Sort by:</label>
                <select
                  value={currentSort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:border-brand-gold w-full sm:w-auto"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <PageSkeleton />
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-brand-gold/50"
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center gap-1 px-4 text-sm font-medium text-brand-gold">
                        Page {currentPage} of {pagination.pages}
                      </div>

                      <button
                        disabled={currentPage === pagination.pages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-brand-gold/50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <Search className="w-8 h-8 text-brand-gold/50" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">We couldn't find anything matching your current filters.</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-brand-gold text-brand-dark text-sm font-bold rounded-lg hover:bg-brand-gold-light transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-xl flex flex-col animate-slide-in border-l border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5 text-gray-500 hover:text-brand-gold" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterSidebar />
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-brand-gold text-brand-dark text-sm font-bold rounded-lg animate-pulse"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListingPage;
