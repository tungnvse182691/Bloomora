import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductGrid } from '../components/product/ProductGrid';
import { Reveal } from '../components/effects/Reveal';
import { getProducts } from '../services/product.service';
import { useWishlistStore } from '../store/useWishlistStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Wishlist() {
  useDocumentTitle('Danh sách yêu thích — Bloomora');
  const ids = useWishlistStore((s) => s.ids);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { items } = await getProducts({ limit: 100 });
        if (!cancelled) setProducts((items || []).filter((p) => ids.includes(p.id)));
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Không tải được danh sách yêu thích');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ids]);

  return (
    <div className="bg-cream min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <Reveal>
          <SectionHeading
            eyebrow="Bloomora"
            title="Danh Sách Yêu Thích"
            subtitle={products.length > 0 ? `${products.length} sản phẩm bạn đã lưu` : ''}
          />
        </Reveal>

        <div className="mt-10">
          {products.length === 0 && !loading ? (
            <EmptyState
              icon={<FavoriteBorderIcon style={{ fontSize: 72 }} />}
              title="Chưa có sản phẩm yêu thích"
              description="Nhấn vào biểu tượng trái tim trên sản phẩm để lưu lại những mẫu hoa bạn thích nhất."
              action={
                <Link to="/shop">
                  <Button size="lg">Khám phá cửa hàng</Button>
                </Link>
              }
            />
          ) : (
            <ProductGrid products={products} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
}
