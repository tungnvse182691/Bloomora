import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { toast } from 'sonner';
import { useUIStore } from '../../store/useUIStore';
import { useCartStore } from '../../store/useCartStore';
import { getProduct } from '../../services/product.service';
import { Rating } from '../ui/Rating';
import { PriceTag } from '../ui/PriceTag';
import { QtyStepper } from '../ui/QtyStepper';
import { ProductBadges } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatVND } from '../../utils/format';
import { triggerFlyToCart } from '../effects/FlyToCartLayer';

export const QuickViewModal = () => {
  const navigate = useNavigate();
  const slug = useUIStore((s) => s.quickViewSlug);
  const setSlug = useUIStore((s) => s.setQuickViewSlug);
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sizeIdx, setSizeIdx] = useState(1);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setLoading(true);
    setProduct(null);
    setQty(1);
    setSizeIdx(1);
    getProduct(slug)
      .then((res) => {
        if (alive) {
          const p = res?.product || res;
          setProduct(p);
          if (p?.sizes?.length) setSizeIdx(p.sizes.length > 1 ? 1 : 0);
        }
      })
      .catch(() => alive && setProduct(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSlug(null);
    };
    if (slug) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slug, setSlug]);

  const close = () => setSlug(null);

  const handleAdd = (e) => {
    if (!product) return;
    const size = product.sizes?.[sizeIdx] || { name: 'M', price: product.price };
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0],
      price: size.price,
      size: size.name,
      qty,
    });
    triggerFlyToCart(product.images?.[0], e.clientX, e.clientY);
    toast.success(`Đã thêm "${product.name}" vào giỏ!`);
    close();
  };

  const price = product?.sizes?.[sizeIdx]?.price ?? product?.price ?? 0;

  return (
    <AnimatePresence>
      {slug && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/50" onClick={close} />
          <motion.div
            className="relative bg-cream rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-auto"
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-cream/90 flex items-center justify-center text-ink hover:text-rose-deep cursor-pointer"
              aria-label="Đóng"
            >
              <CloseIcon />
            </button>

            {loading ? (
              <div className="p-10 text-center text-ink-soft">Đang tải...</div>
            ) : !product ? (
              <div className="p-10 text-center text-ink-soft">
                Không tìm thấy sản phẩm.
              </div>
            ) : (
              <div className="grid md:grid-cols-2">
                {/* Ảnh */}
                <div className="relative aspect-[3/4] md:aspect-auto md:min-h-[480px] bg-cream-dark">
                  <ProductBadges product={product} />
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover md:rounded-l-3xl"
                  />
                </div>

                {/* Info */}
                <div className="p-6 md:p-8 flex flex-col">
                  <h3 className="font-display text-2xl md:text-3xl text-ink">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Rating value={product.rating} size={16} />
                    <span className="text-xs text-ink/45">({product.reviewCount} đánh giá)</span>
                  </div>
                  <div className="mt-4">
                    <PriceTag price={price} oldPrice={product.oldPrice} size="lg" />
                  </div>

                  <p className="text-sm text-ink-soft mt-4 line-clamp-3">{product.description}</p>

                  {/* Size */}
                  {product.sizes?.length > 0 && (
                    <div className="mt-5">
                      <p className="text-sm font-semibold text-ink mb-2">Kích thước</p>
                      <div className="flex gap-2">
                        {product.sizes.map((s, i) => (
                          <button
                            key={s.name}
                            onClick={() => setSizeIdx(i)}
                            className={`px-4 py-2 rounded-full text-sm border transition-colors cursor-pointer ${
                              i === sizeIdx
                                ? 'bg-ink text-cream border-ink'
                                : 'border-ink/20 text-ink hover:border-ink'
                            }`}
                          >
                            {s.name} · {formatVND(s.price)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Qty + Add */}
                  <div className="flex items-center gap-3 mt-6">
                    <QtyStepper qty={qty} onChange={setQty} />
                    <Button className="flex-1" onClick={handleAdd}>
                      <ShoppingBagOutlinedIcon style={{ fontSize: 18 }} />
                      Thêm vào giỏ
                    </Button>
                  </div>

                  <button
                    onClick={() => {
                      close();
                      navigate(`/shop/${product.slug}`);
                    }}
                    className="mt-4 text-sm text-rose-deep hover:underline cursor-pointer self-start"
                  >
                    Xem chi tiết sản phẩm →
                  </button>

                  {product.stock <= 0 && (
                    <p className="mt-3 text-sm text-red-600">Tạm hết hàng</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
