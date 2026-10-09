import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

const ALL_COLORS = ['Đỏ', 'Hồng', 'Trắng', 'Vàng', 'Tím', 'Cam'];

const defaultFilters = {
  category: '',
  occasions: [],
  minPrice: '',
  maxPrice: '',
  colors: [],
  minRating: 0,
  inStock: false,
};

const toggleArr = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

const SectionTitle = ({ children }) => (
  <h4 className="font-semibold text-ink text-sm uppercase tracking-wider mb-3">{children}</h4>
);

export const FilterSidebar = ({ filters, onChange, categories = [], occasions = [] }) => {
  const f = { ...defaultFilters, ...filters };
  const set = (patch) => onChange({ ...f, ...patch });

  const isDirty =
    f.category ||
    f.occasions.length ||
    f.minPrice !== '' ||
    f.maxPrice !== '' ||
    f.colors.length ||
    f.minRating > 0 ||
    f.inStock;

  return (
    <div className="bg-white rounded-2xl p-5 space-y-6">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-display text-lg text-ink">
          <FilterListIcon style={{ fontSize: 20 }} />
          Bộ lọc
        </span>
        {isDirty && (
          <button
            onClick={() => onChange({ ...defaultFilters })}
            className="flex items-center gap-1 text-xs text-rose-deep hover:underline cursor-pointer"
          >
            <CloseIcon style={{ fontSize: 14 }} />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Danh mục */}
      <div>
        <SectionTitle>Danh mục</SectionTitle>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={f.category === ''}
              onChange={() => set({ category: '' })}
              className="accent-[#1e3a2b]"
            />
            Tất cả
          </label>
          {categories.map((c) => (
            <label
              key={c.id || c.slug || c.name}
              className="flex items-center gap-2.5 text-sm text-ink cursor-pointer"
            >
              <input
                type="radio"
                name="category"
                checked={f.category === (c.slug || c.id)}
                onChange={() => set({ category: c.slug || c.id })}
                className="accent-[#1e3a2b]"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      {/* Dịp lễ */}
      {occasions.length > 0 && (
        <div>
          <SectionTitle>Dịp lễ</SectionTitle>
          <div className="space-y-2">
            {occasions.map((o) => (
              <label
                key={o.id || o.slug || o.name}
                className="flex items-center gap-2.5 text-sm text-ink cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={f.occasions.includes(o.slug || o.id)}
                  onChange={() => set({ occasions: toggleArr(f.occasions, o.slug || o.id) })}
                  className="accent-[#1e3a2b]"
                />
                {o.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Giá */}
      <div>
        <SectionTitle>Khoảng giá (₫)</SectionTitle>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={f.minPrice}
            onChange={(e) => set({ minPrice: e.target.value })}
            placeholder="Từ"
            className="w-full min-w-0 border border-ink/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose"
          />
          <span className="text-ink/40">–</span>
          <input
            type="number"
            min="0"
            value={f.maxPrice}
            onChange={(e) => set({ maxPrice: e.target.value })}
            placeholder="Đến"
            className="w-full min-w-0 border border-ink/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose"
          />
        </div>
      </div>

      {/* Màu sắc */}
      <div>
        <SectionTitle>Màu sắc</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {ALL_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set({ colors: toggleArr(f.colors, c) })}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer ${
                f.colors.includes(c)
                  ? 'bg-ink text-cream border-ink'
                  : 'border-ink/20 text-ink hover:border-ink'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Đánh giá */}
      <div>
        <SectionTitle>Đánh giá tối thiểu</SectionTitle>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => set({ minRating: r })}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer ${
                f.minRating === r
                  ? 'bg-gold text-ink border-gold font-semibold'
                  : 'border-ink/20 text-ink hover:border-ink'
              }`}
            >
              {r === 0 ? 'Tất cả' : `${r}★+`}
            </button>
          ))}
        </div>
      </div>

      {/* Còn hàng */}
      <div>
        <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
          <input
            type="checkbox"
            checked={f.inStock}
            onChange={(e) => set({ inStock: e.target.checked })}
            className="accent-[#1e3a2b]"
          />
          Chỉ hiển thị còn hàng
        </label>
      </div>
    </div>
  );
};
