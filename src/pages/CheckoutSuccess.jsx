import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import { Button } from '../components/ui/Button';
import { Reveal } from '../components/effects/Reveal';
import { getOrder } from '../services/order.service';
import { useAuthStore } from '../store/useAuthStore';
import { formatVND, formatDate, formatDateTime } from '../utils/format';
import { ORDER_STATUS_LABEL, PAYMENT_LABEL } from '../utils/constants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function CheckoutSuccess() {
  useDocumentTitle('Đặt hàng thành công — Bloomora');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code') || '';
  const user = useAuthStore((s) => s.user);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { order: o } = await getOrder(code);
        if (!cancelled) setOrder(o);
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Không tìm thấy đơn hàng');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  if (loading) {
    return (
      <div className="bg-cream min-h-[70vh] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-sand border-t-rose animate-spin" />
      </div>
    );
  }

  if (!code || !order) {
    return (
      <div className="bg-cream min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-16">
        <p className="font-display text-3xl text-ink mb-3">Không tìm thấy đơn hàng</p>
        <p className="text-ink-soft text-sm mb-8">Mã đơn hàng không hợp lệ hoặc đã hết hạn.</p>
        <Button size="lg" onClick={() => navigate('/shop')}>Tiếp tục mua sắm</Button>
      </div>
    );
  }

  const timeline = order.timeline?.length
    ? order.timeline
    : [{ status: order.status || 'pending', at: order.createdAt, note: 'Đơn hàng được tạo thành công' }];

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-14 md:py-20">
        <Reveal>
          <div className="text-center">
            <CheckCircleIcon
              className="text-green-600 animate-pop-in"
              style={{ fontSize: 88 }}
            />
            <h1 className="mt-6 font-display text-4xl md:text-5xl text-ink">Đặt hàng thành công!</h1>
            <p className="mt-3 text-ink-soft">
              Cảm ơn <strong className="text-ink">{order.name}</strong> đã tin chọn Bloomora.
              Chúng tôi sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.
            </p>
          </div>
        </Reveal>

        {/* Thông tin đơn */}
        <Reveal>
          <div className="mt-10 rounded-3xl bg-white border border-ink/10 p-6 md:p-8">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-soft/70 font-semibold">Mã đơn hàng</p>
                <p className="mt-1 font-display text-2xl text-rose-deep tracking-wide">{order.code}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-soft/70 font-semibold">Tổng thanh toán</p>
                <p className="mt-1 font-display text-2xl text-ink">{formatVND(order.total)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-soft/70 font-semibold">Người nhận</p>
                <p className="mt-1 text-ink">{order.name} · {order.phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-soft/70 font-semibold">Giao hàng</p>
                <p className="mt-1 text-ink">
                  {order.deliveryDate ? formatDate(order.deliveryDate) : ''}{order.deliverySlot ? ` · ${order.deliverySlot}` : ''}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wider text-ink-soft/70 font-semibold">Địa chỉ</p>
                <p className="mt-1 text-ink">{order.address}{order.city ? `, ${order.city}` : ''}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wider text-ink-soft/70 font-semibold">Thanh toán</p>
                <p className="mt-1 text-ink">{PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-8 border-t border-ink/10 pt-6">
              <p className="text-xs uppercase tracking-wider text-ink-soft/70 font-semibold mb-4">Trạng thái đơn hàng</p>
              <ol className="space-y-4">
                {timeline.map((t, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        i === 0 ? 'bg-ink text-cream' : 'bg-cream-dark text-ink-soft'
                      }`}>
                        {i === 0 ? <LocalShippingIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                      </span>
                      {i < timeline.length - 1 && <span className="w-0.5 flex-1 bg-ink/10 my-1" />}
                    </div>
                    <div className="pb-2">
                      <p className="font-semibold text-ink text-sm">
                        {ORDER_STATUS_LABEL[t.status] || t.status}
                      </p>
                      <p className="text-xs text-ink-soft">{t.note}</p>
                      {t.at && <p className="text-[11px] text-ink-soft/60 mt-0.5">{formatDateTime(t.at)}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>

        {/* Actions */}
        <Reveal>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <Link to={`/account/orders/${order.code}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  <ReceiptLongIcon fontSize="small" /> Theo dõi đơn hàng
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <ReceiptLongIcon fontSize="small" /> Đăng nhập để theo dõi đơn
                </Button>
              </Link>
            )}
            <Link to="/">
              <Button size="lg" variant="ghost" className="w-full sm:w-auto">
                <HomeIcon fontSize="small" /> Về trang chủ
              </Button>
            </Link>
            <Link to="/shop">
              <Button size="lg" variant="light" className="w-full sm:w-auto border border-ink/15">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
