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
        <h3 className="font-semibold text-white flex items-center gap-2">
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
        <h4 className="text-sm font-medium text-white mb-3">Categories</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="category"
              checked={currentCategory === ""}
              onChange={() => updateFilters({ category: null })}
              className="text-brand-gold focus:ring-brand-gold bg-brand-dark-lighter border-brand-dark-border"
            />
            <span className="text-sm text-gray-400 group-hover:text-white">All Categories</span>
          </label>
          {categories.map((category) => (
            <label key={category._id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={currentCategory === category._id}
                onChange={() => updateFilters({ category: category._id })}
                className="text-brand-gold focus:ring-brand-gold bg-brand-dark-lighter border-brand-dark-border"
              />
              <span className="text-sm text-gray-400 group-hover:text-white">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-brand-dark-border" />

      {/* Availability */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateFilters({ inStock: e.target.checked ? "true" : null })}
            className="rounded text-brand-gold focus:ring-brand-gold bg-brand-dark-lighter border-brand-dark-border"
          />
          <span className="text-sm text-gray-400 group-hover:text-white">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Products | Dhriti Enterprise</title>
        <meta name="description" content="Browse our complete collection of products." />
      </Helmet>

      {/* Breadcrumb & Header */}
      <div className="bg-brand-dark-lighter border-b border-brand-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link to="/" className="hover:text-brand-gold">Home</Link>
            <ChevronRight className="w-3 h-3 text-brand-gold/50" />
            <span className="text-white">Products</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {currentSearch ? `Search Results for "${currentSearch}"` : "All Products"}
          </h1>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-brand-dark-border">
              <button
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-white bg-brand-dark-lighter px-4 py-2 rounded-lg border border-brand-dark-border hover:border-brand-gold/50"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal className="w-4 h-4 text-brand-gold" />
                Filters
              </button>

              <div className="text-sm text-gray-400">
                Showing {products.length} of {pagination?.total || 0} products
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm text-gray-400 shrink-0">Sort by:</label>
                <select
                  value={currentSort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="text-sm border border-brand-dark-border rounded-lg px-3 py-2 bg-brand-dark-lighter text-white focus:outline-none focus:border-brand-gold w-full sm:w-auto"
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
                        className="px-4 py-2 border border-brand-dark-border rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-dark hover:border-brand-gold/50"
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center gap-1 px-4 text-sm font-medium text-brand-gold">
                        Page {currentPage} of {pagination.pages}
                      </div>

                      <button
                        disabled={currentPage === pagination.pages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-4 py-2 border border-brand-dark-border rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-dark hover:border-brand-gold/50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-brand-dark-lighter rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-dark-border">
                  <Search className="w-8 h-8 text-brand-gold/50" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No products found</h3>
                <p className="text-gray-400 mb-6">We couldn't find anything matching your current filters.</p>
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
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-brand-dark shadow-xl flex flex-col animate-slide-in border-l border-brand-dark-border">
            <div className="flex items-center justify-between p-4 border-b border-brand-dark-border">
              <h3 className="font-semibold text-white">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-brand-gold" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterSidebar />
            </div>
            <div className="p-4 border-t border-brand-dark-border">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-brand-gold text-brand-dark text-sm font-bold rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductListingPage;
