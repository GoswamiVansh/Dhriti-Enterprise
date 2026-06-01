const Loader = () => {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
        <div className="w-12 h-12 rounded-full border-4 border-brand-teal border-t-transparent animate-spin absolute inset-0"></div>
      </div>
    </div>
  );
};

const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
      <div className="aspect-square bg-gray-100 shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 shimmer rounded w-3/4" />
        <div className="h-3 bg-gray-100 shimmer rounded w-1/2" />
        <div className="h-5 bg-gray-100 shimmer rounded w-1/3" />
        <div className="h-10 bg-gray-100 shimmer rounded" />
      </div>
    </div>
  );
};

const PageSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="h-8 bg-gray-100 shimmer rounded w-1/4" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export { Loader, ProductSkeleton, PageSkeleton };
