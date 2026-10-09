import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';
import { QtyStepper } from '../components/ui/QtyStepper';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductCard } from '../components/product/ProductCard';
import { Reveal } from '../components/effects/Reveal';
import { getFeatured } from '../services/product.service';
import { validatePromo } from '../services/promo.service';
import { getShipping } from '../services/shipping.service';
import { useCartStore } from '../store/useCartStore';
import { formatVND } from '../utils/format';
import { FREE_SHIP_THRESHOLD } from '../utils/constants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const CITIES = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Hải Phòng',
  'Huế',
  'Nha Trang',
  'Đà Lạt',
  'Vinh',
  'Khác',
];

export default function Cart() {
  useDocumentTitle('Giỏ hàng — Bloomora');
  const navigate = useNavigate();

  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const promo = useCartStore((s) => s.promo);
  const setPromo = useCartStore((s) => s.setPromo);
  const clearPromo = useCartStore((s) => s.clearPromo);
  const shippingFee = useCartStore((s) => s.shippingFee);
  const setShippingFee = useCartStore((s) => s.setShippingFee);
  const subtotal = useCartStore((s) => s.subtotal());
  const discount = useCartStore((s) => s.discount());
  const total = useCartStore((s) => s.total());

  const [promoCode, setPromoCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [city, setCity] = useState('');
  const [upsell, setUpsell] = useState([]);

  // ---- Upsell
  useEffect(() => {
    (async () => {
      try {
        const { items: list } = await getFeatured('bestseller');
        setUpsell((list || []).slice(0, 4));
      } catch { /* lặng lẽ bỏ qua */ }
    })();
  }, []);

  // ---- Tính phí ship khi đổi tỉnh hoặc giỏ hàng thay đổi
  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getShipping(city, subtotal);
        if (!cancelled) setShippingFee(res.fee);
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Không tính được phí ship');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, items.length, subtotal]);

  const handleApplyPromo = async () => {
    const code = promoCode.trim();
    if (!code) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    setApplying(true);
    try {
      const { valid, promo: p, discount: d } = await validatePromo(code, subtotal);
      if (valid) {
        setPromo({ code: p.code, discountAmount: d });
        toast.success(`Áp dụng mã ${p.code}: giảm ${formatVND(d)}`);
        setPromoCode('');
      }
    } catch (err) {
      toast.error(err.message || 'Mã giảm giá không hợp lệ');
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-cream min-h-[70vh] flex items-center justify-center px-6">
        <EmptyState
          icon={<ShoppingBagOutlined style={{ fontSize: 72 }} />}
          title="Giỏ hàng của bạn đang trống"
          description="Hãy khám phá bộ sưu tập hoa tươi và chọn món quà ưng ý nhất."
          action={<Button size="lg" onClick={() => navigate('/shop')}>Tiếp tục mua sắm</Button>}
        />
      </div>
    );
  }

  const missingForFreeShip = FREE_SHIP_THRESHOLD - subtotal;

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <Reveal>
          <SectionHeading eyebrow="Bloomora" title="Giỏ Hàng" subtitle={`${items.length} loại sản phẩm`} align="left" />
        </Reveal>

        {missingForFreeShip > 0 && (
          <div className="mt-6 rounded-2xl bg-sand/70 border border-gold/40 px-5 py-4 text-sm text-ink">
            🎉 Mua thêm <strong>{formatVND(missingForFreeShip)}</strong> nữa để được <strong>miễn phí giao hàng</strong>!
            <div className="mt-2 h-2 rounded-full bg-cream-dark overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose to-gold transition-all"
                style={{ width: `${Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* ---- Danh sách sản phẩm ---- */}
          <div className="rounded-3xl bg-white border border-ink/10 overflow-hidden">
            <div className="hidden md:grid grid-cols-[88px_1fr_140px_140px_48px] gap-4 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-ink-soft/70 border-b border-ink/10">
              <span>Sản phẩm</span><span />
              <span className="text-center">Số lượng</span>
              <span className="text-right">Thành tiền</span>
              <span />
            </div>
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="grid grid-cols-[72px_1fr_auto] md:grid-cols-[88px_1fr_140px_140px_48px] gap-4 items-center px-4 md:px-6 py-5 border-b border-ink/5 last:border-0"
              >
                <Link to={`/shop/${item.slug}`} className="rounded-2xl overflow-hidden aspect-square bg-sand">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </Link>
                <div className="min-w-0">
                  <Link to={`/shop/${item.slug}`} className="font-display text-lg text-ink hover:text-rose-deep leading-snug block truncate">
                    {item.name}
                  </Link>
                  <p className="text-xs text-ink-soft mt-1">Size {item.size} · {formatVND(item.price)}</p>
                  {item.giftWrap && <p className="text-xs text-rose-deep mt-0.5">🎁 Gói quà tặng</p>}
                  {item.note && <p className="text-xs text-ink-soft/80 mt-0.5 italic line-clamp-1">“{item.note}”</p>}
                  <div className="md:hidden mt-2 flex items-center gap-3">
                    <QtyStepper small qty={item.qty} onChange={(v) => updateQty(item.productId, item.size, v)} />
                    <span className="font-semibold text-ink text-sm">{formatVND(item.price * item.qty)}</span>
                  </div>
                </div>
                <div className="hidden md:flex justify-center">
                  <QtyStepper qty={item.qty} onChange={(v) => updateQty(item.productId, item.size, v)} />
                </div>
                <div className="hidden md:block text-right font-semibold text-ink">
                  {formatVND(item.price * item.qty)}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeItem(item.productId, item.size);
                    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
                  }}
                  aria-label="Xóa sản phẩm"
                  className="hidden md:flex w-9 h-9 rounded-full items-center justify-center text-ink-soft/60 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer justify-self-end"
                >
                  <DeleteOutlinedIcon />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeItem(item.productId, item.size);
                    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
                  }}
                  aria-label="Xóa sản phẩm"
                  className="md:hidden text-ink-soft/60 hover:text-red-600 cursor-pointer self-start"
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </button>
              </div>
            ))}
          </div>

          {/* ---- Tóm tắt ---- */}
          <div className="rounded-3xl bg-white border border-ink/10 p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-2xl text-ink mb-5">Tóm tắt đơn hàng</h2>

            {/* Mã giảm giá */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-ink mb-2 flex items-center gap-1.5">
                <LocalOfferIcon fontSize="small" className="text-rose" /> Mã giảm giá
              </p>
              {promo ? (
                <div className="flex items-center justify-between rounded-2xl bg-rose/10 border border-rose/30 px-4 py-3">
                  <div>
                    <p className="font-bold text-rose-deep text-sm tracking-wide">{promo.code}</p>
                    <p className="text-xs text-ink-soft">Giảm {formatVND(promo.discountAmount)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { clearPromo(); toast.success('Đã gỡ mã giảm giá'); }}
                    className="text-xs font-semibold text-ink-soft hover:text-red-600 cursor-pointer"
                  >
                    Gỡ
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                    placeholder="Nhập mã (VD: BLOOM10)"
                    className="flex-1 min-w-0 rounded-full border border-ink/15 px-4 py-2.5 text-sm text-ink outline-none focus:border-rose uppercase"
                  />
                  <Button size="sm" onClick={handleApplyPromo} disabled={applying}>
                    {applying ? '...' : 'Áp dụng'}
                  </Button>
                </div>
              )}
            </div>

            {/* Tỉnh thành */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-ink mb-2">Tỉnh / Thành phố giao hàng</p>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-rose cursor-pointer"
              >
                <option value="">— Chọn tỉnh/thành —</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {!city && <p className="mt-1.5 text-xs text-ink-soft/70">Chọn tỉnh/thành để tính phí giao hàng chính xác.</p>}
            </div>

            {/* Tổng */}
            <dl className="space-y-2.5 text-sm border-t border-ink/10 pt-4">
              <div className="flex justify-between text-ink-soft">
                <dt>Tạm tính</dt><dd className="font-medium text-ink">{formatVND(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-deep">
                  <dt>Giảm giá{promo ? ` (${promo.code})` : ''}</dt><dd className="font-medium">−{formatVND(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-ink-soft">
                <dt>Phí giao hàng</dt>
                <dd className="font-medium text-ink">
                  {shippingFee === 0 ? <span className="text-green-700 font-semibold">Miễn phí</span> : formatVND(shippingFee)}
                </dd>
              </div>
              <div className="flex justify-between items-baseline border-t border-ink/10 pt-3">
                <dt className="font-display text-lg text-ink">Tổng cộng</dt>
                <dd className="font-display text-2xl text-rose-deep">{formatVND(total)}</dd>
              </div>
            </dl>

            <Button size="lg" className="w-full mt-6" onClick={() => navigate('/checkout')}>
              Tiến hành thanh toán
            </Button>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="w-full mt-3 text-sm font-semibold text-ink-soft hover:text-rose-deep transition-colors cursor-pointer"
            >
              ← Tiếp tục mua sắm
            </button>
          </div>
        </div>

        {/* ---- Upsell ---- */}
        {upsell.length > 0 && (
          <div className="mt-16">
            <Reveal>
              <SectionHeading eyebrow="Gợi ý thêm" title="Có thể bạn thích" />
            </Reveal>
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-5">
              {upsell.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
