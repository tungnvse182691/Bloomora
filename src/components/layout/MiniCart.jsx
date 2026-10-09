import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { toast } from 'sonner';
import { useCartStore } from '../../store/useCartStore';
import { useUIStore } from '../../store/useUIStore';
import { validatePromo } from '../../services/promo.service';
import { formatVND } from '../../utils/format';
import { QtyStepper } from '../ui/QtyStepper';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';

export const MiniCart = () => {
  const navigate = useNavigate();
  const open = useUIStore((s) => s.miniCartOpen);
  const setOpen = useUIStore((s) => s.setMiniCartOpen);
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const promo = useCartStore((s) => s.promo);
  const setPromo = useCartStore((s) => s.setPromo);
  const subtotal = useCartStore((s) => s.subtotal());
  const discount = useCartStore((s) => s.discount());
  const total = useCartStore((s) => s.total());

  const [code, setCode] = useState('');
  const [applying, setApplying] = useState(false);

  const close = () => setOpen(false);

  const handleApply = async () => {
    const c = code.trim();
    if (!c) return;
    setApplying(true);
    try {
      const res = await validatePromo(c, subtotal());
      if (res?.valid) {
        setPromo({ code: c, discountAmount: res.discount || 0 });
        toast.success(`Áp dụng mã ${c} thành công!`);
        setCode('');
      } else {
        toast.error(res?.message || 'Mã giảm giá không hợp lệ.');
      }
    } catch {
      toast.error('Không áp dụng được mã, vui lòng thử lại.');
    } finally {
      setApplying(false);
    }
  };

  const go = (to) => {
    close();
    navigate(to);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-ink/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed top-0 right-0 h-full w-full max-w-md bg-cream z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
              <h3 className="font-display text-xl text-ink">
                Giỏ hàng ({items.length})
              </h3>
              <button onClick={close} className="p-2 text-ink cursor-pointer" aria-label="Đóng">
                <CloseIcon />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 overflow-auto">
                <EmptyState
                  icon={<ShoppingBagOutlinedIcon style={{ fontSize: 56 }} />}
                  title="Giỏ hàng trống"
                  description="Hãy chọn những bó hoa tươi xinh nhất cho người thương nhé."
                  action={
                    <Button onClick={() => go('/shop')} size="sm">
                      Khám phá cửa hàng
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
                  {items.map((it) => (
                    <div key={`${it.productId}-${it.size}`} className="flex gap-3">
                      <img
                        src={it.image}
                        alt={it.name}
                        className="w-20 h-24 object-cover rounded-xl shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink text-sm truncate">{it.name}</p>
                        <p className="text-xs text-ink-soft mb-2">Size {it.size}</p>
                        <div className="flex items-center justify-between">
                          <QtyStepper
                            small
                            qty={it.qty}
                            onChange={(q) => updateQty(it.productId, it.size, q)}
                          />
                          <span className="text-sm font-semibold text-rose-deep">
                            {formatVND(it.price * it.qty)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          removeItem(it.productId, it.size);
                          toast.info('Đã xóa sản phẩm khỏi giỏ.');
                        }}
                        className="self-start p-1.5 text-ink/40 hover:text-rose-deep transition-colors cursor-pointer"
                        aria-label="Xóa sản phẩm"
                      >
                        <DeleteOutlinedIcon style={{ fontSize: 20 }} />
                      </button>
                    </div>
                  ))}

                  {/* Promo */}
                  <div className="pt-2">
                    {promo ? (
                      <div className="flex items-center justify-between bg-sand/50 rounded-xl px-4 py-2.5 text-sm">
                        <span className="flex items-center gap-2 text-ink font-medium">
                          <LocalOfferOutlinedIcon style={{ fontSize: 18 }} />
                          {promo.code} — {formatVND(promo.discountAmount)}
                        </span>
                        <button
                          onClick={() => useCartStore.getState().clearPromo()}
                          className="text-ink/50 hover:text-rose-deep text-xs underline cursor-pointer"
                        >
                          Gỡ
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="Mã giảm giá"
                          className="flex-1 min-w-0 border border-ink/15 rounded-full px-4 py-2 text-sm bg-white focus:outline-none focus:border-rose"
                        />
                        <Button size="sm" variant="outline" onClick={handleApply} disabled={applying}>
                          {applying ? '...' : 'Áp dụng'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-ink/10 px-5 py-4 space-y-2 bg-white/50">
                  <div className="flex justify-between text-sm text-ink-soft">
                    <span>Tạm tính</span>
                    <span>{formatVND(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-rose-deep">
                      <span>Giảm giá</span>
                      <span>-{formatVND(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-ink text-base pt-1">
                    <span>Tổng cộng</span>
                    <span>{formatVND(total)}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="md" className="flex-1" onClick={() => go('/cart')}>
                      Xem giỏ hàng
                    </Button>
                    <Button size="md" className="flex-1" onClick={() => go('/checkout')}>
                      Thanh toán
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
