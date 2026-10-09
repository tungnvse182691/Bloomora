import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import CheckCircle from '@mui/icons-material/CheckCircle';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import ArrowBack from '@mui/icons-material/ArrowBack';
import WarningAmber from '@mui/icons-material/WarningAmber';
import { getOrder } from '../services/order.service';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ORDER_STATUS_LABEL, PAYMENT_LABEL } from '../utils/constants';
import { formatVND, formatDate, formatDateTime } from '../utils/format';
import { EmptyState } from '../components/ui/EmptyState';

const FLOW = ['pending', 'confirmed', 'shipping', 'delivered'];

export default function OrderTracking() {
  const { code } = useParams();
  useDocumentTitle(`Đơn hàng ${code || ''} | Bloomora`);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const { order: o } = await getOrder(code);
        if (!o) throw new Error('not found');
        setOrder(o);
      } catch {
        setError(true);
        toast.error('Không tìm thấy đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-sand/60" />
        <div className="mt-6 h-48 animate-pulse rounded-3xl bg-sand/40" />
        <div className="mt-6 h-64 animate-pulse rounded-3xl bg-sand/40" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <EmptyState
          icon={<WarningAmber fontSize="large" />}
          title="Không tìm thấy đơn hàng"
          description={`Không có đơn hàng nào với mã "${code}". Vui lòng kiểm tra lại mã đơn.`}
          action={
            <Link to="/account" className="rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-ink-soft">
              Về trang tài khoản
            </Link>
          }
        />
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const reachedIdx = isCancelled
    ? -1
    : FLOW.reduce((acc, s, i) => (order.timeline?.some((t) => t.status === s) ? i : acc), 0);
  const progress = isCancelled ? 0 : (reachedIdx / (FLOW.length - 1)) * 100;
  const timelineByStatus = {};
  (order.timeline || []).forEach((t) => {
    timelineByStatus[t.status] = t;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <Link to="/account" className="inline-flex items-center gap-1 text-sm font-medium text-ink/60 transition hover:text-ink">
        <ArrowBack fontSize="small" /> Quay lại đơn hàng
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Đơn hàng {order.code}</h1>
          <p className="mt-1 text-sm text-ink/50">Đặt lúc {formatDateTime(order.createdAt)}</p>
        </div>
        <span
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            isCancelled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      {isCancelled && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <WarningAmber />
          <div>
            <p className="font-semibold">Đơn hàng đã bị hủy</p>
            <p className="text-sm">{timelineByStatus.cancelled?.note || 'Đơn hàng này đã được hủy.'}</p>
          </div>
        </div>
      )}

      {/* Tiến trình giao hàng */}
      <div className="mt-6 rounded-3xl border border-sand bg-white p-6 shadow-sm md:p-8">
        <h2 className="font-display text-xl font-semibold text-ink">Tiến trình đơn hàng</h2>
        <div className="relative mt-8">
          <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-sand" />
          <div
            className="absolute left-0 top-5 h-1 rounded-full bg-ink transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
          <div className="relative flex justify-between">
            {FLOW.map((s, i) => {
              const active = !isCancelled && i <= reachedIdx;
              const t = timelineByStatus[s];
              return (
                <div key={s} className="flex w-1/4 flex-col items-center text-center">
                  <div className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white ${active ? 'border-ink text-ink' : 'border-sand text-ink/30'}`}>
                    {active ? <CheckCircle /> : <RadioButtonUnchecked />}
                  </div>
                  <p className={`mt-2 text-xs font-semibold md:text-sm ${active ? 'text-ink' : 'text-ink/35'}`}>
                    {ORDER_STATUS_LABEL[s]}
                  </p>
                  {t && <p className="mt-1 hidden text-[11px] text-ink/45 md:block">{formatDateTime(t.at)}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chi tiết các mốc */}
        <div className="mt-8 space-y-0">
          {(order.timeline || []).map((t, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`mt-1 h-3 w-3 rounded-full ${t.status === 'cancelled' ? 'bg-red-500' : 'bg-ink'}`} />
                {i < order.timeline.length - 1 && <div className="w-px flex-1 bg-sand" />}
              </div>
              <div className="pb-6">
                <p className="text-sm font-semibold text-ink">{ORDER_STATUS_LABEL[t.status] || t.status}</p>
                <p className="text-sm text-ink/60">{t.note}</p>
                <p className="mt-0.5 text-xs text-ink/40">{formatDateTime(t.at)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Thông tin giao hàng */}
        <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-ink">Thông tin giao hàng</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-ink/50">Người nhận</dt><dd className="text-right font-medium text-ink">{order.name}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink/50">Điện thoại</dt><dd className="text-right font-medium text-ink">{order.phone}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink/50">Địa chỉ</dt><dd className="text-right font-medium text-ink">{order.address}, {order.city}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink/50">Ngày giao</dt><dd className="text-right font-medium text-ink">{formatDate(order.deliveryDate)} · {order.deliverySlot}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink/50">Thanh toán</dt><dd className="text-right font-medium text-ink">{PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}</dd></div>
            {order.note && (
              <div className="flex justify-between gap-4"><dt className="text-ink/50">Ghi chú</dt><dd className="text-right font-medium text-ink">{order.note}</dd></div>
            )}
          </dl>
        </div>

        {/* Sản phẩm */}
        <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-ink">Sản phẩm ({order.items.length})</h2>
          <div className="mt-4 space-y-3">
            {order.items.map((it) => (
              <div key={`${it.productId}-${it.size}`} className="flex items-center gap-3">
                <img src={it.image} alt={it.name} className="h-14 w-14 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{it.name}</p>
                  <p className="text-xs text-ink/50">Size {it.size} · SL: {it.qty}</p>
                </div>
                <p className="text-sm font-semibold text-ink">{formatVND(it.price * it.qty)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 border-t border-sand pt-4 text-sm">
            <div className="flex justify-between text-ink/60"><span>Tạm tính</span><span>{formatVND(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-ink/60"><span>Giảm giá</span><span>−{formatVND(order.discount)}</span></div>}
            <div className="flex justify-between text-ink/60"><span>Phí giao hàng</span><span>{order.shippingFee === 0 ? 'Miễn phí' : formatVND(order.shippingFee)}</span></div>
            <div className="flex justify-between pt-1 text-base font-bold text-ink"><span>Tổng cộng</span><span>{formatVND(order.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
