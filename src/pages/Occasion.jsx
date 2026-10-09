import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import LocalFlorist from '@mui/icons-material/LocalFlorist';
import { getOccasions, getProducts } from '../services/product.service';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ProductGrid } from '../components/product/ProductGrid';
import { EmptyState } from '../components/ui/EmptyState';

export default function Occasion() {
  const { slug } = useParams();
  const [occasion, setOccasion] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useDocumentTitle(occasion ? `Hoa ${occasion.name} | Bloomora` : 'Dịp lễ | Bloomora');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const [{ items: occasions } = {}, { items } = {}] = await Promise.all([
          getOccasions(),
          getProducts({ occasion: slug, limit: 24 }),
        ]);
        const occ = occasions.find((o) => o.slug === slug);
        if (!occ) throw new Error('not found');
        setOccasion(occ);
        setProducts(items || []);
      } catch {
        setError(true);
        toast.error('Không tải được dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (!loading && (error || !occasion)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <EmptyState
          icon={<LocalFlorist fontSize="large" />}
          title="Không tìm thấy dịp lễ"
          description="Dịp lễ này không tồn tại. Hãy khám phá các bộ sưu tập hoa khác nhé!"
          action={
            <Link to="/shop" className="rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-ink-soft">
              Khám phá cửa hàng
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-cream">
      {/* Hero banner */}
      <div className="relative h-64 overflow-hidden md:h-80">
        {occasion?.image && (
          <img src={occasion.image} alt={occasion.name} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-ink/50" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-4 text-center">
          {loading ? (
            <div className="h-10 w-56 animate-pulse rounded-xl bg-white/20" />
          ) : (
            <>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-cream/80">Bộ sưu tập</p>
              <h1 className="mt-2 font-display text-4xl font-bold text-cream md:text-5xl">Hoa {occasion?.name}</h1>
              <p className="mt-3 max-w-xl text-cream/85">
                Những mẫu hoa được tuyển chọn riêng cho dịp {occasion?.name?.toLowerCase()} — tươi mới mỗi ngày, giao tận nơi trong 2 giờ.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        {loading ? (
          <ProductGrid products={[]} loading />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<LocalFlorist fontSize="large" />}
            title="Chưa có sản phẩm cho dịp này"
            description="Chúng tôi đang bổ sung thêm mẫu mới. Bạn có thể xem toàn bộ cửa hàng."
            action={
              <Link to="/shop" className="rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-ink-soft">
                Xem tất cả hoa
              </Link>
            }
          />
        ) : (
          <>
            <p className="mb-6 text-sm text-ink/50">{products.length} mẫu hoa cho dịp {occasion?.name?.toLowerCase()}</p>
            <ProductGrid products={products} />
          </>
        )}
      </div>
    </div>
  );
}
