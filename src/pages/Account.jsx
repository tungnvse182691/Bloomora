import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Person from '@mui/icons-material/Person';
import LocationOn from '@mui/icons-material/LocationOn';
import ReceiptLong from '@mui/icons-material/ReceiptLong';
import Lock from '@mui/icons-material/Lock';
import Logout from '@mui/icons-material/Logout';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import { useAuthStore } from '../store/useAuthStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getOrders, cancelOrder } from '../services/order.service';
import { ORDER_STATUS_LABEL } from '../utils/constants';
import { formatVND, formatDateTime } from '../utils/format';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-sky-100 text-sky-800',
  shipping: 'bg-violet-100 text-violet-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
};

const inputCls =
  'w-full rounded-xl border border-sand bg-cream px-4 py-2.5 text-ink placeholder:text-ink/40 outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/25';

const TABS = [
  { id: 'profile', label: 'Hồ sơ', icon: <Person /> },
  { id: 'addresses', label: 'Sổ địa chỉ', icon: <LocationOn /> },
  { id: 'orders', label: 'Đơn hàng', icon: <ReceiptLong /> },
  { id: 'password', label: 'Đổi mật khẩu', icon: <Lock /> },
];

const emptyAddress = { name: '', phone: '', address: '', ward: '', district: '', city: '', isDefault: false };

export default function Account() {
  useDocumentTitle('Tài khoản | Bloomora');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [tab, setTab] = useState('profile');

  // ---- Hồ sơ (local mock) ----
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });

  // ---- Sổ địa chỉ (local mock) ----
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // address object hoặc null (thêm mới)
  const [addrForm, setAddrForm] = useState(emptyAddress);

  // ---- Đơn hàng ----
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // ---- Đổi mật khẩu (mock) ----
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user?.id) loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(false);
    try {
      const { items } = (await getOrders(user.id)) || {};
      setOrders(items || []);
    } catch {
      setOrdersError(true);
      toast.error('Không tải được danh sách đơn hàng');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    navigate('/');
  };

  // ---------- render từng tab ----------
  const renderProfile = () => (
    <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-5">
        <img
          src={user?.avatar}
          alt={user?.name}
          className="h-20 w-20 rounded-full border-2 border-rose/30 object-cover"
        />
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">{user?.name}</h2>
          <p className="text-sm text-ink/50">{user?.email}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Họ và tên">
          <input className={inputCls} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        </Field>
        <Field label="Số điện thoại">
          <input className={inputCls} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Email">
            <input className={`${inputCls} cursor-not-allowed opacity-60`} value={user?.email || ''} readOnly disabled />
          </Field>
        </div>
      </div>
      <Button
        className="mt-6"
        onClick={() => {
          if (!profile.name.trim()) return toast.error('Vui lòng nhập họ tên');
          toast.success('Đã cập nhật hồ sơ');
        }}
      >
        Lưu thay đổi
      </Button>
    </div>
  );

  const openAddressModal = (addr = null) => {
    setEditing(addr);
    setAddrForm(addr ? { ...addr } : { ...emptyAddress });
    setModalOpen(true);
  };

  const saveAddress = () => {
    if (!addrForm.name.trim() || !addrForm.phone.trim() || !addrForm.address.trim()) {
      return toast.error('Vui lòng điền họ tên, số điện thoại và địa chỉ');
    }
    if (editing) {
      setAddresses((list) => list.map((a) => (a.id === editing.id ? { ...addrForm, id: editing.id } : a)));
      toast.success('Đã cập nhật địa chỉ');
    } else {
      const isFirst = addresses.length === 0;
      const newAddr = { ...addrForm, id: `a${Date.now()}`, isDefault: isFirst || addrForm.isDefault };
      setAddresses((list) =>
        newAddr.isDefault ? list.map((a) => ({ ...a, isDefault: false })).concat(newAddr) : [...list, newAddr],
      );
      toast.success('Đã thêm địa chỉ mới');
    }
    setModalOpen(false);
  };

  const renderAddresses = () => (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Sổ địa chỉ ({addresses.length})</h2>
        <Button onClick={() => openAddressModal()} className="!px-4 !py-2 text-sm">
          <Add fontSize="small" /> Thêm địa chỉ
        </Button>
      </div>
      {addresses.length === 0 ? (
        <EmptyState
          icon={<LocationOn fontSize="large" />}
          title="Chưa có địa chỉ nào"
          description="Thêm địa chỉ để đặt hoa nhanh hơn ở lần sau."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className={`relative rounded-2xl border bg-white p-5 ${a.isDefault ? 'border-rose' : 'border-sand'}`}>
              {a.isDefault && (
                <span className="absolute right-4 top-4 rounded-full bg-rose/10 px-3 py-1 text-xs font-semibold text-rose-deep">
                  Mặc định
                </span>
              )}
              <p className="font-semibold text-ink">{a.name} <span className="font-normal text-ink/50">· {a.phone}</span></p>
              <p className="mt-1 text-sm text-ink/60">{a.address}, {a.ward}, {a.district}, {a.city}</p>
              <div className="mt-4 flex gap-2 text-sm">
                <button onClick={() => openAddressModal(a)} className="flex items-center gap-1 text-ink/60 hover:text-rose-deep">
                  <Edit fontSize="small" /> Sửa
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Xóa địa chỉ này?')) {
                      setAddresses((list) => list.filter((x) => x.id !== a.id));
                      toast.success('Đã xóa địa chỉ');
                    }
                  }}
                  className="flex items-center gap-1 text-ink/60 hover:text-red-600"
                >
                  <Delete fontSize="small" /> Xóa
                </button>
                {!a.isDefault && (
                  <button
                    onClick={() => {
                      setAddresses((list) => list.map((x) => ({ ...x, isDefault: x.id === a.id })));
                      toast.success('Đã đặt làm địa chỉ mặc định');
                    }}
                    className="font-medium text-rose-deep hover:underline"
                  >
                    Đặt mặc định
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-semibold text-ink">{editing ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
            <div className="mt-4 grid gap-3">
              <Field label="Họ tên người nhận">
                <input className={inputCls} value={addrForm.name} onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })} />
              </Field>
              <Field label="Số điện thoại">
                <input className={inputCls} value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} />
              </Field>
              <Field label="Địa chỉ (số nhà, đường)">
                <input className={inputCls} value={addrForm.address} onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phường/Xã">
                  <input className={inputCls} value={addrForm.ward} onChange={(e) => setAddrForm({ ...addrForm, ward: e.target.value })} />
                </Field>
                <Field label="Quận/Huyện">
                  <input className={inputCls} value={addrForm.district} onChange={(e) => setAddrForm({ ...addrForm, district: e.target.value })} />
                </Field>
              </div>
              <Field label="Tỉnh/Thành phố">
                <input className={inputCls} value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} />
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink/60 hover:bg-cream">
                Hủy
              </button>
              <Button onClick={saveAddress} className="!px-6 !py-2.5 text-sm">Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const handleCancelOrder = async (code) => {
    if (!window.confirm(`Bạn chắc chắn muốn hủy đơn ${code}?`)) return;
    try {
      await cancelOrder(code);
      toast.success(`Đã hủy đơn ${code}`);
      loadOrders();
    } catch (err) {
      toast.error(err?.message || 'Hủy đơn thất bại');
    }
  };

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

  const renderOrders = () => (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {['all', ...Object.keys(ORDER_STATUS_LABEL)].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              statusFilter === s ? 'bg-ink text-cream' : 'bg-white text-ink/60 border border-sand hover:border-ink/30'
            }`}
          >
            {s === 'all' ? 'Tất cả' : ORDER_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {ordersLoading ? (
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-sand/50" />
          ))}
        </div>
      ) : ordersError ? (
        <EmptyState
          icon={<ReceiptLong fontSize="large" />}
          title="Không tải được đơn hàng"
          description="Đã có lỗi xảy ra, vui lòng thử lại sau."
          action={
            <button onClick={loadOrders} className="rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-ink-soft">
              Tải lại
            </button>
          }
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ReceiptLong fontSize="large" />}
          title="Chưa có đơn hàng"
          description={statusFilter === 'all' ? 'Bạn chưa đặt đơn nào. Khám phá những bó hoa tươi đẹp nhất nhé!' : 'Không có đơn hàng nào ở trạng thái này.'}
          action={
            statusFilter === 'all' ? (
              <Link to="/shop" className="rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-ink-soft">
                Mua sắm ngay
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-sand bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">{o.code}</p>
                  <p className="text-xs text-ink/50">Đặt lúc {formatDateTime(o.createdAt)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[o.status]}`}>
                  {ORDER_STATUS_LABEL[o.status]}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex -space-x-3">
                  {o.items.slice(0, 3).map((it) => (
                    <img key={it.productId} src={it.image} alt={it.name} className="h-10 w-10 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
                <p className="text-sm text-ink/60">
                  {o.items.length} sản phẩm · Tổng <span className="font-semibold text-ink">{formatVND(o.total)}</span>
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/account/orders/${o.code}`}
                  className="rounded-xl border border-sand px-4 py-2 text-sm font-medium text-ink transition hover:border-ink"
                >
                  Chi tiết
                </Link>
                {(o.status === 'pending' || o.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancelOrder(o.code)}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Hủy đơn
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPassword = () => (
    <div className="max-w-md rounded-3xl border border-sand bg-white p-6 shadow-sm md:p-8">
      <h2 className="font-display text-xl font-semibold text-ink">Đổi mật khẩu</h2>
      <div className="mt-5 grid gap-4">
        <Field label="Mật khẩu hiện tại" error={pwError && !pwForm.current ? 'Vui lòng nhập mật khẩu hiện tại' : undefined}>
          <input type="password" className={inputCls} value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
        </Field>
        <Field label="Mật khẩu mới">
          <input type="password" className={inputCls} value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} />
        </Field>
        <Field label="Xác nhận mật khẩu mới" error={pwError || undefined}>
          <input type="password" className={inputCls} value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
        </Field>
      </div>
      <Button
        className="mt-6"
        onClick={() => {
          setPwError('');
          if (!pwForm.current) return;
          if (pwForm.next.length < 6) return setPwError('Mật khẩu mới tối thiểu 6 ký tự');
          if (pwForm.next !== pwForm.confirm) return setPwError('Mật khẩu xác nhận không khớp');
          setPwForm({ current: '', next: '', confirm: '' });
          toast.success('Đổi mật khẩu thành công');
        }}
      >
        Đổi mật khẩu
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">Tài khoản của tôi</h1>
          <p className="mt-1 text-ink/60">Quản lý thông tin, địa chỉ và đơn hàng của bạn.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-sand bg-white px-4 py-2.5 text-sm font-medium text-ink/70 transition hover:border-red-300 hover:text-red-600"
        >
          <Logout fontSize="small" /> Đăng xuất
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                tab === t.id ? 'bg-ink text-cream shadow-md' : 'bg-white text-ink/60 border border-sand hover:border-ink/30'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {tab === 'profile' && renderProfile()}
          {tab === 'addresses' && renderAddresses()}
          {tab === 'orders' && renderOrders()}
          {tab === 'password' && renderPassword()}
        </div>
      </div>
    </div>
  );
}
