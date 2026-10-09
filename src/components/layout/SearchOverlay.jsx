import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useUIStore } from '../../store/useUIStore';
import { useDebounce } from '../../hooks/useDebounce';
import { suggestProducts } from '../../services/product.service';
import { formatVND } from '../../utils/format';

export const SearchOverlay = () => {
  const navigate = useNavigate();
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(q, 400);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open ]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  useEffect(() => {
    const term = debounced.trim();
    if (!term) {
      setResults([]);
      return;
    }
    let alive = true;
    setLoading(true);
    suggestProducts(term)
      .then((res) => {
        if (alive) setResults(Array.isArray(res) ? res : res?.products || []);
      })
      .catch(() => {
        if (alive) setResults([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [debounced]);

  const go = (slug) => {
    setOpen(false);
    navigate(`/shop/${slug}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-cream/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="max-w-3xl mx-auto px-4 pt-20 md:pt-28">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 p-2 text-ink hover:text-rose-deep cursor-pointer"
              aria-label="Đóng tìm kiếm"
            >
              <CloseIcon style={{ fontSize: 28 }} />
            </button>

            <div className="relative">
              <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm hoa, dịp lễ, màu sắc..."
                className="w-full bg-white border border-ink/15 rounded-full pl-14 pr-6 py-4 text-lg text-ink placeholder:text-ink/35 focus:outline-none focus:border-rose shadow-lg"
              />
            </div>

            <div className="mt-8 max-h-[60vh] overflow-auto">
              {loading && <p className="text-ink-soft text-sm">Đang tìm...</p>}
              {!loading && debounced.trim() && results.length === 0 && (
                <p className="text-ink-soft text-sm">Không tìm thấy sản phẩm phù hợp.</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {results.map((p) => (
                  <button
                    key={p.id || p.slug}
                    onClick={() => go(p.slug)}
                    className="bg-white rounded-2xl overflow-hidden text-left hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <img
                      src={p.images?.[0] || p.image}
                      alt={p.name}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-3">
                      <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                      <p className="text-sm text-rose-deep font-semibold mt-1">
                        {formatVND(p.price)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
