import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLong from '@mui/icons-material/ReceiptLong';
import AttachMoney from '@mui/icons-material/AttachMoney';
import Inventory2 from '@mui/icons-material/Inventory2';
import People from '@mui/icons-material/People';
import PendingActions from '@mui/icons-material/PendingActions';
import WarningAmber from '@mui/icons-material/WarningAmber';
import Close from '@mui/icons-material/Close';
import Search from '@mui/icons-material/Search';
import Lock from '@mui/icons-material/Lock';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import { useAuthStore } from '../store/useAuthStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getProducts, getCategories } from '../services/product.service';
import {
  getAdminStats, getAllOrders, updateOrderStatus,
  getAdminUsers, updateUser, deleteUser,
  createProduct, updateProduct, deleteProduct,
} from '../services/admin.service';
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

const PIE_COLORS = {
  pending: '#f59e0b',
  confirmed: '#0ea5e9',
  shipping: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const NEXT_ACTIONS = {
  pending: [
    { status: 'confirmed', label: 'Duyệt đơn', cls: 'bg-ink text-cream hover:bg-ink-soft', confirm: false },
    { status: 'cancelled', label: 'Hủy đơn', cls: 'border border-red-200 text-red-600 hover:bg-red-50', confirm: true },
  ],
  confirmed: [
    { status: 'shipping', label: 'Bắt đầu giao', cls: 'bg-ink text-cream hover:bg-ink-soft', confirm: false },
    { status: 'cancelled', label: 'Hủy đơn', cls: 'border border-red-200 text-red-600 hover:bg-red-50', confirm: true },
  ],
  shipping: [
    { status: 'delivered', label: 'Hoàn thành', cls: 'bg-leaf text-cream hover:opacity-90', confirm: false },
  ],
  delivered: [],
  cancelled: [],
};

const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: <DashboardIcon /> },
  { id: 'orders', label: 'Đơn hàng', icon: <ReceiptLong /> },
  { id: 'products', label: 'Sản phẩm', icon: <Inventory2 /> },
  { id: 'users', label: 'Người dùng', icon: <People /> },
];

const ROLE_LABEL = { admin: 'Quản trị viên', customer: 'Khách hàng' };

export default function Admin() {
  useDocumentTitle('Quản trị — Bloomora', { noindex: true });
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [productModal, setProductModal] = useState(null); // null | { mode: 'add' } | { mode: 'edit', product }

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const [s, o, p, c, u] = await Promise.all([
          getAdminStats(), getAllOrders(), getProducts({ limit: 200 }), getCategories(), getAdminUsers(),
        ]);
        setStats(s);
        setOrders(o.items || []);
        setProducts(p.items || []);
        setCategories(c.items || []);
        setUsersList(u.items || []);
      } catch {
        toast.error('Không tải được dữ liệu quản trị');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  const refresh = async () => {
    try {
      const [s, o, p, u] = await Promise.all([
        getAdminStats(), getAllOrders(), getProducts({ limit: 200 }), getAdminUsers(),
      ]);
      setStats(s);
      setOrders(o.items || []);
      setProducts(p.items || []);
      setUsersList(u.items || []);
    } catch { /* ignore */ }
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchQ = !q ||
        o.code.toLowerCase().includes(q) ||
        (o.name || '').toLowerCase().includes(q) ||
        (o.phone || '').includes(q);
      return matchStatus && matchQ;
    });
  }, [orders, search, statusFilter]);

  const handleStatus = async (code, status, label, needConfirm) => {
    if (needConfirm && !window.confirm(`Bạn chắc chắn muốn ${label.toLowerCase()} đơn ${code}?`)) return;
    setUpdating(true);
    try {
      const { order } = await updateOrderStatus(code, status);
      setOrders((prev) => prev.map((o) => (o.code === code ? order : o)));
      setSelected(order);
      await refresh();
      toast.success(`Đã ${label.toLowerCase()} đơn ${code}`);
    } catch (e) {
      toast.error(e.message || 'Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const pieData = useMemo(
    () => (stats?.ordersByStatus || [])
      .filter((d) => d.count > 0)
      .map((d) => ({ name: ORDER_STATUS_LABEL[d.status], value: d.count, status: d.status })),
    [stats],
  );

  // ---- Products CRUD ----
  const handleSaveProduct = async (data) => {
    try {
      if (productModal?.mode === 'edit') {
        const { product } = await updateProduct(productModal.product.id, data);
        setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
        toast.success(`Đã cập nhật “${product.name}”`);
      } else {
        const { product } = await createProduct(data);
        setProducts((prev) => [product, ...prev]);
        await refresh();
        toast.success(`Đã thêm “${product.name}”`);
      }
      setProductModal(null);
    } catch (e) {
      toast.error(e.message || 'Lưu thất bại');
    }
  };

  const handleDeleteProduct = async (p) => {
    if (!window.confirm(`Xóa sản phẩm “${p.name}”? Hành động này không thể hoàn tác.`)) return;
    try {
      await deleteProduct(p.id);
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      await refresh();
      toast.success('Đã xóa sản phẩm');
    } catch (e) {
      toast.error(e.message || 'Xóa thất bại');
    }
  };

  // ---- Users ----
  const handleUserRole = async (u, role) => {
    if (u.role === role) return;
    if (!window.confirm(`Đổi vai trò của ${u.name} thành “${ROLE_LABEL[role]}”?`)) return;
    try {
      const { user: updated } = await updateUser(u.id, { role });
      setUsersList((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: updated.role } : x)));
      toast.success('Đã cập nhật vai trò');
    } catch (e) {
      toast.error(e.message || 'Cập nhật thất bại');
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Xóa tài khoản ${u.name} (${u.email})? Hành động này không thể hoàn tác.`)) return;
    try {
      await deleteUser(u.id, user?.id);
      setUsersList((prev) => prev.filter((x) => x.id !== u.id));
      await refresh();
      toast.success('Đã xóa người dùng');
    } catch (e) {
      toast.error(e.message || 'Xóa thất bại');
    }
  };

  // ---- Không có quyền ----
  if (!loading && !isAdmin) {
    return (
      <div className="bg-cream min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-sand p-10 text-center shadow-sm">
          <Lock className="!text-5xl text-ink/30 mb-4" />
          <h1 className="font-display text-2xl font-bold text-ink mb-2">Khu vực quản trị</h1>
          <p className="text-sm text-ink/60 mb-6">
            Bạn cần đăng nhập bằng tài khoản quản trị viên để truy cập trang này.
            (Demo: <span className="font-semibold">demo@bloomora.vn</span> / <span className="font-semibold">demo123</span>)
          </p>
          <button
            onClick={() => navigate('/login', { state: { from: { pathname: '/admin' } } })}
            className="rounded-full bg-ink px-8 py-3 text-sm font-semibold text-cream transition hover:bg-ink-soft cursor-pointer"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">Bảng điều khiển</h1>
            <p className="text-sm text-ink/60 mt-1">Xin chào, {user?.name} — quản trị viên Bloomora.</p>
          </div>
          <Link to="/" className="text-sm text-ink/60 hover:text-ink underline underline-offset-4">
            ← Về trang chủ
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto h-fit lg:sticky lg:top-24">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition cursor-pointer ${
                  tab === t.id ? 'bg-ink text-cream shadow-md' : 'bg-white text-ink/60 border border-sand hover:border-ink/30'
                }`}
              >
                {t.icon} {t.label}
                {t.id === 'orders' && stats?.totals.pendingOrders > 0 && (
                  <span className="ml-auto rounded-full bg-rose text-white text-[11px] font-bold px-2 py-0.5">
                    {stats.totals.pendingOrders}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="min-w-0">
            {loading ? (
              <p className="text-sm text-ink/60">Đang tải dữ liệu...</p>
            ) : tab === 'overview' ? (
              <Overview stats={stats} pieData={pieData} />
            ) : tab === 'orders' ? (
              <OrdersTab
                orders={filteredOrders}
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onSelect={setSelected}
              />
            ) : tab === 'products' ? (
              <ProductsTab
                products={products}
                categories={categories}
                onAdd={() => setProductModal({ mode: 'add' })}
                onEdit={(product) => setProductModal({ mode: 'edit', product })}
                onDelete={handleDeleteProduct}
              />
            ) : (
              <UsersTab
                users={usersList}
                currentUserId={user?.id}
                onRoleChange={handleUserRole}
                onDelete={handleDeleteUser}
              />
            )}
          </div>
        </div>
      </div>

      {/* ---- Modal chi tiết đơn ---- */}
      {selected && (
        <OrderModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatus={handleStatus}
          updating={updating}
        />
      )}

      {/* ---- Modal thêm/sửa sản phẩm ---- */}
      {productModal && (
        <ProductModal
          key={productModal.mode === 'edit' ? productModal.product.id : 'new'}
          initial={productModal.mode === 'edit' ? productModal.product : null}
          categories={categories}
          onClose={() => setProductModal(null)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}

/* ================= Tổng quan ================= */
function Overview({ stats, pieData }) {
  if (!stats) return <EmptyState title="Chưa có dữ liệu" description="Hệ thống chưa ghi nhận hoạt động nào." />;
  const t = stats.totals;
  const cards = [
    { label: 'Doanh thu', value: formatVND(t.revenue), icon: <AttachMoney />, cls: 'bg-rose/10 text-rose' },
    { label: 'Đơn hàng', value: t.orders, sub: `${t.pendingOrders} đơn chờ duyệt`, icon: <ReceiptLong />, cls: 'bg-sky-100 text-sky-700' },
    { label: 'Sản phẩm', value: t.products, icon: <Inventory2 />, cls: 'bg-violet-100 text-violet-700' },
    { label: 'Khách hàng', value: t.customers, icon: <People />, cls: 'bg-emerald-100 text-emerald-700' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-sand p-5 shadow-sm">
            <span className={`inline-flex p-2.5 rounded-xl mb-3 ${c.cls}`}>{c.icon}</span>
            <div className="font-display text-2xl font-bold text-ink">{c.value}</div>
            <div className="text-xs text-ink/60 mt-1">{c.label}{c.sub ? ` · ${c.sub}` : ''}</div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-sand p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink mb-1">Doanh thu 14 ngày qua</h2>
          <p className="text-xs text-ink/50 mb-4">Tính theo đơn đã giao thành công</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueByDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c4706b" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#c4706b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eaddcb" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#1e3a2b" opacity={0.6} />
                <YAxis tick={{ fontSize: 11 }} stroke="#1e3a2b" opacity={0.6} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  formatter={(v) => [formatVND(v), 'Doanh thu']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #eaddcb' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#c4706b" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-sand p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">Đơn theo trạng thái</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {pieData.map((d) => (
                    <Cell key={d.status} fill={PIE_COLORS[d.status]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v} đơn`, name]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-sand p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">Sản phẩm bán chạy</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-ink/50">Chưa có dữ liệu bán hàng.</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-11 h-11 rounded-xl object-cover" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                    <p className="text-xs text-ink/50">{p.qty} đã bán</p>
                  </div>
                  <span className="text-sm font-semibold text-ink">{formatVND(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-sand p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <WarningAmber className="text-amber-600" /> Sắp hết hàng
          </h2>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-ink/50">Tồn kho ổn định.</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStock.map((p) => (
                <Link key={p.id} to={`/shop/${p.slug}`} className="flex items-center gap-3 group">
                  <img src={p.image} alt={p.name} className="w-11 h-11 rounded-xl object-cover" loading="lazy" />
                  <p className="flex-1 text-sm font-medium text-ink truncate group-hover:underline">{p.name}</p>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.stock <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                    Còn {p.stock}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {stats.totals.pendingOrders > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <PendingActions className="text-amber-600" />
          <p className="text-sm text-amber-900">
            Có <strong>{stats.totals.pendingOrders} đơn hàng</strong> đang chờ duyệt. Sang tab Đơn hàng để xử lý.
          </p>
        </div>
      )}
    </div>
  );
}

/* ================= Tab đơn hàng ================= */
function OrdersTab({ orders, search, setSearch, statusFilter, setStatusFilter, onSelect }) {
  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" fontSize="small" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã đơn, tên, SĐT..."
            className="w-full rounded-xl border border-sand bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/25"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ id: 'all', label: 'Tất cả' }, ...Object.entries(ORDER_STATUS_LABEL).map(([id, label]) => ({ id, label }))].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold border transition cursor-pointer ${
                statusFilter === f.id ? 'bg-ink text-cream border-ink' : 'bg-white text-ink/60 border-sand hover:border-ink/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="Không có đơn hàng" description="Thử đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái." />
      ) : (
        <div className="bg-white rounded-2xl border border-sand shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink/50 border-b border-sand">
                  <th className="px-5 py-3.5 font-semibold">Mã đơn</th>
                  <th className="px-5 py-3.5 font-semibold">Khách hàng</th>
                  <th className="px-5 py-3.5 font-semibold text-center">SP</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Tổng</th>
                  <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                  <th className="px-5 py-3.5 font-semibold">Ngày đặt</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.code} className="border-b border-sand/60 last:border-0 hover:bg-cream/60 transition">
                    <td className="px-5 py-3.5 font-semibold text-ink">{o.code}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-ink">{o.name}</div>
                      <div className="text-xs text-ink/50">{o.phone}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center">{(o.items || []).length}</td>
                    <td className="px-5 py-3.5 text-right font-semibold">{formatVND(o.total)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_BADGE[o.status]}`}>
                        {ORDER_STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-ink/60">{formatDateTime(o.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onSelect(o)}
                        className="rounded-lg border border-sand px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:border-ink cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Modal chi tiết đơn ================= */
function OrderModal({ order, onClose, onStatus, updating }) {
  const actions = NEXT_ACTIONS[order.status] || [];
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60" onClick={onClose} />
      <div className="relative bg-cream w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
        <div className="sticky top-0 bg-cream/95 backdrop-blur px-6 py-4 flex items-center justify-between border-b border-sand z-10">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">{order.code}</h2>
            <p className="text-xs text-ink/50">Đặt lúc {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[order.status]}`}>
              {ORDER_STATUS_LABEL[order.status]}
            </span>
            <button onClick={onClose} aria-label="Đóng" className="p-2 rounded-full hover:bg-sand/60 transition cursor-pointer">
              <Close />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-sand p-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50 mb-2">Người nhận</h3>
              <p className="text-sm font-semibold text-ink">{order.name} · {order.phone}</p>
              <p className="text-sm text-ink/70 mt-1">{order.address}, {order.city}</p>
              {order.deliveryDate && (
                <p className="text-xs text-ink/50 mt-2">Giao: {order.deliveryDate}{order.deliverySlot ? ` · ${order.deliverySlot}` : ''}</p>
              )}
              {order.note && <p className="text-xs text-ink/50 mt-1 italic">“{order.note}”</p>}
            </div>
            <div className="bg-white rounded-2xl border border-sand p-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50 mb-2">Thanh toán</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span className="text-ink/60">Tạm tính</span><span>{formatVND(order.subtotal)}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-leaf"><span>Giảm giá</span><span>−{formatVND(order.discount)}</span></div>}
                <div className="flex justify-between"><span className="text-ink/60">Phí ship</span><span>{order.shippingFee === 0 ? 'Miễn phí' : formatVND(order.shippingFee)}</span></div>
                <div className="flex justify-between font-bold text-ink border-t border-sand pt-1.5 mt-1.5"><span>Tổng</span><span className="text-rose">{formatVND(order.total)}</span></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-sand p-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50 mb-3">Sản phẩm ({(order.items || []).length})</h3>
            <div className="space-y-3">
              {(order.items || []).map((it, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={it.image} alt={it.name} className="w-12 h-12 rounded-xl object-cover" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{it.name}</p>
                    <p className="text-xs text-ink/50">Size {it.size} × {it.qty}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatVND(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-sand p-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-ink/50 mb-3">Lịch sử đơn hàng</h3>
            <div className="space-y-0">
              {(order.timeline || []).map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`w-3 h-3 rounded-full mt-1 ${i === order.timeline.length - 1 ? 'bg-rose' : 'bg-sand'}`} />
                    {i < order.timeline.length - 1 && <span className="w-px flex-1 bg-sand" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-ink">{ORDER_STATUS_LABEL[t.status] || t.status}</p>
                    {t.note && <p className="text-xs text-ink/50">{t.note}</p>}
                    <p className="text-[11px] text-ink/40">{formatDateTime(t.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {actions.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {actions.map((a) => (
                <button
                  key={a.status}
                  disabled={updating}
                  onClick={() => onStatus(order.code, a.status, a.label, a.confirm)}
                  className={`rounded-full px-6 py-2.5 text-sm font-semibold transition cursor-pointer disabled:opacity-50 ${a.cls}`}
                >
                  {updating ? 'Đang xử lý...' : a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= Tab sản phẩm ================= */
function ProductsTab({ products, categories, onAdd, onEdit, onDelete }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const catName = useMemo(() => Object.fromEntries((categories || []).map((c) => [c.id, c.name])), [categories]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter((p) => {
      const okCat = cat === 'all' || p.categoryId === cat;
      const okQ = !s || p.name.toLowerCase().includes(s) || p.slug.includes(s);
      return okCat && okQ;
    });
  }, [products, q, cat]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" fontSize="small" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="w-full rounded-xl border border-sand bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/25"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-xl border border-sand bg-white px-4 py-2.5 text-sm outline-none focus:border-rose"
        >
          <option value="all">Tất cả danh mục</option>
          {(categories || []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-ink-soft cursor-pointer"
        >
          <Add fontSize="small" /> Thêm sản phẩm
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Không có sản phẩm" description="Thử đổi từ khóa tìm kiếm hoặc thêm sản phẩm mới." />
      ) : (
        <div className="bg-white rounded-2xl border border-sand shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink/50 border-b border-sand">
                  <th className="px-5 py-3.5 font-semibold">Sản phẩm</th>
                  <th className="px-5 py-3.5 font-semibold">Danh mục</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Giá</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Tồn kho</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Đánh giá</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-sand/60 last:border-0 hover:bg-cream/60 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]} alt={p.name} className="w-11 h-11 rounded-xl object-cover" loading="lazy" />
                        <div className="min-w-0">
                          <p className="font-medium text-ink truncate max-w-[240px]">{p.name}</p>
                          <p className="text-xs text-ink/40">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink/70">{catName[p.categoryId] || p.categoryId}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-semibold">{formatVND(p.price)}</span>
                      {p.oldPrice > p.price && (
                        <span className="block text-xs text-ink/40 line-through">{formatVND(p.oldPrice)}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                        (p.stock ?? 0) <= 0 ? 'bg-red-100 text-red-700'
                        : (p.stock ?? 0) < 10 ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-ink/70">
                      {p.rating ? `${Number(p.rating).toFixed(1)} ★` : '—'}
                      <span className="block text-xs text-ink/40">{p.reviewCount || 0} đánh giá</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(p)}
                          aria-label="Sửa"
                          className="p-2 rounded-lg border border-sand text-ink/70 transition hover:border-ink hover:text-ink cursor-pointer"
                        >
                          <Edit fontSize="small" />
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          aria-label="Xóa"
                          className="p-2 rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 cursor-pointer"
                        >
                          <Delete fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Modal thêm/sửa sản phẩm ================= */
const inputCls =
  'w-full rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/25';

function ProductModal({ initial, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    price: initial?.price || '',
    oldPrice: initial?.oldPrice || '',
    stock: initial?.stock ?? 20,
    categoryId: initial?.categoryId || 'c1',
    description: initial?.description || '',
    image: initial?.images?.[0] || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        price: Number(form.price),
        oldPrice: form.oldPrice === '' ? null : Number(form.oldPrice),
        stock: Number(form.stock),
        categoryId: form.categoryId,
        description: form.description.trim(),
        ...(form.image.trim() ? { image: form.image.trim() } : {}),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60" onClick={onClose} />
      <div className="relative bg-cream w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
        <div className="sticky top-0 bg-cream/95 backdrop-blur px-6 py-4 flex items-center justify-between border-b border-sand z-10">
          <h2 className="font-display text-xl font-bold text-ink">
            {initial ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button onClick={onClose} aria-label="Đóng" className="p-2 rounded-full hover:bg-sand/60 transition cursor-pointer">
            <Close />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 grid gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Tên sản phẩm *</label>
            <input value={form.name} onChange={set('name')} placeholder="VD: Bó Hồng Kem Sang Trọng" className={inputCls} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Giá bán (₫) *</label>
              <input type="number" min="1" value={form.price} onChange={set('price')} placeholder="450000" className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Giá gốc (₫)</label>
              <input type="number" min="0" value={form.oldPrice} onChange={set('oldPrice')} placeholder="Để trống nếu không giảm" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Tồn kho</label>
              <input type="number" min="0" value={form.stock} onChange={set('stock')} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Danh mục</label>
            <select value={form.categoryId} onChange={set('categoryId')} className={inputCls}>
              {(categories || []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Link ảnh</label>
            <div className="flex gap-3 items-start">
              <input value={form.image} onChange={set('image')} placeholder="https://... (để trống dùng ảnh mặc định)" className={`${inputCls} flex-1`} />
              {form.image.trim() && (
                <img src={form.image.trim()} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-sand" />
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Mô tả</label>
            <textarea value={form.description} onChange={set('description')} rows={4} placeholder="Mô tả chi tiết sản phẩm..." className={inputCls} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-6 py-2.5 text-sm font-semibold border border-sand text-ink transition hover:border-ink cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full px-6 py-2.5 text-sm font-semibold bg-ink text-cream transition hover:bg-ink-soft disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Đang lưu...' : initial ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= Tab người dùng ================= */
function UsersTab({ users, currentUserId, onRoleChange, onDelete }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (users || []).filter((u) =>
      !s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || (u.phone || '').includes(s),
    );
  }, [users, q]);

  return (
    <div>
      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" fontSize="small" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm tên, email, SĐT..."
          className="w-full rounded-xl border border-sand bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/25"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Không có người dùng" description="Thử đổi từ khóa tìm kiếm." />
      ) : (
        <div className="bg-white rounded-2xl border border-sand shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink/50 border-b border-sand">
                  <th className="px-5 py-3.5 font-semibold">Người dùng</th>
                  <th className="px-5 py-3.5 font-semibold">Liên hệ</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Đơn hàng</th>
                  <th className="px-5 py-3.5 font-semibold">Vai trò</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-sand/60 last:border-0 hover:bg-cream/60 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                        ) : (
                          <span className="w-10 h-10 rounded-full bg-sand flex items-center justify-center font-bold text-ink/60">
                            {u.name.charAt(0)}
                          </span>
                        )}
                        <div>
                          <p className="font-medium text-ink">
                            {u.name}
                            {u.id === currentUserId && (
                              <span className="ml-2 text-[10px] font-bold uppercase bg-ink text-cream px-2 py-0.5 rounded-full">Bạn</span>
                            )}
                          </p>
                          <p className="text-xs text-ink/50">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink/70">
                      {u.phone || '—'}
                      <span className="block text-xs text-ink/40">{u.addresses} địa chỉ đã lưu</span>
                    </td>
                    <td className="px-5 py-3 text-center font-semibold">{u.orders}</td>
                    <td className="px-5 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => onRoleChange(u, e.target.value)}
                        disabled={u.id === currentUserId}
                        className={`rounded-lg border text-xs font-semibold px-2.5 py-1.5 outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                          u.role === 'admin' ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-sand bg-white text-ink/70'
                        }`}
                        title={u.id === currentUserId ? 'Không thể đổi vai trò của chính mình' : 'Đổi vai trò'}
                      >
                        <option value="customer">{ROLE_LABEL.customer}</option>
                        <option value="admin">{ROLE_LABEL.admin}</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => onDelete(u)}
                        disabled={u.id === currentUserId}
                        aria-label="Xóa người dùng"
                        title={u.id === currentUserId ? 'Không thể xóa chính mình' : 'Xóa người dùng'}
                        className="p-2 rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Delete fontSize="small" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
