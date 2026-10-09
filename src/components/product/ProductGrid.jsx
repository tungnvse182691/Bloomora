import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';

export const ProductGrid = ({ products = [], loading = false }) => (
  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    {loading
      ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
      : products.map((p) => <ProductCard key={p.id || p.slug} product={p} />)}
  </div>
);
