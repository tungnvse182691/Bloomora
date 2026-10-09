import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Inventory2 from '@mui/icons-material/Inventory2';
import ReceiptLong from '@mui/icons-material/ReceiptLong';
import AttachMoney from '@mui/icons-material/AttachMoney';
import Star from '@mui/icons-material/Star';
import WarningAmber from '@mui/icons-material/WarningAmber';
import { getProducts } from '../services/product.service';
import { getOrders } from '../services/order.service';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ORDER_STATUS_LABEL } from '../utils/constants';
import { formatVND, formatDateTime } from '../utils/format';
import { EmptyState } from '../components/ui/EmptyState';

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-sky-100 text-sky-800',
  shipping: 'bg-violet-100 text-violet-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Admin() {
  useDocumentTitle('Quản trị | Bloomora');
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, avgRating: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ total, items: products }, { items: orders }] = await Promise.all([
          getProducts({ limit: 100 }),
          getOrders('u1'),
        ]);
        const full = products || [];

        const delivered = (orders || []).filter((o) => o.status === 'delivered');
        const revenue = delivered.reduce((sum, o) => sum + (o.total || 0), 0);
        const avgRating = full.length
          ? full.reduce((sum, p) => sum + (p.rating || 0), 0) / full.length
          : 0;

        setStats({
          products: total || full.length,
          orders: (orders || []).length,
          revenue,
          avgRating,
        });
        setRecentOrders((orders || []).slice(0, 5));
        setLowStock(full.filter((p) => (p.stock ?? 0) < 10).sort((a, b) => a.stock - b.stock));
      } catch {
        setError(true);
        toast.error('Không tải được dữ liệu quản trị');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { icon: <Inventory2 />, label: 'Tổng sản phẩm', value: String(stats.products), tint: 'bg-rose/10 text-rose-deep' },
    { icon: <ReceiptLong />, label: 'Đơn hàng', value: String(stats.orders), tint: 'bg-sky-100 text-sky-700' },
    { icon: <AttachMoney />, label: 'Doanh thu (đã giao)', value: formatVND(stats.revenue), tint: 'bg-emerald-100 text-emerald-700' },
    { icon: <Star />, label: 'Đánh giá trung bình', value: `${stats.avgRating.toFixed(1)}/5`, tint: 'bg-amber-100 text-amber-700' },
  ];

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <EmptyState icon={<WarningAmber fontSize="large" />} title="Không tải được dữ liệu" description="Đã có lỗi xảy ra, vui lòng thử lại sau." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">Bảng điều khiển</h1>
          <p className="mt-1 text-sm text-ink/50">Demo quản trị — dữ liệu mock, không ảnh hưởng đến cửa hàng thật.</p>
        </div>
        <Link to="/" className="rounded-xl border border-sand bg-white px-4 py-2.5 text-sm font-medium text-ink/70 transition hover:border-ink">
          ← Về cửa hàng
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-3xl border border-sand bg-white p-5 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${c.tint}`}>{c.icon}</div>
            {loading ? (
              <div className="mt-3 h-7 w-24 animate-pulse rounded bg-sand/60" />
            ) : (
              <p className="mt-3 font-display text-2xl font-bold text-ink md:text-3xl">{c.value}</p>
            )}
            <p className="mt-1 text-sm text-ink/55">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Đơn hàng gần nhất */}
        <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-ink">Đơn hàng gần nhất</h2>
          {loading ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-sand/50" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-ink/50">Chưa có đơn hàng nào.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-sand text-xs uppercase tracking-wide text-ink/45">
                    <th className="pb-3 font-medium">Mã đơn</th>
                    <th className="pb-3 font-medium">Ngày đặt</th>
                    <th className="pb-3 text-right font-medium">Tổng</th>
                    <th className="pb-3 text-right font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-sand/60 last:border-0">
                      <td className="py-3 font-semibold text-ink">
                        <Link to={`/account/orders/${o.code}`} className="hover:text-rose-deep hover:underline">{o.code}</Link>
                      </td>
                      <td className="py-3 text-ink/60">{formatDateTime(o.createdAt)}</td>
                      <td className="py-3 text-right font-medium text-ink">{formatVND(o.total)}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[o.status]}`}>
                          {ORDER_STATUS_LABEL[o.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tồn kho thấp */}
        <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-ink">Sản phẩm sắp hết hàng <span className="text-sm font-normal text-ink/50">(tồn kho &lt; 10)</span></h2>
          {loading ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-sand/50" />
              ))}
            </div>
          ) : lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-ink/50">Tất cả sản phẩm đều còn đủ hàng. 🎉</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-3">
                  <img src={p.images?.[0]} alt={p.name} className="h-12 w-12 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      <Link to={`/shop/${p.slug}`} className="hover:text-rose-deep hover:underline">{p.name}</Link>
                    </p>
                    <p className="text-xs text-ink/55">{formatVND(p.price)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                    Còn {p.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
