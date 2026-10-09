export const ProductCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden bg-white/60">
    <div className="aspect-[3/4] skeleton-shimmer" />
    <div className="p-4 space-y-3">
      <div className="h-4 w-3/4 rounded skeleton-shimmer" />
      <div className="h-4 w-1/3 rounded skeleton-shimmer" />
      <div className="h-6 w-1/2 rounded skeleton-shimmer" />
    </div>
  </div>
);
