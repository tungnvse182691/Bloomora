import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { Button } from '../components/ui/Button';
import { ProductGrid } from '../components/product/ProductGrid';
import { FilterSidebar } from '../components/product/FilterSidebar';
import { Reveal } from '../components/effects/Reveal';
import { getProducts, getCategories, getOccasions } from '../services/product.service';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Nổi bật' },
  { value: 'bestseller', label: 'Bán chạy' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'rating', label: 'Đánh giá cao' },
];

const EMPTY_FILTERS = {
  category: '',
  occasions: [],
  minPrice: '',
  maxPrice: '',
  colors: [],
  minRating: 0,
};

const PAGE_SIZE = 12;

export default function Shop() {
  useDocumentTitle('Cửa hàng — Bloomora');
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);

  const q = searchParams.get('q') || '';

  // ---- Đồng bộ query params (category / occasion) vào filters
  useEffect(() => {
    const category = searchParams.get('category') || '';
    const occasion = searchParams.get('occasion') || '';
    const sortParam = searchParams.get('sort');
    setFilters((f) => ({
      ...f,
      category,
      occasions: occasion ? [occasion] : f.occasions.length && !occasion ? [] : f.occasions,
    }));
    if (sortParam && SORT_OPTIONS.some((o) => o.value === sortParam)) setSort(sortParam);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ---- Taxonomies
  useEffect(() => {
    (async () => {
      try {
        const [c, o] = await Promise.all([getCategories(), getOccasions()]);
        setCategories(c.items || []);
        setOccasions(o.items || []);
      } catch (err) {
        toast.error(err.message || 'Không tải được danh mục');
      }
    })();
  }, []);

  // ---- Fetch sản phẩm
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = { sort, page, limit: PAGE_SIZE };
        if (q) params.q = q;
        if (filters.category) params.category = filters.category;
        if (filters.occasions[0]) params.occasion = filters.occasions[0];
        if (filters.minPrice !== '' && filters.minPrice != null) params.minPrice = filters.minPrice;
        if (filters.maxPrice !== '' && filters.maxPrice != null) params.maxPrice = filters.maxPrice;
        if (filters.colors.length) params.colors = filters.colors.join(',');
        const res = (await getProducts(params)) || {};
        if (!cancelled) setData({ items: res.items || [], total: res.total || 0, totalPages: res.totalPages || 1 });
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Không tải được sản phẩm');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, filters, sort, page]);

  // ---- Lọc client-side cho các tiêu chí API chưa hỗ trợ (minRating, occasions phụ)
  const visibleItems = useMemo(() => {
    const occasionIdBySlug = new Map(occasions.map((o) => [o.slug, o.id]));
    let items = data?.items || [];
    if (filters.minRating > 0) items = items.filter((p) => p.rating >= filters.minRating);
    if (filters.occasions.length > 1) {
      const ids = new Set(filters.occasions.map((s) => occasionIdBySlug.get(s)).filter(Boolean));
      items = items.filter((p) => (p.occasionIds || []).some((id) => ids.has(id)));
    }
    return items;
  }, [data?.items, filters.minRating, filters.occasions, occasions]);

  const handleFilterChange = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    filters.occasions.length +
    filters.colors.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.minPrice !== '' || filters.maxPrice !== '' ? 1 : 0);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, Math.min(page - 2, data.totalPages - 4));
    for (let i = start; i <= Math.min(data.totalPages, start + 4); i += 1) pages.push(i);
    return pages;
  }, [page, data.totalPages]);

  const sidebar = (
    <FilterSidebar
      filters={filters}
      onChange={handleFilterChange}
      categories={categories}
      occasions={occasions}
    />
  );

  return (
    <div className="bg-cream min-h-screen">
      {/* Banner */}
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1920&q=80&auto=format&fit=crop"
          alt="Cửa hàng hoa Bloomora"
          className="w-full h-56 md:h-72 object-cover"
        />
        <div className="absolute inset-0 bg-ink/55 flex flex-col items-center justify-center text-center px-6">
          <h1 className="font-display text-cream text-4xl md:text-6xl">
            {q ? `Tìm kiếm: “${q}”` : 'Cửa Hàng Hoa'}
          </h1>
          <p className="mt-3 text-cream/80 text-sm md:text-base">
            {data.total} sản phẩm tươi mới đang chờ bạn
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 flex gap-8">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24 rounded-3xl bg-white border border-ink/10 p-6 max-h-[calc(100vh-7rem)] overflow-y-auto">
            {sidebar}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setDrawerOpen(true)}
              >
                <TuneIcon fontSize="small" /> Bộ lọc
                {activeFilterCount > 0 && (
                  <span className="ml-1 min-w-5 h-5 px-1 rounded-full bg-rose text-cream text-[11px] font-bold inline-flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <p className="text-sm text-ink-soft">
                Tìm thấy <span className="font-bold text-ink">{data.total}</span> sản phẩm
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <span className="hidden sm:inline">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm text-ink font-medium outline-none focus:border-rose cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => { setFilters(EMPTY_FILTERS); setPage(1); }}
              className="mb-4 text-sm text-rose-deep font-semibold hover:underline cursor-pointer"
            >
              ✕ Xóa tất cả bộ lọc
            </button>
          )}

          <Reveal>
            <ProductGrid products={visibleItems} loading={loading} />
          </Reveal>

          {/* Phân trang */}
          {data.totalPages > 1 && !loading && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-10 h-10 rounded-full border border-ink/15 flex items-center justify-center text-ink hover:bg-ink hover:text-cream transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink cursor-pointer"
                aria-label="Trang trước"
              >
                <ChevronLeftIcon />
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`w-10 h-10 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                    n === page ? 'bg-ink text-cream' : 'border border-ink/15 text-ink hover:bg-sand'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                className="w-10 h-10 rounded-full border border-ink/15 flex items-center justify-center text-ink hover:bg-ink hover:text-cream transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink cursor-pointer"
                aria-label="Trang sau"
              >
                <ChevronRightIcon />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-cream p-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-ink">Bộ lọc</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-sand flex items-center justify-center text-ink cursor-pointer"
                aria-label="Đóng bộ lọc"
              >
                <CloseIcon />
              </button>
            </div>
            {sidebar}
            <Button className="w-full mt-6" onClick={() => setDrawerOpen(false)}>
              Xem {data.total} sản phẩm
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
